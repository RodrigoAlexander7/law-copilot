"""
Esquemas Pydantic para requests y responses del API.
Define la estructura de datos que maneja el audio service.
"""

from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ModuleType(str, Enum):
    """Tipos de módulos disponibles en la aplicación."""
    TEACHING = "teaching"      # Módulo de enseñanza
    SIMULATION = "simulation"  # Módulo de simulación de debate
    ADVISOR = "advisor"        # Módulo de asesor legal


class ProcessQueryRequest(BaseModel):
    """
    Request para procesar una consulta del usuario.
    Puede contener texto, audio o ambos.
    """
    text: Optional[str] = Field(None, description="Texto de la consulta (opcional si hay audio)")
    audio_base64: Optional[str] = Field(None, description="Audio en base64 (opcional si hay texto)")
    module_type: ModuleType = Field(..., description="Tipo de módulo que procesa la consulta")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "¿Qué dice el artículo 2 de la constitución?",
                "module_type": "teaching"
            }
        }


class ProcessQueryResponse(BaseModel):
    """Response con la respuesta del RAG en audio y texto."""
    text_response: str = Field(..., description="Respuesta en texto del RAG")
    audio_base64: str = Field(..., description="Respuesta en audio (base64)")
    service_used: str = Field(..., description="Servicio TTS utilizado")
    processing_time_ms: int = Field(..., description="Tiempo de procesamiento en milisegundos")


class TTSRequest(BaseModel):
    """Request para convertir texto a audio (endpoint interno)."""
    text: str = Field(..., description="Texto a convertir")
    module_type: ModuleType = Field(..., description="Tipo de módulo para seleccionar voz")


class TTSResponse(BaseModel):
    """Response con audio generado."""
    audio_base64: str = Field(..., description="Audio en base64")
    service_used: str = Field(..., description="Servicio utilizado")


class STTRequest(BaseModel):
    """Request para convertir audio a texto (endpoint interno)."""
    audio_base64: str = Field(..., description="Audio en base64")


class STTResponse(BaseModel):
    """Response con texto transcrito."""
    text: str = Field(..., description="Texto transcrito")
    service_used: str = Field(..., description="Servicio utilizado")


class HealthCheckResponse(BaseModel):
    """Response del health check con estado de todos los servicios."""
    status: str = Field(..., description="Estado general del servicio")
    elevenlabs: str = Field(..., description="Estado de ElevenLabs")
    google_tts: str = Field(..., description="Estado de Google TTS")
    google_stt: str = Field(..., description="Estado de Google STT")
    rag_service: str = Field(..., description="Estado del RAG service")
    timestamp: str = Field(..., description="Timestamp del check")
