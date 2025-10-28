from flask import Flask, request, jsonify
import pymysql

app = Flask(__name__)

# 连接 MySQL 数据库
def connect_to_mysql():
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='123456',
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
            'message': 'Database connection successful'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/ask', methods=['POST'])
def ask():
    return jsonify({
        'answer': 'Simple Flask backend is running. Full RAG functionality requires Ollama and additional dependencies.',
        'file_keywords': []
    })

if __name__ == '__main__':
    print("Starting Flask server on port 5000...")
    app.run(debug=True, host='0.0.0.0', port=5000)
