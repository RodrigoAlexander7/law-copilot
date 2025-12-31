"""
Entry point de la aplicación FastAPI.
Configura la app, middleware y rutas.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from src.api.routes import router
from src.infrastructure.vector_store import vector_store
from src.infrastructure.embedder import LegalEmbedder


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestiona el ciclo de vida de la aplicación.
    Carga los modelos al iniciar y limpia recursos al cerrar.
    """
    # Startup: Cargar modelos y recursos
    print("🚀 Iniciando Legal AI Assistant...")
    
    # Pre-cargar el embedder (singleton)
    print("📦 Cargando modelo de embeddings...")
    _ = LegalEmbedder()
    
    # Pre-cargar el vector store
    print("📦 Cargando índice vectorial...")
    vector_store.ensure_loaded()
    
    print("✅ Servicio listo!")
    print(f"📊 Documentos indexados: {vector_store.total_documents}")
    
    yield  # La aplicación corre aquí
    
    # Shutdown: Limpiar recursos
    print("👋 Cerrando Legal AI Assistant...")


# Crear aplicación FastAPI
app = FastAPI(
    title="Legal AI Assistant - Perú",
    description="""
    Asistente Legal basado en IA para el marco jurídico peruano
    
    Este servicio utiliza RAG (Retrieval-Augmented Generation) para responder 
    consultas legales basándose en:
    
    - Constitución Política del Perú (1993)
    - Código Civil del Perú
    - Código de Protección al Consumidor (Ley 29571)
    - Ley 30364 - Violencia contra la Mujer
    
    ---
    
    **Disclaimer**: Este es un asistente informativo. Para casos legales 
    específicos, consulte siempre con un abogado profesional.
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)


# Configurar CORS (ajustar origins en producción)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción: ["https://tu-frontend.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Registrar rutas
app.include_router(router, prefix="/api/v1")


# Ruta raíz
@app.get("/", tags=["Root"])
async def root():
    """Ruta raíz con información básica del servicio."""
    return {
        "service": "Legal AI Assistant - Perú",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/api/v1/health"
    }
