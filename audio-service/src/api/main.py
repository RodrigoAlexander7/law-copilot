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

# Crear aplicación FastAPI con documentación Swagger completa
app = FastAPI(
    title="Audio Service - Legal Assistant",
    description="""
    # Microservicio de Procesamiento de Audio
    
    Este servicio maneja la conversión de texto a voz (TTS) y voz a texto (STT) para el asistente legal.
    
    ## Características Principales
    
    - **Text-to-Speech (TTS)**: Convierte respuestas de texto a audio natural
    - **Speech-to-Text (STT)**: Transcribe consultas de audio a texto
    - **Integración RAG**: Comunicación con el servicio de recuperación y generación de respuestas
    - **Multi-Provider**: Soporte para ElevenLabs y Google Cloud Speech
    
    ## Módulos Soportados
    
    - **Teaching**: Módulo educativo con voz profesional
    - **Simulation**: Simulación de debates con voces expresivas
    - **Advisor**: Asesoría legal con voz clara y confiable
    
    ## Arquitectura
    
    El servicio actúa como intermediario entre el frontend y el RAG service:
    1. Recibe consultas en texto o audio
    2. Transcribe audio si es necesario (STT)
    3. Envía la consulta al RAG service
    4. Convierte la respuesta a audio (TTS)
    5. Retorna texto + audio al cliente
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "Legal Assistant Team",
        "email": "support@legalassistant.com"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    },
    openapi_tags=[
        {
            "name": "Main",
            "description": "Endpoints principales para procesamiento de consultas completas"
        },
        {
            "name": "Internal",
            "description": "Endpoints internos para servicios TTS/STT individuales"
        },
        {
            "name": "Health",
            "description": "Verificación del estado del servicio y dependencias"
        }
    ]
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
