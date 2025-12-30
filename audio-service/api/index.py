"""
Handler para Vercel Serverless Functions.
Este archivo exporta la app FastAPI para Vercel.
"""
import sys
import os

# Agregar el directorio raíz al path para imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.api.main import app

# Vercel necesita que exportemos 'app' directamente
# FastAPI es compatible con ASGI y Vercel lo maneja automáticamente
__all__ = ['app']
