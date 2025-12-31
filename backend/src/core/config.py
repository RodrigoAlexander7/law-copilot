"""
Configuración global del proyecto.
Usa variables de entorno desde .env con valores por defecto.
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """
    Configuración de la aplicación.
    Los valores se cargan automáticamente desde .env
    """
    
    # Configuración de Pydantic Settings
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # Ignora variables no definidas
        case_sensitive=False  # GEMINI_API_KEY = gemini_api_key
    )
    
    # ============== API Keys ==============
    gemini_api_key: str = Field(
        default="",
        description="API Key de Google Gemini (requerida)"
    )
    
    # ============== Paths ==============
    # Estos NO van en .env porque son relativos al proyecto
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    RAW_DIR: Path = DATA_DIR / "raw"
    PROCESSED_DIR: Path = DATA_DIR / "processed"
    INDEXES_DIR: Path = DATA_DIR / "indexes"
    
    # ============== LLM Config ==============
    llm_model: str = Field(
        default="gemini-2.0-flash",
        description="Modelo de Gemini a usar"
    )
    llm_temperature: float = Field(
        default=0.1,
        ge=0.0,
        le=1.0,
        description="Temperatura del modelo"
    )
    llm_max_tokens: int = Field(
        default=2000,
        ge=100,
        le=8000,
        description="Máximo de tokens en respuesta"
    )
    
    # ============== Embeddings ==============
    embedding_model: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        description="Modelo de embeddings de HuggingFace"
    )
    
    # ============== RAG Config ==============
    rag_top_k: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Documentos a recuperar por consulta"
    )
    rag_score_threshold: float = Field(
        default=0.3,
        ge=0.0,
        le=1.0,
        description="Umbral mínimo de similitud"
    )
    
    # ============== Server ==============
    server_host: str = Field(default="0.0.0.0")
    server_port: int = Field(default=8000)
    debug: bool = Field(default=False)


@lru_cache()
def get_settings() -> Settings:
    """Singleton de configuración con caché."""
    return Settings()


# Instancia global
settings = get_settings()
