import os
import PyPDF2
import pdfplumber
from typing import List, Dict, Optional
from pathlib import Path
import logging

# OCR imports - optional dependencies
try:
    import pytesseract
    from pdf2image import convert_from_path
    from PIL import Image
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    logging.warning("OCR dependencies not available. Install pytesseract, pdf2image, and Pillow for scanned PDF support.")

logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self, upload_dir: str = "./uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.min_text_threshold = 100  # Minimum characters to consider text extraction successful
    
    def extract_text_pypdf2(self, file_path: str) -> str:
        """Extract text from PDF using PyPDF2"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            raise Exception(f"Error extracting text with PyPDF2: {str(e)}")
        return text
    
    def extract_text_pdfplumber(self, file_path: str) -> str:
        """Extract text from PDF using pdfplumber (better for complex layouts)"""
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            raise Exception(f"Error extracting text with pdfplumber: {str(e)}")
        return text
    
    def extract_text(self, file_path: str, method: str = "pdfplumber") -> str:
        """
        Extract text from PDF using specified method.
        Automatically falls back to OCR if text extraction yields insufficient results.
        """
        text = ""
        
        # Try standard text extraction first
        if method == "pdfplumber":
            text = self.extract_text_pdfplumber(file_path)
        elif method == "pypdf2":
            text = self.extract_text_pypdf2(file_path)
        else:
            # Try pdfplumber first, fallback to PyPDF2
            try:
                text = self.extract_text_pdfplumber(file_path)
            except:
                text = self.extract_text_pypdf2(file_path)
        
        # Check if we got sufficient text
        if len(text.strip()) < self.min_text_threshold:
            logger.info(f"Insufficient text extracted ({len(text)} chars). Attempting OCR...")
            
            if OCR_AVAILABLE:
                try:
                    ocr_text = self.extract_text_ocr(file_path)
                    if len(ocr_text.strip()) > len(text.strip()):
                        logger.info(f"OCR successful: extracted {len(ocr_text)} characters")
                        return ocr_text
                    else:
                        logger.warning("OCR did not yield better results")
                except Exception as e:
                    logger.error(f"OCR failed: {str(e)}")
            else:
                logger.warning("OCR not available. Install pytesseract, pdf2image, and Pillow for scanned PDF support.")
        
        return text
    
    def extract_text_ocr(self, file_path: str, language: str = 'eng+hin') -> str:
        """
        Extract text from PDF using OCR (for scanned PDFs/images).
        Supports multiple languages including English and Hindi.
        """
        if not OCR_AVAILABLE:
            raise ImportError("OCR dependencies not installed. Run: pip install pytesseract pdf2image Pillow")
        
        text = ""
        try:
            # Convert PDF pages to images
            logger.info(f"Converting PDF to images for OCR: {file_path}")
            images = convert_from_path(file_path, dpi=300)
            
            # Process each page
            for page_num, image in enumerate(images, start=1):
                logger.info(f"Processing page {page_num}/{len(images)} with OCR...")
                try:
                    # Perform OCR on the image
                    page_text = pytesseract.image_to_string(image, lang=language)
                    text += f"\n--- Page {page_num} ---\n{page_text}\n"
                except Exception as e:
                    logger.error(f"OCR failed on page {page_num}: {str(e)}")
                    continue
            
            logger.info(f"OCR completed: extracted {len(text)} characters from {len(images)} pages")
            
        except Exception as e:
            raise Exception(f"Error during OCR processing: {str(e)}")
        
        return text
    
    def is_scanned_pdf(self, file_path: str) -> bool:
        """
        Detect if PDF is likely scanned (image-based) by checking text content.
        Returns True if PDF appears to be scanned/image-based.
        """
        try:
            # Try to extract text from first few pages
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                pages_to_check = min(3, len(pdf_reader.pages))
                
                for i in range(pages_to_check):
                    text += pdf_reader.pages[i].extract_text()
            
            # If very little text found, likely scanned
            chars_per_page = len(text.strip()) / pages_to_check
            is_scanned = chars_per_page < 50  # Less than 50 chars per page suggests scanned
            
            if is_scanned:
                logger.info(f"PDF appears to be scanned (avg {chars_per_page:.1f} chars/page)")
            
            return is_scanned
            
        except Exception as e:
            logger.error(f"Error checking if PDF is scanned: {str(e)}")
            return False
    
    def extract_text_hybrid(self, file_path: str) -> str:
        """
        Hybrid extraction: tries text extraction first, uses OCR for pages with little/no text.
        Best for mixed PDFs (some pages text, some scanned).
        """
        if not OCR_AVAILABLE:
            logger.warning("OCR not available. Falling back to standard text extraction.")
            return self.extract_text(file_path)
        
        text = ""
        
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                total_pages = len(pdf_reader.pages)
                
                logger.info(f"Hybrid extraction started for {total_pages} pages")
                
                # Convert all pages to images upfront (for OCR fallback)
                images = convert_from_path(file_path, dpi=300)
                
                for page_num in range(total_pages):
                    # Try text extraction first
                    page_text = pdf_reader.pages[page_num].extract_text().strip()
                    
                    # If insufficient text, use OCR
                    if len(page_text) < 50:
                        logger.info(f"Page {page_num + 1}: Using OCR (text extraction yielded {len(page_text)} chars)")
                        try:
                            page_text = pytesseract.image_to_string(images[page_num], lang='eng+hin')
                        except Exception as e:
                            logger.error(f"OCR failed on page {page_num + 1}: {str(e)}")
                    else:
                        logger.info(f"Page {page_num + 1}: Using text extraction ({len(page_text)} chars)")
                    
                    text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
                
                logger.info(f"Hybrid extraction completed: {len(text)} total characters")
                
        except Exception as e:
            raise Exception(f"Error during hybrid extraction: {str(e)}")
        
        return text
    
    def get_page_count(self, file_path: str) -> int:
        """Get total number of pages in PDF"""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                return len(pdf_reader.pages)
        except Exception as e:
            raise Exception(f"Error getting page count: {str(e)}")
    
    def extract_page_range(self, file_path: str, start_page: int, end_page: int) -> str:
        """Extract text from specific page range"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                total_pages = len(pdf_reader.pages)
                
                # Validate page range
                start_page = max(0, start_page)
                end_page = min(total_pages - 1, end_page)
                
                for page_num in range(start_page, end_page + 1):
                    text += pdf_reader.pages[page_num].extract_text() + "\n"
        except Exception as e:
            raise Exception(f"Error extracting page range: {str(e)}")
        return text
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[Dict[str, any]]:
        """
        Split text into logical chunks with overlap.
        Tries to split at paragraph boundaries when possible.
        """
        chunks = []
        paragraphs = text.split('\n\n')
        
        current_chunk = ""
        chunk_id = 0
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            # If adding this paragraph would exceed chunk_size
            if len(current_chunk) + len(para) > chunk_size and current_chunk:
                chunks.append({
                    "id": chunk_id,
                    "text": current_chunk.strip(),
                    "char_count": len(current_chunk)
                })
                chunk_id += 1
                
                # Keep overlap from previous chunk
                words = current_chunk.split()
                overlap_text = " ".join(words[-overlap:]) if len(words) > overlap else current_chunk
                current_chunk = overlap_text + "\n\n" + para
            else:
                current_chunk += "\n\n" + para if current_chunk else para
        
        # Add the last chunk
        if current_chunk:
            chunks.append({
                "id": chunk_id,
                "text": current_chunk.strip(),
                "char_count": len(current_chunk)
            })
        
        return chunks
    
    def save_uploaded_file(self, file_content: bytes, filename: str) -> str:
        """Save uploaded file to disk"""
        file_path = self.upload_dir / filename
        with open(file_path, 'wb') as f:
            f.write(file_content)
        return str(file_path)
