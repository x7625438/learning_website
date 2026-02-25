import os


def extract_text_from_file(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.txt':
        return _extract_txt(file_path)
    elif ext == '.pdf':
        return _extract_pdf(file_path)
    elif ext == '.docx':
        return _extract_docx(file_path)
    else:
        raise ValueError(f'Unsupported file type: {ext}')


def _extract_txt(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def _extract_pdf(path):
    from PyPDF2 import PdfReader
    reader = PdfReader(path)
    text = []
    for page in reader.pages:
        t = page.extract_text()
        if t:
            text.append(t)
    return '\n'.join(text)


def _extract_docx(path):
    from docx import Document
    doc = Document(path)
    return '\n'.join(p.text for p in doc.paragraphs if p.text.strip())
