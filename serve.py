import http.server
import socketserver
import urllib.request
import urllib.error
import os
import shutil

PORT = 8000
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), 'frontend', '.next', 'static')
PAGES_DIR = os.path.join(os.path.dirname(__file__), 'frontend', '.next', 'server', 'app')

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/api/'):
            self.proxy_api()
        elif self.path.startswith('/_next/'):
            self.serve_static()
        else:
            self.serve_page()
    
    def do_POST(self):
        if self.path.startswith('/api/'):
            self.proxy_api()
        else:
            self.send_error(404)
    
    def do_PUT(self):
        if self.path.startswith('/api/'):
            self.proxy_api()
        else:
            self.send_error(404)
    
    def do_DELETE(self):
        if self.path.startswith('/api/'):
            self.proxy_api()
        else:
            self.send_error(404)
    
    def proxy_api(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else None
        
        target_url = f'http://localhost:5000{self.path}'
        headers = {k: v for k, v in self.headers.items() if k.lower() not in ['host', 'content-length']}
        
        req = urllib.request.Request(target_url, data=body, headers=headers, method=self.command)
        
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                self.send_response(response.status)
                for header in response.headers:
                    if header.lower() not in ['content-length', 'transfer-encoding', 'connection']:
                        self.send_header(header, response.headers[header])
                self.end_headers()
                self.wfile.write(response.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for header in e.headers:
                if header.lower() not in ['content-length', 'transfer-encoding', 'connection']:
                    self.send_header(header, e.headers[header])
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())
    
    def serve_static(self):
        file_path = os.path.join(FRONTEND_DIR, self.path[6:])
        if os.path.exists(file_path) and os.path.isfile(file_path):
            with open(file_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            if file_path.endswith('.js'):
                self.send_header('Content-Type', 'application/javascript')
            elif file_path.endswith('.css'):
                self.send_header('Content-Type', 'text/css')
            elif file_path.endswith('.json'):
                self.send_header('Content-Type', 'application/json')
            elif file_path.endswith('.png'):
                self.send_header('Content-Type', 'image/png')
            elif file_path.endswith('.jpg') or file_path.endswith('.jpeg'):
                self.send_header('Content-Type', 'image/jpeg')
            elif file_path.endswith('.svg'):
                self.send_header('Content-Type', 'image/svg+xml')
            elif file_path.endswith('.woff') or file_path.endswith('.woff2'):
                self.send_header('Content-Type', 'font/woff2')
            self.end_headers()
            self.wfile.write(content)
        else:
            self.send_error(404)
    
    def serve_page(self):
        page_path = self.path
        if page_path == '/':
            page_path = '/index'
        
        html_file = os.path.join(PAGES_DIR, page_path.lstrip('/'), 'page.html')
        if os.path.exists(html_file):
            with open(html_file, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(content)
        elif os.path.exists(html_file.replace('/page.html', '.html')):
            with open(html_file.replace('/page.html', '.html'), 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            self.wfile.write(content)
        else:
            index_file = os.path.join(PAGES_DIR, 'index.html')
            if os.path.exists(index_file):
                with open(index_file, 'rb') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/html')
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404)

if __name__ == '__main__':
    with socketserver.TCPServer(('', PORT), Handler) as httpd:
        print(f'🚀 NoteFlow server running on http://localhost:{PORT}')
        print(f'📁 Serving frontend from: {FRONTEND_DIR}')
        print('Press Ctrl+C to stop...')
        httpd.serve_forever()