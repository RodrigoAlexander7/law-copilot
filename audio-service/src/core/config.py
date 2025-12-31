"""
Configuración global del audio service.
Maneja variables de entorno y configuración de servicios externos.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional
import json
import os
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Configuración del audio service con variables de entorno."""
    
    # ElevenLabs Configuration
    elevenlabs_api_key: str
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"
    
    # Google Cloud Configuration (opcional en producción)
    google_application_credentials: Optional[str] = None
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


def setup_google_credentials():
    """
    Configura las credenciales de Google Cloud desde variable de entorno.
    
    En producción (Vercel/Railway), las credenciales se pasan como JSON string
    en GOOGLE_CREDENTIALS_JSON y este método las convierte a archivo.
    """
    credentials_json_str = os.getenv("GOOGLE_CREDENTIALS_JSON")
    
    if not credentials_json_str:
        logger.info("⚠️  GOOGLE_CREDENTIALS_JSON no encontrado, usando archivo local")
        return
    
    try:
        # Validar que sea JSON válido
        credentials_data = json.loads(credentials_json_str)
        
        # Determinar ruta según plataforma
        # Vercel usa /tmp, Railway/Render usan /app
        if os.path.exists("/tmp"):
            credentials_path = "/tmp/google-credentials.json"
        elif os.path.exists("/app"):
            credentials_path = "/app/google-credentials.json"
        else:
            credentials_path = "google-credentials.json"
        
        # Crear directorio si no existe
        os.makedirs(os.path.dirname(credentials_path) if os.path.dirname(credentials_path) else ".", exist_ok=True)
        
        # Escribir archivo
        with open(credentials_path, "w") as f:
            json.dump(credentials_data, f)
        
        # Configurar variable de entorno
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
        
        logger.info(f"✅ Credenciales de Google Cloud configuradas en: {credentials_path}")
        
    except json.JSONDecodeError as e:
        logger.error(f"❌ Error parseando GOOGLE_CREDENTIALS_JSON: {e}")
        raise
    except Exception as e:
        logger.error(f"❌ Error configurando credenciales de Google Cloud: {e}")
        raise
