"""
Audio Service - Aplicación FastAPI principal.
Microservicio para procesamiento de audio y comunicación con RAG.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router
from src.core.config import settings
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="Audio Service - Legal Assistant",
    description="Microservicio de procesamiento de audio (TTS/STT) con integración a RAG",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS para frontend y RAG
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restringir en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """Log de inicio del servicio."""
    logger.info("="*60)
    logger.info("🚀 Audio Service iniciado")
    logger.info(f"📍 Puerto: {settings.port}")
    logger.info(f"🌍 Entorno: {settings.environment}")
    logger.info(f"🔗 RAG Service: {settings.rag_service_url}")
    logger.info(f"🎙️ ElevenLabs: Configurado")
    logger.info(f"🔊 Google Cloud: Configurado")
    logger.info("="*60)


@app.get("/")
async def root():
    """Endpoint raíz."""
    return {
        "service": "Audio Service",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.api.main:app",
        host=settings.host,
        port=settings.port,
        reload=True
    )
