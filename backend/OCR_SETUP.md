# OCR Setup Guide for Shiksha-Setu

## Overview

The system now supports **OCR (Optical Character Recognition)** to extract text from scanned PDFs and images. This allows processing of:
- Scanned training manuals
- PDFs with photos containing text
- Image-based documents
- Mixed PDFs (some pages text, some images)

## Installation Steps

### 1. Install Python Packages

```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows PowerShell
pip install pytesseract pdf2image Pillow
```

Or install all requirements:
```bash
pip install -r requirements.txt
```

### 2. Install Tesseract OCR Engine

**Windows:**

1. Download Tesseract installer:
   - Visit: https://github.com/UB-Mannheim/tesseract/wiki
   - Download: `tesseract-ocr-w64-setup-5.3.3.20231005.exe` (or latest version)

2. Run the installer:
   - Install to: `C:\Program Files\Tesseract-OCR\`
   - **Important:** Check "Additional language data" and select:
     - English (eng)
     - Hindi (hin)
     - Any other Indian languages you need

3. Add to PATH:
   - Open System Environment Variables
   - Add to Path: `C:\Program Files\Tesseract-OCR\`
   
   Or set in your code:
   ```python
   import pytesseract
   pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
   ```

4. Verify installation:
   ```bash
   tesseract --version
   ```

**Alternative - Using Chocolatey:**
```bash
choco install tesseract
```

### 3. Install Poppler (for pdf2image)

**Windows:**

1. Download Poppler:
   - Visit: https://github.com/oschwartz10612/poppler-windows/releases
   - Download: `Release-XX.XX.X-0.zip` (latest version)

2. Extract to: `C:\Program Files\poppler\`

3. Add to PATH:
   - Add to Path: `C:\Program Files\poppler\Library\bin\`

4. Verify installation:
   ```bash
   pdfinfo -v
   ```

## Supported Languages

By default, the system supports:
- **English** (eng)
- **Hindi** (hin)

### Add More Indian Languages

1. Download language data files from:
   https://github.com/tesseract-ocr/tessdata

2. Copy `.traineddata` files to:
   `C:\Program Files\Tesseract-OCR\tessdata\`

**Available Indian Languages:**
- Hindi: `hin.traineddata`
- Bengali: `ben.traineddata`
- Tamil: `tam.traineddata`
- Telugu: `tel.traineddata`
- Gujarati: `guj.traineddata`
- Kannada: `kan.traineddata`
- Malayalam: `mal.traineddata`
- Marathi: `mar.traineddata`
- Punjabi: `pan.traineddata`
- Urdu: `urd.traineddata`

3. To use multiple languages, modify the OCR call:
   ```python
   # In pdf_processor.py
   pytesseract.image_to_string(image, lang='eng+hin+tam+tel')
   ```

## How It Works

### Automatic Fallback

The system uses a smart fallback mechanism:

1. **First Attempt:** Try standard text extraction (fast)
2. **Check:** If less than 100 characters extracted
3. **Fallback:** Automatically try OCR (slower but works on images)
4. **Result:** Use whichever method yields more text

### Three Extraction Modes

**1. Standard (Default):**
```python
text = pdf_processor.extract_text(file_path)
```
- Tries text extraction first
- Falls back to OCR if needed
- Best for most use cases

**2. OCR Only:**
```python
text = pdf_processor.extract_text_ocr(file_path)
```
- Forces OCR on all pages
- Best for known scanned documents
- Slower but works on image-only PDFs

**3. Hybrid:**
```python
text = pdf_processor.extract_text_hybrid(file_path)
```
- Tries text extraction on each page
- Uses OCR only for pages with little text
- Best for mixed PDFs
- Optimal balance of speed and accuracy

### Detection

Check if PDF is scanned:
```python
is_scanned = pdf_processor.is_scanned_pdf(file_path)
if is_scanned:
    # Handle scanned document
    text = pdf_processor.extract_text_ocr(file_path)
```

## Performance Considerations

### Processing Time

- **Text extraction:** ~1 second per 50-page PDF
- **OCR extraction:** ~2-5 seconds per page (depends on resolution)
- **Hybrid mode:** Variable (text pages fast, image pages slow)

### Recommendations

1. **For text-based PDFs:** Use default mode (automatic)
2. **For scanned PDFs:** Pre-detect and use OCR mode
3. **For mixed PDFs:** Use hybrid mode
4. **For large documents:** Consider background processing

### Image Quality

OCR accuracy depends on:
- **DPI:** Higher = better (we use 300 DPI by default)
- **Image quality:** Clear scans work best
- **Language:** English works best, Indic scripts slightly lower accuracy
- **Font:** Clean, standard fonts work better than handwriting

## Usage Examples

### Basic Upload with OCR

The existing upload endpoint automatically handles OCR:

```python
# In manuals.py - no changes needed!
manual = await upload_manual(title, file)
# System automatically detects if OCR is needed
```

### Manual OCR Control

If you want explicit control:

```python
from services.pdf_processor import PDFProcessor

pdf_processor = PDFProcessor()

# Check if scanned
if pdf_processor.is_scanned_pdf(file_path):
    print("Scanned PDF detected - using OCR")
    text = pdf_processor.extract_text_ocr(file_path)
else:
    print("Text-based PDF - using standard extraction")
    text = pdf_processor.extract_text(file_path)
```

## Troubleshooting

### Error: "Tesseract not found"

**Solution:**
```python
# Add to pdf_processor.py before using OCR
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

### Error: "pdf2image: Unable to locate pdfinfo"

**Solution:**
- Install Poppler (see step 3 above)
- Add Poppler to system PATH

### OCR Returns Gibberish

**Possible causes:**
- Wrong language setting (use `lang='hin'` for Hindi)
- Poor image quality
- Handwritten text (OCR works best on printed text)

**Solution:**
- Ensure correct language files installed
- Increase DPI: `convert_from_path(file_path, dpi=400)`
- Pre-process image (contrast, brightness)

### Slow Performance

**Solutions:**
1. Use hybrid mode for mixed PDFs
2. Reduce DPI to 200 (faster, slightly less accurate)
3. Process in background (async)
4. Cache OCR results

## Testing

### Test with Sample PDFs

```bash
# Test text-based PDF
python -c "from services.pdf_processor import PDFProcessor; p = PDFProcessor(); print(len(p.extract_text('sample.pdf')))"

# Test scanned PDF
python -c "from services.pdf_processor import PDFProcessor; p = PDFProcessor(); print(len(p.extract_text_ocr('scanned.pdf')))"
```

### Verify OCR Installation

```python
# test_ocr.py
import pytesseract
from PIL import Image

# Test basic OCR
print("Tesseract version:", pytesseract.get_tesseract_version())

# Test languages
print("Available languages:", pytesseract.get_languages())
```

## Configuration

### Adjust OCR Settings

In `pdf_processor.py`, you can customize:

```python
class PDFProcessor:
    def __init__(self, upload_dir: str = "./uploads"):
        self.min_text_threshold = 100  # Lower = more aggressive OCR
        self.ocr_dpi = 300  # Higher = better quality, slower
        self.ocr_language = 'eng+hin'  # Add more: 'eng+hin+tam+tel'
```

### Performance Tuning

```python
# Fast mode (lower quality)
images = convert_from_path(file_path, dpi=200)

# High quality (slower)
images = convert_from_path(file_path, dpi=400)

# Custom OCR config
custom_config = r'--oem 3 --psm 6'
text = pytesseract.image_to_string(image, lang='eng+hin', config=custom_config)
```

## Benefits

### For Users
- ✓ Upload any PDF format (text or scanned)
- ✓ Process photos of training documents
- ✓ Handle mixed document types
- ✓ Support multilingual documents

### For System
- ✓ Automatic detection and fallback
- ✓ No manual user intervention
- ✓ Supports 12+ Indian languages
- ✓ Maintains existing API compatibility

## Next Steps

1. Install Tesseract and Poppler
2. Install Python packages: `pip install -r requirements.txt`
3. Test with a scanned PDF
4. Monitor performance and adjust DPI if needed

---

**Status:** OCR feature implemented and ready to use  
**Date:** January 18, 2026  
**Dependencies:** pytesseract, pdf2image, Pillow, Tesseract OCR, Poppler
