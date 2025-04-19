from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from extract_data import extract_fields_and_store
from google.cloud import bigquery
from google.oauth2 import service_account
from datetime import date, datetime
import google.generativeai as genai
import requests

# 🔐 Configure Gemini API
genai.configure(api_key="AIzaSyCTIfIb2sS6km-d5KcbbWzXU4NrqNxfEA0")  # Replace with actual API key
model = genai.GenerativeModel("gemini-1.5-flash")

# 🛠️ App Setup
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], methods=["GET", "POST", "OPTIONS"])

# 🔐 GCP Credentials
credentials = service_account.Credentials.from_service_account_file("creds.json")
bq_client = bigquery.Client(credentials=credentials, project=credentials.project_id)
table_id = "bytebill-2222.bytebill_dataset.expenses"

# 📁 Ensure temp folder exists
os.makedirs("temp", exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload():
    try:
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file uploaded'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No file selected'}), 400

        # uid = request.form.get('uid')
        file_path = os.path.join("temp", file.filename)
        file.save(file_path)

        extracted_data = extract_fields_and_store(file_path)
        return jsonify({'status': 'success', 'data': extracted_data})
    except Exception as e:
        app.logger.error(f"❌ Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/monthly_trends', methods=['GET'])
def monthly_trends():
    try:
        query = f"""
            SELECT FORMAT_DATE('%Y-%m', DATE(date)) AS month, SUM(amount) AS total
            FROM `{table_id}`
            GROUP BY month
            ORDER BY month
        """
        results = bq_client.query(query).result()
        return jsonify([{"month": row.month, "total": row.total} for row in results])
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/category_pie', methods=['GET'])
def category_pie():
    try:
        query = f"""
            SELECT category, SUM(amount) AS total
            FROM `{table_id}`
            GROUP BY category
            ORDER BY total DESC
        """
        results = bq_client.query(query).result()
        return jsonify([{"category": row.category, "total": row.total} for row in results])
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/anomalies', methods=['GET'])
def anomalies():
    try:
        query = f"""
            WITH category_avg AS (
                SELECT category, AVG(amount) AS avg_amount
                FROM `{table_id}`
                GROUP BY category
            )
            SELECT e.date, e.recipient, e.category, e.amount
            FROM `{table_id}` e
            JOIN category_avg c ON e.category = c.category
            WHERE e.amount > 2 * c.avg_amount
            ORDER BY e.amount DESC
            LIMIT 5
        """
        results = bq_client.query(query).result()
        return jsonify([{
            "date": row.date.isoformat(),
            "recipient": row.recipient,
            "category": row.category,
            "amount": row.amount
        } for row in results])
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/predicted_next_month', methods=['GET'])
def predicted_next_month():
    try:
        query = f"""
            SELECT FORMAT_DATE('%Y-%m', DATE(date)) AS month, SUM(amount) AS total
            FROM `{table_id}`
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6
        """
        rows = list(bq_client.query(query).result())
        if len(rows) < 2:
            return jsonify({"message": "Not enough data to predict."}), 400
        totals = [row.total for row in rows]
        prediction = sum(totals) / len(totals)
        return jsonify({
            "predicted_month": "Next Month",
            "predicted_total": round(prediction, 2),
            "last_6_months": [{"month": row.month, "total": row.total} for row in rows]
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/all_data', methods=['GET'])
def all_data():
    try:
        uid = request.args.get('uid')
        if uid:
            query = f"SELECT * FROM `{table_id}` WHERE uid = '{uid}' ORDER BY date DESC"
        else:
            query = f"SELECT * FROM `{table_id}` ORDER BY date DESC"
        results = bq_client.query(query).result()
        return jsonify([serialize_row(row) for row in results])
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

def serialize_row(row):
    return {
        k: (v.isoformat() if isinstance(v, (date, datetime)) else v)
        for k, v in dict(row).items()
    }

@app.route('/savings_suggestions', methods=['POST'])
def savings_suggestions():
    try:
        # Retrieve the data from the request body
        data = request.json

        # 📦 Create a structured prompt for Gemini
        prompt = f"""
        Analyze the following user's financial data and provide dynamic savings suggestions in a structured, bullet-point format.

        🔹 All Transactions Data:
        {data['all_data'][:10]}... (showing 10 out of {len(data['all_data']) if isinstance(data['all_data'], list) else 0})

        📈 Monthly Trends:
        {data['monthly_trends']}

        🧾 Category-wise Spending:
        {data['category_pie']}

        ❗ Spending Anomalies:
        {data['anomalies']}

        🔮 Predicted Next Month's Spend:
        {data['predicted_next_month']}

        🎯 Provide your suggestions in the following format:
        - "Your grocery spending has increased by 12%. You might want to reconsider your shopping habits."
        - "Your shopping expenses have surged by 30%. It could be helpful to set a monthly budget for shopping."
        - "It looks like your total spending on dining out has decreased by 8%. Keep up the good work!"
        - Ensure the response is formatted with clear bullet points, each addressing a different aspect.
        """

        # 🧠 Ask Gemini
        response = model.generate_content(prompt)
        suggestion = response.text.strip()

        return jsonify({"status": "success", "suggestions": suggestion})

    except Exception as e:
        app.logger.error(f"❌ Suggestion Generation Error: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500



if __name__ == '__main__':
    print("📡 Available routes:")
    for rule in app.url_map.iter_rules():
        print(f"➡️ {rule.rule}  [{','.join(rule.methods)}]")
    app.run(debug=True)
