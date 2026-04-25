"""
PDF to MiniMax Image Analysis Pipeline
- If PDF has text: extract text directly
- If PDF has no text: extract images and use MiniMax understand_image
"""

import os
import sys
import base64
import requests
import fitz  # PyMuPDF

# Configuration
API_KEY = "sk-cp-qrZdQlW9fwXmiXIQbPUyvSBPvGoKysEt8hLFBLl2TMjfUgMfGKdXRRJu5vKaWbobVME0gmAU1FNEN46nCWpzKyCpIKtTkFkh119aQMrFORBHOlHNCSdSj5M"
API_HOST = "https://api.minimax.io"
API_URL = f"{API_HOST}/v1/coding_plan/vlm"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "MM-API-Source": "Minimax-MCP"
}


def extract_text_from_pdf(pdf_path):
    """Extract all text from PDF."""
    print(f"[*] Extracting text from PDF...")

    doc = fitz.open(pdf_path)
    all_text = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()

        if text.strip():
            all_text.append(f"[Page {page_num + 1}]\n{text}")
            print(f"    [Page {page_num + 1}] {len(text)} chars extracted")

    doc.close()

    if all_text:
        return "\n\n".join(all_text)
    return None


def extract_images_from_pdf(pdf_path):
    """Extract all images from PDF and save to tmp folder."""
    print(f"[*] Extracting images from PDF...")

    os.makedirs("tmp", exist_ok=True)

    doc = fitz.open(pdf_path)
    image_paths = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        image_list = page.get_images(full=True)

        for img_index, img in enumerate(image_list):
            xref = img[0]
            base = doc.extract_image(xref)
            img_bytes = base["image"]
            img_ext = base["ext"]

            img_name = f"page{page_num + 1}_img{img_index + 1}.{img_ext}"
            img_path = f"tmp/{img_name}"

            with open(img_path, "wb") as f:
                f.write(img_bytes)

            image_paths.append({
                "path": img_path,
                "page": page_num + 1,
                "index": img_index + 1
            })
            print(f"    [Page {page_num + 1}] Saved: {img_path}")

    doc.close()
    return image_paths


def analyze_image(image_path):
    """Send image to MiniMax understand_image API."""
    print(f"[*] Analyzing: {image_path}")

    try:
        with open(image_path, "rb") as f:
            image_data = f.read()

        ext = os.path.splitext(image_path)[1].lower()
        format_map = {".png": "png", ".jpg": "jpeg", ".jpeg": "jpeg", ".webp": "webp"}
        img_format = format_map.get(ext, "jpeg")

        base64_data = base64.b64encode(image_data).decode('utf-8')
        data_url = f"data:image/{img_format};base64,{base64_data}"

        payload = {
            "prompt": "Extract all text content and useful information from this image. If there is no text, describe what you see.",
            "image_url": data_url
        }

        response = requests.post(API_URL, json=payload, headers=HEADERS, timeout=60)
        result = response.json()

        if result.get("base_resp", {}).get("status_code") == 0:
            content = result.get("content", "")
            print(f"    [OK] {content[:100]}...")
            return {"success": True, "content": content}
        else:
            error_msg = result.get("base_resp", {}).get("status_msg", "Unknown error")
            print(f"    [ERROR] {error_msg}")
            return {"success": False, "error": error_msg}

    except Exception as e:
        print(f"    [ERROR] {e}")
        return {"success": False, "error": str(e)}


def process_pdf(pdf_path):
    """Process PDF: extract text if available, otherwise analyze images."""
    print("=" * 60)
    print("PDF Processing Pipeline")
    print("=" * 60)
    print(f"[*] Input: {pdf_path}\n")

    # Step 1: Extract text from PDF
    text = extract_text_from_pdf(pdf_path)

    if text:
        print(f"\n[SUCCESS] Text found in PDF ({len(text)} total chars)")
        print("\n" + "=" * 60)
        print("EXTRACTED TEXT")
        print("=" * 60)
        print(text[:2000] + "..." if len(text) > 2000 else text)

        # Also check for images
        doc = fitz.open(pdf_path)
        total_images = sum(len(doc[page_num].get_images()) for page_num in range(len(doc)))
        doc.close()

        if total_images > 0:
            print(f"\n[NOTE] PDF also contains {total_images} embedded images")
            print("[INFO] If you also want to analyze images, use --images flag")
    else:
        print("\n[WARNING] No text found in PDF")
        print("[INFO] Extracting images for image analysis...")

        # Step 2: Extract and analyze images
        images = extract_images_from_pdf(pdf_path)

        if not images:
            print("[ERROR] No images found in PDF either")
            return

        print(f"\n[SUCCESS] Extracted {len(images)} images")

        print("\n" + "=" * 60)
        print("IMAGE ANALYSIS RESULTS")
        print("=" * 60)

        for img_info in images:
            result = analyze_image(img_info["path"])
            print(f"\n[Page {img_info['page']}, Image {img_info['index']}]:")
            if result["success"]:
                print(result["content"])
            else:
                print(f"ERROR: {result['error']}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_mcp.py <pdf_file_path> [--images]")
        print("  Default: Extract text if available")
        print("  --images: Also analyze images even if text exists")
        sys.exit(1)

    pdf_path = sys.argv[1]
    analyze_images_flag = "--images" in sys.argv

    if not os.path.exists(pdf_path):
        print(f"[ERROR] PDF file not found: {pdf_path}")
        sys.exit(1)

    # First check if PDF has text
    doc = fitz.open(pdf_path)
    first_page_text = doc[0].get_text()
    total_images = sum(len(doc[i].get_images()) for i in range(len(doc)))
    doc.close()

    has_text = bool(first_page_text.strip())
    has_images = total_images > 0

    print(f"[*] PDF has text: {has_text}")
    print(f"[*] PDF has images: {has_images}")

    if analyze_images_flag:
        # Force image analysis
        print("\n[MODE] Forced image analysis")
        extract_images_from_pdf(pdf_path)
        images = [{"path": f"tmp/{f}"} for f in os.listdir("tmp") if f.startswith("page")]
        for img in images:
            result = analyze_image(img["path"])
            print(result.get("content", ""))
    elif has_text:
        # Text优先模式
        print("\n[MODE] Text-first mode - extracting text directly")
        process_pdf(pdf_path)
    else:
        # No text, extract images
        print("\n[MODE] No text found - extracting and analyzing images")
        process_pdf(pdf_path)