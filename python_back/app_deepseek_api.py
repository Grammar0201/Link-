import os
from flask import Flask, request, jsonify
import pymysql
import requests

app = Flask(__name__)

# DeepSeek API configuration is loaded from environment variables
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "")

# Database connection configuration via environment variables
DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_USER = os.environ.get("DB_USER", "root")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
DB_NAME = os.environ.get("DB_NAME", "linknote")


def connect_to_mysql():
    connection = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
    )
    return connection


@app.route('/health', methods=['GET'])
def health_check():
    try:
        connection = connect_to_mysql()
        connection.close()
        return jsonify({
            'status': 'ok',
            'message': 'Database connection successful',
            'ai_mode': 'DeepSeek API'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/ask', methods=['POST'])
def ask():
    data = request.get_json()
    question = data.get('question', '')

    if not question:
        return jsonify({'error': 'Question is required'}), 400

    try:
        headers = {
            'Authorization': f'Bearer {DEEPSEEK_API_KEY}',
            'Content-Type': 'application/json'
        }

        payload = {
            'model': 'deepseek-chat',
            'messages': [
                {'role': 'user', 'content': question}
            ]
        }

        response = requests.post(DEEPSEEK_API_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()

        result = response.json()
        answer = result['choices'][0]['message']['content']

        return jsonify({
            'answer': answer,
            'file_keywords': [],
            'ai_mode': 'DeepSeek API'
        })

    except requests.exceptions.RequestException as e:
        return jsonify({
            'answer': f'API 调用失败: {str(e)}',
            'file_keywords': []
        }), 500
    except Exception as e:
        return jsonify({
            'answer': f'处理失败: {str(e)}',
            'file_keywords': []
        }), 500


if __name__ == '__main__':
    print("Starting Flask server with DeepSeek API...")
    print("注意：需要有效的 DeepSeek API Key")
    app.run(debug=True, host='0.0.0.0', port=5000)
