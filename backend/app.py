from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from extract_data import extract_fields_and_store
from google.cloud import bigquery
from google.oauth2 import service_account

app = Flask(__name__)
CORS(app)

# Create temp folder if it doesn’t exist
if not os.path.exists("temp"):
    os.makedirs("temp")

# Credentials
credentials = service_account.Credentials.from_service_account_file("creds.json")
bq_client = bigquery.Client(credentials=credentials, project=credentials.project_id)

# Upload route
@app.route('/upload', methods=['POST'])
def upload():
    try:
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No selected file'}), 400

        file_path = os.path.join("temp", file.filename)
        file.save(file_path)

        extracted_data = extract_fields_and_store(file_path)
        return jsonify({'status': 'success', 'data': extracted_data})
    except Exception as e:
        app.logger.error(f"❌ Error processing file: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
