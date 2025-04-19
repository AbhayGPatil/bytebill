import os
import json
from datetime import datetime
from google.cloud import vision
from google.cloud import bigquery
from google.oauth2 import service_account
from dateutil import parser
import vertexai
from vertexai.generative_models import GenerativeModel

# 🔐 Setup Google Cloud credentials
credentials = service_account.Credentials.from_service_account_file("creds.json")
vertexai.init(project="bytebill-2222", location="us-central1", credentials=credentials)

# 🔍 OCR using Vision API
def extract_text_from_file(file_path):
    client = vision.ImageAnnotatorClient(credentials=credentials)
    with open(file_path, "rb") as f:
        content = f.read()

    image = vision.Image(content=content)
    response = client.text_detection(image=image)
    texts = response.text_annotations

    if texts:
        return texts[0].description
    else:
        raise ValueError("No text found in the file. OCR failed.")

# 🧠 Use Gemini to intelligently extract fields
def extract_fields_and_store(file_path):
    # Step 1: OCR
    try:
        text = extract_text_from_file(file_path)
    except ValueError as e:
        print(f"❌ Error extracting text: {e}")
        raise e

    if not text.strip():
        raise ValueError("Extracted text is empty, cannot proceed.")

    # Step 2: Prompt Gemini
    model = GenerativeModel("gemini-1.5-flash")
    prompt = f"""
    You are an AI that extracts data from bill text. Extract only the following fields:
    - Date of the bill
    - Recipient / Vendor name
    - Total Amount (final amount on the bill)
    - Category (like food, travel, groceries etc — infer if missing)

    ONLY return JSON with these keys: date, recipient, category, amount.
    Do NOT explain anything. Do NOT include markdown. Only return raw JSON.

    Bill Text:
    {text}
    """
    try:
        result = model.generate_content(prompt)
        raw_response = result.text.strip()
    except Exception as e:
        print(f"❌ Error generating content from Gemini: {e}")
        raise e

    # Step 3: Parse Gemini Response
    try:
        fields = json.loads(raw_response)
    except json.JSONDecodeError as e:
        print("❌ Error parsing JSON from Gemini:", e)
        print("Raw Gemini response:", raw_response)
        raise ValueError("Failed to parse extracted fields from Gemini response.")

    # Step 4: Clean & Validate Fields (safe .strip())
    raw_date = (fields.get("date") or "").strip()
    try:
        parsed_date = parser.parse(raw_date).date().isoformat()
    except (ValueError, TypeError):
        parsed_date = datetime.utcnow().date().isoformat()  # fallback to today's date

    recipient = (fields.get("recipient") or "Unknown").strip()
    category = (fields.get("category") or "Uncategorized").strip()

    try:
        raw_amount = str(fields.get("amount", "0")).replace("₹", "").replace(",", "").strip()
        amount = float(raw_amount)
    except (ValueError, TypeError):
        amount = 0.0

    # Step 5: Insert into BigQuery
    try:
        bq_client = bigquery.Client(credentials=credentials, project=credentials.project_id)
        table_id = "bytebill-2222.bytebill_dataset.expenses"

        row = {
            "date": parsed_date,
            "recipient": recipient,
            "category": category,
            "amount": amount,
            "raw_text": text,
            "timestamp": datetime.utcnow().isoformat()
        }

        errors = bq_client.insert_rows_json(table_id, [row])
        if errors:
            print("❌ BigQuery insertion errors:", errors)
            raise Exception("Failed to insert into BigQuery")
    except Exception as e:
        print(f"❌ Error inserting into BigQuery: {e}")
        raise e

    return {
        "date": parsed_date,
        "recipient": recipient,
        "category": category,
        "amount": amount
    }
    