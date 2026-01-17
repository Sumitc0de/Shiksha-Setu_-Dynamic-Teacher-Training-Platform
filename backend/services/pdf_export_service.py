import os
import uuid
import re
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import inch

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXPORT_DIR = os.path.join(BASE_DIR, "exports")
os.makedirs(EXPORT_DIR, exist_ok=True)


class PDFExportService:
    def __init__(self):
        font_path = os.path.join(BASE_DIR, "services", "DejaVuSans.ttf")
        if not os.path.exists(font_path):
            raise FileNotFoundError("DejaVuSans.ttf not found")

        pdfmetrics.registerFont(TTFont("DejaVu", font_path))
        self.font = "DejaVu"

    def _wrap_text(self, text, max_width, font_size):
        words = text.split()
        lines, current = [], ""

        for word in words:
            test = f"{current} {word}".strip()
            if pdfmetrics.stringWidth(test, self.font, font_size) <= max_width:
                current = test
            else:
                lines.append(current)
                current = word

        if current:
            lines.append(current)
        return lines

    def _clean_markdown(self, text: str):
        blocks = []
        for line in text.split("\n"):
            line = line.strip()
            if not line:
                blocks.append(("space", ""))
                continue

            if line.startswith("### "):
                blocks.append(("h3", line[4:]))
            elif line.startswith("## "):
                blocks.append(("h2", line[3:]))
            elif line.startswith("# "):
                blocks.append(("h1", line[2:]))
            else:
                clean = re.sub(r"\*\*(.*?)\*\*", r"\1", line)
                blocks.append(("p", clean))
        return blocks

    def generate_module_pdf(self, module_title: str, module_content: str, language: str):
        filename = f"module_{uuid.uuid4().hex[:8]}_{language}.pdf"
        file_path = os.path.join(EXPORT_DIR, filename)

        c = canvas.Canvas(file_path, pagesize=A4)
        width, height = A4
        margin = 1 * inch
        max_width = width - 2 * margin
        y = height - margin

        # Title
        c.setFont(self.font, 18)
        c.drawCentredString(width / 2, y, module_title)
        y -= 30

        c.setFont(self.font, 9)
        c.drawCentredString(
            width / 2,
            y,
            f"Generated on {datetime.now().strftime('%d %b %Y, %H:%M')}",
        )
        y -= 40

        blocks = self._clean_markdown(module_content)

        for block_type, text in blocks:
            if y < margin:
                c.showPage()
                y = height - margin

            if block_type == "h1":
                c.setFont(self.font, 15)
                y -= 10
                c.drawString(margin, y, text)
                y -= 24

            elif block_type == "h2":
                c.setFont(self.font, 13)
                y -= 8
                c.drawString(margin, y, text)
                y -= 20

            elif block_type == "h3":
                c.setFont(self.font, 12)
                y -= 6
                c.drawString(margin, y, text)
                y -= 18

            elif block_type == "p":
                c.setFont(self.font, 11)
                for line in self._wrap_text(text, max_width, 11):
                    if y < margin:
                        c.showPage()
                        y = height - margin
                    c.drawString(margin, y, line)
                    y -= 14
                y -= 6

            elif block_type == "space":
                y -= 10

        c.save()

        return {
            "filename": filename,
            "file_path": file_path,
            "download_url": f"/exports/{filename}",
        }
