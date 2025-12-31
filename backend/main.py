"""
Entry point principal del backend.
Ejecutar con: uvicorn main:app --reload
"""
from src.api.main import app

# Re-exportar app para uvicorn
__all__ = ["app"]
