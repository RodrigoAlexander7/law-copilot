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
from src.ingestion.parsers.constitution_parser import (
    ConstitutionParser,
    parse_constitution
)
from src.ingestion.parsers.civil_code_parser import (
    CivilCodeParser,
    parse_civil_code
)
from src.ingestion.parsers.violence_law_parser import (
    ViolenceLawParser,
    parse_violence_law
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
    # Civil Code Parser
    "CivilCodeParser",
    "parse_civil_code",
    # Violence Law Parser
    "ViolenceLawParser",
    "parse_violence_law",
]
