import os
import google.generativeai as genai

# 🔐 Load Gemini API key
genai.configure(api_key="AIzaSyCTIfIb2sS6km-d5KcbbWzXU4NrqNxfEA0")  # Store securely in production

# ✨ Initialize Gemini model
model = genai.GenerativeModel("gemini-1.5-flash")

def generate_savings_hack(data):
    """
    Generates AI-powered savings suggestions using Gemini API based on the user's financial data.

    Input:
        data (dict): A dictionary containing:
            - monthly_trends
            - category_pie
            - anomalies
            - predicted_next_month

    Output:
        str: Max 4 bullet-point suggestions (each a single, friendly, actionable sentence).
    """
    prompt = f"""

You are a smart, friendly financial assistant. Based on the user's monthly financial data, generate **only 4** clear and actionable savings suggestions.

Strict rules:
- Format exactly 4 bullet points, no more or less.
- Each bullet should be one short, helpful sentence.
- Avoid all symbols like asterisks (*), hashtags (#), or emojis.
- Do NOT mention or repeat exact values or percentages.
- Make your suggestions friendly and encouraging.
- Base your advice accurately on the data provided, such as trends, category spending, anomalies, and predictions.
Make sure you follow the instructions strictly

User Data:
Monthly Trends:
{data['monthly_trends']}

Category-wise Spending:
{data['category_pie']}

Anomalies:
{data['anomalies']}

Predicted Next Month Spend:
{data['predicted_next_month']}

Your Response:
"""

    response = model.generate_content(prompt)
    suggestion = response.text.strip()
    return suggestion
