from flask import Flask, send_from_directory, request, Response
import requests

app = Flask(__name__, static_folder='frontend/.next/static', static_url_path='/_next/static')

FRONTEND_DIR = 'frontend/.next'

@app.route('/_next/<path:path>')
def next_static(path):
    return send_from_directory(f'{FRONTEND_DIR}/static', path)

@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy_api(path):
    url = f'http://localhost:5000/api/{path}'
    headers = {k: v for k, v in request.headers if k.lower() not in ['host', 'content-length']}
    try:
        resp = requests.request(
            method=request.method,
            url=url,
            headers=headers,
            data=request.get_data(),
            params=request.args,
            timeout=30
        )
        excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
        headers = [(k, v) for k, v in resp.raw.headers.items() if k.lower() not in excluded_headers]
        return Response(resp.content, resp.status_code, headers)
    except Exception as e:
        return str(e), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    if path.startswith('api/'):
        return proxy_api(path[4:])
    return send_from_directory(FRONTEND_DIR, 'server/app/index.html')

if __name__ == '__main__':
    print('🚀 NoteFlow unified server running on http://localhost:8080')
    app.run(host='0.0.0.0', port=8080, debug=True)