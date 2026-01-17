from services.pdf_processor import PDFProcessor
from typing import List, Dict

def extract_chunks_from_manual(manual) -> List[Dict[str, any]]:
    """
    Extract text chunks from a manual PDF.
    
    Args:
        manual: Manual database object with file_path
        
    Returns:
        List of chunk dictionaries with id, text, char_count
    """
    processor = PDFProcessor()
    
    # Extract text from the PDF
    text = processor.extract_text(manual.file_path)
    
    if not text.strip():
        return []
    
    # Chunk the text
    chunks = processor.chunk_text(text)
    
    return chunks