from pyngrok import ngrok
import time

public_url = ngrok.connect(3000)
print(f"🔗 Public URL: {public_url.public_url}")
print("🚀 NoteFlow is now accessible online!")
print("Press Ctrl+C to stop...")

try:
    while True:
        time.sleep(60)
except KeyboardInterrupt:
    ngrok.disconnect(public_url.public_url)
    ngrok.kill()