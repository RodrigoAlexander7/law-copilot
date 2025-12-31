"""
Servicio de Google Cloud Speech-to-Text.
Proporciona STT con soporte para español peruano.
"""

from google.cloud import speech
from google.oauth2 import service_account
from src.core.config import settings
import io
import logging
import os

logger = logging.getLogger(__name__)


class GoogleSTTService:
    """Servicio para Google Cloud Speech-to-Text."""
    
    def __init__(self):
        """Inicializa configuración (client se crea al primer uso)."""
        self._client = None
        logger.info("Google STT service configurado (lazy init)")
    
    @property
    def client(self):
        """Lazy initialization del cliente de Google STT."""
        if self._client is None:
            try:
                # Usar la variable de entorno GOOGLE_APPLICATION_CREDENTIALS
                # que fue configurada por setup_google_credentials() en el startup
                credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
                
                if credentials_path and os.path.exists(credentials_path):
                    # Crear cliente con credenciales explícitas desde el archivo
                    credentials = service_account.Credentials.from_service_account_file(
                        credentials_path
                    )
                    self._client = speech.SpeechClient(credentials=credentials)
                    logger.info(f"Cliente Google STT inicializado desde: {credentials_path}")
                else:
                    # Fallback: intentar con credenciales por defecto
                    self._client = speech.SpeechClient()
                    logger.info("Cliente Google STT inicializado con credenciales por defecto")
            except Exception as e:
                logger.error(f"Error inicializando Google STT: {str(e)}")
                raise
        return self._client
    
    def speech_to_text_from_bytes(self, audio_bytes: bytes) -> str:
        """
        Convierte audio a texto usando Google STT.
        
        Args:
            audio_bytes: Audio en bytes
            
        Returns:
            Texto transcrito
            
        Raises:
            Exception: Si hay error en la transcripción
        """
        try:
            logger.info(f"Transcribiendo audio con Google STT ({len(audio_bytes)} bytes)")
            
            # Configurar audio
            audio = speech.RecognitionAudio(content=audio_bytes)
            
            # Configurar reconocimiento
            config = speech.RecognitionConfig(
                encoding=speech.RecognitionConfig.AudioEncoding.MP3,
                language_code="es-PE",  # Español (Perú)
                enable_automatic_punctuation=True,
                model="default"
            )
            
            # Realizar transcripción
            response = self.client.recognize(config=config, audio=audio)
            
            # Extraer texto
            if not response.results:
                return ""
            
            transcripts = []
            for result in response.results:
                if result.alternatives:
                    transcripts.append(result.alternatives[0].transcript)
            
            text = " ".join(transcripts)
            logger.info(f"Audio transcrito: '{text[:50]}...'")
            
            return text
            
        except Exception as e:
            logger.error(f"Error en Google STT: {str(e)}")
            raise Exception(f"Google STT error: {str(e)}")


# Instancia global del servicio
google_stt_service = GoogleSTTService()
