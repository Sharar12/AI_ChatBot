import os
import sys
import urllib.request

MODELS_DIR = r"D:\.Github Projects\A.I. Chat\stable-diffusion.cpp\models"
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_URL = "https://huggingface.co/second-state/stable-diffusion-v1-5-GGUF/resolve/main/stable-diffusion-v1-5-pruned-emaonly-Q4_0.gguf"
DEST_FILE = os.path.join(MODELS_DIR, "v1-5-pruned-emaonly-Q4_0.gguf")

if os.path.exists(DEST_FILE):
    print(f"Model already exists at {DEST_FILE}")
    sys.exit(0)

print(f"Downloading {MODEL_URL} to {DEST_FILE}...")
last_pct = -1

def progress(count, block_size, total_size):
    global last_pct
    pct = int(count * block_size * 100 / total_size)
    if pct != last_pct and pct % 5 == 0:
        last_pct = pct
        downloaded_mb = (count * block_size) / (1024 * 1024)
        total_mb = total_size / (1024 * 1024)
        sys.stdout.write(f"\rProgress: {pct}% ({downloaded_mb:.1f} MB / {total_mb:.1f} MB)")
        sys.stdout.flush()

urllib.request.urlretrieve(MODEL_URL, DEST_FILE, progress)
print("\nDownload completed successfully!")
