"""
Configuración global del audio service.
Maneja variables de entorno y configuración de servicios externos.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Configuración del audio service con variables de entorno."""
    
    # ElevenLabs Configuration
    elevenlabs_api_key: str
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"
    
    # Google Cloud Configuration
    google_application_credentials: str
    google_tts_voice_name: str = "es-US-Neural2-A"
    google_tts_language_code: str = "es-US"
    
    # RAG Service Configuration
    rag_service_url: str = "http://localhost:8000"
    rag_service_timeout: int = 30
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8001
    environment: str = "development"
    
    # Mock mode (para testing sin RAG)
    mock_rag: bool = False
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """
    Obtiene la instancia de configuración con caché.
    Evita múltiples instanciaciones de Settings.
    """
    return Settings()


# Instancia global
settings = get_settings()
