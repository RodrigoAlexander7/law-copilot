"""
Módulo de ingesta de documentos legales.
Contiene parsers para diferentes tipos de documentos (Constitución, Códigos, Leyes).
"""

from src.ingestion.models import (
    LegalArticle,
    ProcessedDocument,
    SourceType,
    Payload,
    Hierarchy,
    Metadata
)
from src.ingestion.pdf_parser import (
    PDFExtractor,
    TextCleaner,
    BaseLegalParser
)
from src.ingestion.constitution_parser import (
    ConstitutionParser,
    parse_constitution
)

__all__ = [
    # Models
    "LegalArticle",
    "ProcessedDocument", 
    "SourceType",
    "Payload",
    "Hierarchy",
    "Metadata",
    # PDF Parser
    "PDFExtractor",
    "TextCleaner",
    "BaseLegalParser",
    # Constitution Parser
    "ConstitutionParser",
    "parse_constitution",
]
