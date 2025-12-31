"""
Schemas Pydantic para la API.
Define los modelos de Request y Response.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum


# ============== REQUEST MODELS ==============

class QueryRequest(BaseModel):
    """Request para consultas legales."""
    query: str = Field(
        ..., 
        min_length=3,
        max_length=1000,
        description="Pregunta o consulta legal en lenguaje natural",
        examples=["¿Cuáles son mis derechos fundamentales?"]
    )
    top_k: Optional[int] = Field(
        default=5,
        ge=1,
        le=20,
        description="Número de documentos a recuperar"
    )
    score_threshold: Optional[float] = Field(
        default=0.3,
        ge=0.0,
        le=1.0,
        description="Umbral mínimo de similitud (0-1)"
    )


class RetrieveRequest(BaseModel):
    """Request para solo recuperar documentos (sin generación LLM)."""
    query: str = Field(
        ..., 
        min_length=3,
        max_length=1000,
        description="Texto de búsqueda"
    )
    top_k: Optional[int] = Field(default=5, ge=1, le=20)
    score_threshold: Optional[float] = Field(default=0.3, ge=0.0, le=1.0)


# ============== RESPONSE MODELS ==============

class SourceHierarchy(BaseModel):
    """Jerarquía de un documento legal."""
    title: str = Field(default="", description="Título principal")
    chapter: str = Field(default="", description="Capítulo")
    section: str = Field(default="", description="Sección")


class SourceDocument(BaseModel):
    """Documento fuente recuperado."""
    id: str = Field(..., description="ID único del artículo")
    source: str = Field(..., description="Identificador de la fuente legal")
    label: str = Field(..., description="Etiqueta del artículo (ej: 'Artículo 2')")
    text: str = Field(..., description="Contenido del artículo (truncado si es muy largo)")
    hierarchy: SourceHierarchy = Field(..., description="Ubicación en la estructura del documento")
    similarity_score: float = Field(..., description="Score de similitud (0-1)")


class QueryResponse(BaseModel):
    """Response para consultas legales."""
    answer: str = Field(..., description="Respuesta generada por el asistente")
    sources: List[SourceDocument] = Field(..., description="Fuentes legales utilizadas")
    query: str = Field(..., description="Query original del usuario")
    total_sources_found: int = Field(..., description="Número total de fuentes encontradas")


class RetrieveResponse(BaseModel):
    """Response para recuperación de documentos."""
    documents: List[SourceDocument] = Field(..., description="Documentos recuperados")
    context: str = Field(..., description="Contexto formateado")
    query: str = Field(..., description="Query original")
    total_found: int = Field(..., description="Total de documentos encontrados")


class HealthResponse(BaseModel):
    """Response del health check."""
    status: str = Field(..., description="Estado general del servicio")
    embedder: str = Field(..., description="Estado del embedder")
    vector_store: Dict = Field(..., description="Estado del vector store")
    llm_provider: str = Field(..., description="Proveedor de LLM activo")


class ErrorResponse(BaseModel):
    """Response para errores."""
    detail: str = Field(..., description="Descripción del error")
    error_code: Optional[str] = Field(None, description="Código de error")
