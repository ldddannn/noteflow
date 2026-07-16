from pyngrok import ngrok
import time

try:
    http_tunnel = ngrok.connect(3000)
    print(f"✅ Frontend URL: {http_tunnel.public_url}")
    print("🚀 NoteFlow is now accessible online!")
    print("Press Ctrl+C to stop...")
    
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    ngrok.kill()