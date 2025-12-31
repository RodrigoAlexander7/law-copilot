"""
Rutas del API de audio service.
Maneja endpoints públicos e internos para procesamiento de audio.
"""

from fastapi import APIRouter, HTTPException
from src.api.schemas import (
    ProcessQueryRequest,
    ProcessQueryResponse,
    TTSRequest,
    TTSResponse,
    STTRequest,
    STTResponse,
    HealthCheckResponse,
    ModuleType
)
from src.services.elevenlabs_service import elevenlabs_service
from src.services.google_tts_service import google_tts_service
from src.services.google_stt_service import google_stt_service
from src.services.rag_client import rag_client
import base64
import logging
import time
from datetime import datetime

logger = logging.getLogger(__name__)

# Router principal
router = APIRouter()


@router.post("/api/process-query", response_model=ProcessQueryResponse)
async def process_query(request: ProcessQueryRequest):
    """
    Endpoint principal: Procesa consulta del usuario (texto o audio).
    
    Flujo:
    1. Si hay audio → STT para obtener texto
    2. Enviar texto al RAG service
    3. Convertir respuesta del RAG a audio
    4. Retornar audio + texto
    """
    start_time = time.time()
    
    try:
        # ===== PASO 1: Obtener texto de la consulta =====
        if request.text:
            query_text = request.text
            logger.info(f"📝 Consulta por texto: '{query_text[:50]}...'")
        elif request.audio_base64:
            logger.info("🎙️ Consulta por audio, iniciando STT...")
            audio_bytes = base64.b64decode(request.audio_base64)
            
            # Intentar ElevenLabs STT, fallback a Google
            try:
                query_text = elevenlabs_service.speech_to_text_from_bytes(audio_bytes)
            except Exception as e:
                logger.warning(f"ElevenLabs STT falló: {str(e)}. Fallback a Google STT")
                query_text = google_stt_service.speech_to_text_from_bytes(audio_bytes)
        else:
            raise HTTPException(
                status_code=400,
                detail="Debe proporcionar 'text' o 'audio_base64'"
            )
        
        logger.info(f"✅ Texto de consulta: '{query_text}'")
        
        # ===== PASO 2: Consultar RAG service =====
        logger.info(f"🔍 Consultando RAG service (módulo: {request.module_type.value})")
        rag_response = await rag_client.query(
            question=query_text,
            module=request.module_type.value
        )
        
        logger.info(f"Respuesta del RAG: '{rag_response[:100]}...'")
        
        # ===== PASO 3: Convertir respuesta a audio =====
        # Routing basado en tipo de módulo
        service_used = "google"
        
        if request.module_type == ModuleType.SIMULATION:
            # Intentar ElevenLabs para simulación (más expresivo)
            try:
                logger.info("Usando ElevenLabs TTS para simulación")
                audio_bytes = elevenlabs_service.text_to_speech(rag_response)
                service_used = "elevenlabs"
            except Exception as e:
                logger.warning(f"ElevenLabs TTS falló: {str(e)}. Fallback a Google TTS")
                audio_bytes = google_tts_service.text_to_speech(rag_response)
                service_used = "google_fallback"
        else:
            # Teaching y Advisor usan Google TTS
            logger.info(f"Usando Google TTS para {request.module_type.value}")
            audio_bytes = google_tts_service.text_to_speech(rag_response)
        
        # Codificar audio a base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        # Calcular tiempo de procesamiento
        processing_time = int((time.time() - start_time) * 1000)
        
        logger.info(f"Query procesado en {processing_time}ms")
        
        return ProcessQueryResponse(
            text_response=rag_response,
            audio_base64=audio_base64,
            module_type=request.module_type,
            service_used=service_used,
            processing_time_ms=processing_time
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error procesando query: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error procesando consulta: {str(e)}"
        )


@router.post("/internal/tts", response_model=TTSResponse)
async def internal_tts(request: TTSRequest):
    """
    Endpoint interno: Convierte texto a audio.
    Usado por RAG service si necesita generar audio directamente.
    """
    try:
        logger.info(f"TTS interno para módulo {request.module_type.value}")
        
        # Routing basado en módulo
        if request.module_type == ModuleType.SIMULATION:
            try:
                audio_bytes = elevenlabs_service.text_to_speech(request.text)
                service_used = "elevenlabs"
            except Exception:
                audio_bytes = google_tts_service.text_to_speech(request.text)
                service_used = "google_fallback"
        else:
            audio_bytes = google_tts_service.text_to_speech(request.text)
            service_used = "google"
        
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return TTSResponse(
            audio_base64=audio_base64,
            service_used=service_used
        )
        
    except Exception as e:
        logger.error(f"Error en TTS interno: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en conversión TTS: {str(e)}"
        )


@router.post("/internal/stt", response_model=STTResponse)
async def internal_stt(request: STTRequest):
    """
    Endpoint interno: Convierte audio a texto.
    Usado si se necesita solo transcripción sin consultar RAG.
    """
    try:
        logger.info("STT interno")
        
        audio_bytes = base64.b64decode(request.audio_base64)
        
        # Intentar ElevenLabs, fallback a Google
        try:
            text = elevenlabs_service.speech_to_text_from_bytes(audio_bytes)
            service_used = "elevenlabs"
        except Exception:
            text = google_stt_service.speech_to_text_from_bytes(audio_bytes)
            service_used = "google_fallback"
        
        return STTResponse(
            text=text,
            service_used=service_used
        )
        
    except Exception as e:
        logger.error(f"Error en STT interno: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en conversión STT: {str(e)}"
        )


@router.get("/api/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Verifica el estado de todos los servicios.
    Incluye audio services y RAG service.
    """
    try:
        # Check ElevenLabs
        try:
            elevenlabs_service.client
            elevenlabs_status = "connected"
        except Exception:
            elevenlabs_status = "error"
        
        # Check Google TTS
        try:
            google_tts_service.client
            google_tts_status = "connected"
        except Exception:
            google_tts_status = "error"
        
        # Check Google STT
        try:
            google_stt_service.client
            google_stt_status = "connected"
        except Exception:
            google_stt_status = "error"
        
        # Check RAG service
        rag_available = await rag_client.health_check()
        rag_status = "connected" if rag_available else "unreachable"
        
        # Determinar estado general
        if all([
            elevenlabs_status == "connected",
            google_tts_status == "connected",
            google_stt_status == "connected",
            rag_status == "connected"
        ]):
            overall_status = "healthy"
        else:
            overall_status = "degraded"
        
        return HealthCheckResponse(
            status=overall_status,
            elevenlabs=elevenlabs_status,
            google_tts=google_tts_status,
            google_stt=google_stt_status,
            rag_service=rag_status,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error en health check: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en health check: {str(e)}"
        )
