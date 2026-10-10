import sys
import json
import base64
import os

try:
    import fitz  # PyMuPDF
except ImportError:
    print(json.dumps({"success": False, "error": "PyMuPDF (fitz) is not installed"}))
    sys.exit(0)

def main():
    try:
        raw_input = ""
        if len(sys.argv) > 1 and os.path.isfile(sys.argv[1]):
            with open(sys.argv[1], "r", encoding="utf-8") as f:
                raw_input = f.read()
        else:
            raw_input = sys.stdin.read()

        if not raw_input.strip():
            print(json.dumps({"success": False, "error": "No input provided"}))
            return

        data = json.loads(raw_input)
        data_url = data.get("dataUrl", "")
        max_pages = data.get("maxPages", 2)
        max_width = data.get("maxWidth", 768)

        if not data_url:
            print(json.dumps({"success": False, "error": "No dataUrl in input"}))
            return

        # Extract base64 payload
        if "," in data_url:
            b64_str = data_url.split(",", 1)[1]
        else:
            b64_str = data_url

        pdf_bytes = base64.b64decode(b64_str)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        pages_text = []
        page_images = []
        total_pages = len(doc)

        for i in range(total_pages):
            page = doc[i]
            t = page.get_text().strip()
            if t:
                pages_text.append(f"--- Page {i + 1} of {total_pages} ---\n{t}")

            # Render up to max_pages
            if i < max_pages:
                rect = page.rect
                zoom = 1.0
                if rect.width > 0:
                    zoom = min(1.5, max(0.6, max_width / rect.width))
                mat = fitz.Matrix(zoom, zoom)
                pix = page.get_pixmap(matrix=mat, alpha=False)
                # Use JPEG for photographic / scanned docs, with quality 80 for low RAM footprint
                img_bytes = pix.tobytes("jpeg", jpg_quality=80)
                b64_img = base64.b64encode(img_bytes).decode("utf-8")
                page_images.append(f"data:image/jpeg;base64,{b64_img}")

        doc.close()

        full_text = "\n\n".join(pages_text)

        result = {
            "success": True,
            "page_count": total_pages,
            "text": full_text,
            "images": page_images,
        }
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    main()
