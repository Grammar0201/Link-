from flask import Flask, request, jsonify
import pymysql
import requests

app = Flask(__name__)

# DeepSeek API 配置
DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_API_KEY = "sk-2f7043cb349f4c68bfeeb71743c42100"  # 请替换为你自己的 API Key

# 连接 MySQL 数据库
def connect_to_mysql():
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='Gkm104021',
        database='linknote',
        cursorclass=pymysql.cursors.DictCursor
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
        # 调用 DeepSeek API
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
