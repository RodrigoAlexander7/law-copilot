"""
global config 
"""

from pathlib import Path
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # API Keys
    openai_api_key: str = ""
    gemini_api_key: str = ""
    
    # Paths base
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    RAW_DIR: Path = DATA_DIR / "raw"
    PROCESSED_DIR: Path = DATA_DIR / "processed"
    INDEXES_DIR: Path = DATA_DIR / "indexes"
    
    # Configuración de embeddings
    EMBEDDING_MODEL: str = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    
    # # Configuración de LLM
    # LLM_MODEL: str = "gpt-4o-mini"
    # LLM_TEMPERATURE: float = 0.1
    
    # class Config:
    #     env_file = ".env"
    #     env_file_encoding = "utf-8"
    #     extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """using lru_cache to avoid multiple instantiations"""
    return Settings()
    


# Instancia global
settings = get_settings()
