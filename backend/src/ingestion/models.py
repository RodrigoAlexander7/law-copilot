"""
Modelos de datos para documentos legales procesados.
Define la estructura estándar para artículos de diferentes fuentes legales.
"""

from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import date
from enum import Enum


class SourceType(str, Enum):
    """Tipos de fuentes legales."""
    CONSTITUCION = "constitucion"
    CODIGO = "codigo"
    LEY = "ley"
    REGLAMENTO = "reglamento"
    DECRETO = "decreto"


class Payload(BaseModel):
    """Contenido visible al usuario."""
    label: str = Field(..., description="Etiqueta del artículo, ej: 'Artículo 2'")
    text_content: str = Field(..., description="Texto completo del artículo")


class Hierarchy(BaseModel):
    """Jerarquía estructural del documento."""
    level_1: Optional[str] = Field(None, description="Título o Libro mayor")
    level_2: Optional[str] = Field(None, description="Capítulo o Subtítulo")
    level_3: Optional[str] = Field(None, description="Sección (si existe)")


class Metadata(BaseModel):
    """Metadatos técnicos y legales."""
    is_active: bool = Field(True, description="Si el artículo está vigente")
    date_promulgated: Optional[date] = Field(None, description="Fecha de promulgación")
    tags: List[str] = Field(default_factory=list, description="Keywords extraídas")


class LegalArticle(BaseModel):
    """
    Modelo principal para un artículo legal procesado.
    Este es el formato estándar que se guarda en los JSONs procesados.
    """
    id: str = Field(..., description="ID determinista, ej: 'CONST_1993_ART_2'")
    source_id: str = Field(..., description="Identificador de la fuente, ej: 'constitucion_1993'")
    source_type: SourceType = Field(..., description="Tipo de documento legal")
    payload: Payload = Field(..., description="Contenido visible al usuario")
    hierarchy: Hierarchy = Field(..., description="Jerarquía estructural")
    metadata: Metadata = Field(default_factory=Metadata, description="Metadatos adicionales")

    class Config:
        json_encoders = {
            date: lambda v: v.isoformat() if v else None
        }


class ProcessedDocument(BaseModel):
    """Documento procesado completo con todos sus artículos."""
    source_id: str
    source_type: SourceType
    total_articles: int
    articles: List[LegalArticle]
