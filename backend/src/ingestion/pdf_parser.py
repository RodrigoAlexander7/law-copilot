"""
Servicio base para extracción de texto de PDFs.
Proporciona funcionalidades comunes para todos los parsers específicos.
"""

import re
from pathlib import Path
from typing import List, Optional
from abc import ABC, abstractmethod
from dataclasses import dataclass

import fitz  # PyMuPDF
import pdfplumber

from src.ingestion.models import LegalArticle, ProcessedDocument, SourceType


@dataclass
class ExtractedPage:
    """Página extraída de un PDF."""
    page_number: int
    text: str
    

class PDFExtractor:
    """
    Extractor de texto de PDFs usando múltiples backends.
    PyMuPDF es más rápido, pdfplumber es más preciso con tablas.
    """
    
    @staticmethod
    def extract_with_pymupdf(pdf_path: Path) -> List[ExtractedPage]:
        """Extrae texto usando PyMuPDF (fitz)."""
        pages = []
        with fitz.open(pdf_path) as doc:
            for page_num, page in enumerate(doc, start=1):
                text = page.get_text("text")
                pages.append(ExtractedPage(page_number=page_num, text=text))
        return pages
    
    @staticmethod
    def extract_with_pdfplumber(pdf_path: Path) -> List[ExtractedPage]:
        """Extrae texto usando pdfplumber (mejor para tablas)."""
        pages = []
        with pdfplumber.open(pdf_path) as pdf:
            for page_num, page in enumerate(pdf.pages, start=1):
                text = page.extract_text() or ""
                pages.append(ExtractedPage(page_number=page_num, text=text))
        return pages
    
    @staticmethod
    def extract_full_text(pdf_path: Path, backend: str = "pymupdf") -> str:
        """Extrae todo el texto del PDF como un solo string."""
        if backend == "pymupdf":
            pages = PDFExtractor.extract_with_pymupdf(pdf_path)
        else:
            pages = PDFExtractor.extract_with_pdfplumber(pdf_path)
        
        return "\n\n".join(page.text for page in pages)


class TextCleaner:
    """Utilidades para limpiar texto extraído de PDFs."""
    
    @staticmethod
    def normalize_whitespace(text: str) -> str:
        """Normaliza espacios múltiples y saltos de línea."""
        # Reemplazar múltiples espacios por uno solo
        text = re.sub(r'[ \t]+', ' ', text)
        # Reemplazar múltiples saltos de línea por máximo dos
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()
    
    @staticmethod
    def remove_page_numbers(text: str) -> str:
        """Remueve números de página comunes."""
        # Patrones comunes: "- 15 -", "Página 15", "15"
        text = re.sub(r'\n\s*-?\s*\d+\s*-?\s*\n', '\n', text)
        text = re.sub(r'\n\s*[Pp]ágina\s+\d+\s*\n', '\n', text)
        return text
    
    @staticmethod
    def remove_headers_footers(text: str, patterns: List[str] = None) -> str:
        """Remueve headers/footers conocidos."""
        if patterns:
            for pattern in patterns:
                text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        return text
    
    @staticmethod
    def fix_hyphenation(text: str) -> str:
        """Junta palabras separadas por guiones al final de línea."""
        # "constitu-\nción" -> "constitución"
        text = re.sub(r'(\w+)-\n(\w+)', r'\1\2', text)
        return text
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Aplica todas las limpiezas estándar."""
        text = TextCleaner.fix_hyphenation(text)
        text = TextCleaner.remove_page_numbers(text)
        text = TextCleaner.normalize_whitespace(text)
        return text


class BaseLegalParser(ABC):
    """
    Clase base abstracta para parsers de documentos legales.
    Cada tipo de documento (Constitución, Código Civil, etc.) 
    debe implementar su propio parser.
    """
    
    def __init__(self, pdf_path: Path):
        self.pdf_path = pdf_path
        self.raw_text: Optional[str] = None
        self.articles: List[LegalArticle] = []
    
    @property
    @abstractmethod
    def source_id(self) -> str:
        """Identificador único de la fuente."""
        pass
    
    @property
    @abstractmethod
    def source_type(self) -> SourceType:
        """Tipo de documento legal."""
        pass
    
    @abstractmethod
    def parse(self) -> List[LegalArticle]:
        """
        Parsea el documento y retorna lista de artículos.
        Debe ser implementado por cada parser específico.
        """
        pass
    
    def extract_text(self, backend: str = "pymupdf") -> str:
        """Extrae y limpia el texto del PDF."""
        raw_text = PDFExtractor.extract_full_text(self.pdf_path, backend)
        self.raw_text = TextCleaner.clean_text(raw_text)
        return self.raw_text
    
    def to_processed_document(self) -> ProcessedDocument:
        """Convierte los artículos parseados a ProcessedDocument."""
        return ProcessedDocument(
            source_id=self.source_id,
            source_type=self.source_type,
            total_articles=len(self.articles),
            articles=self.articles
        )
