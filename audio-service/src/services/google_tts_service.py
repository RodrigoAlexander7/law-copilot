"""
Servicio de Google Cloud Text-to-Speech.
Proporciona TTS de alta calidad con voces Neural2.
"""

from google.cloud import texttospeech
from google.oauth2 import service_account
from src.core.config import settings
import logging
import os

logger = logging.getLogger(__name__)


class GoogleTTSService:
    """Servicio para Google Cloud Text-to-Speech."""
    
    def __init__(self):
        """Inicializa configuración (client se crea al primer uso)."""
        self.voice_name = settings.google_tts_voice_name
        self.language_code = settings.google_tts_language_code
        self._client = None
        logger.info("Google TTS service configurado (lazy init)")
    
    @property
    def client(self):
        """Lazy initialization del cliente de Google TTS."""
        if self._client is None:
            try:
                # Establecer variable de entorno para Google Cloud
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = settings.google_application_credentials
                
                # Crear cliente con credenciales explícitas
                credentials = service_account.Credentials.from_service_account_file(
                    settings.google_application_credentials
                )
                self._client = texttospeech.TextToSpeechClient(credentials=credentials)
                logger.info("Cliente Google TTS inicializado")
            except Exception as e:
                logger.error(f"Error inicializando Google TTS: {str(e)}")
                raise
        return self._client
    
    def text_to_speech(
        self, 
        text: str,
        speaking_rate: float = 1.15,
        pitch: float = 0.0
    ) -> bytes:
        """
        Convierte texto a audio usando Google TTS.
        
        Args:
            text: Texto a convertir
            speaking_rate: Velocidad del habla (0.25 - 4.0)
            pitch: Tono de voz (-20.0 a 20.0)
            
        Returns:
            Audio en bytes (MP3)
            
        Raises:
            Exception: Si hay error en la conversión
        """
        try:
            logger.info(f"Generando audio con Google TTS: '{text[:50]}...'")
            
            # Configurar input de texto
            synthesis_input = texttospeech.SynthesisInput(text=text)
            
            # Configurar voz
            voice = texttospeech.VoiceSelectionParams(
                language_code=self.language_code,
                name=self.voice_name
            )
            
            # Configurar audio
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=speaking_rate,
                pitch=pitch
            )
            
            # Realizar síntesis
            response = self.client.synthesize_speech(
                input=synthesis_input,
                voice=voice,
                audio_config=audio_config
            )
            
            logger.info(f"Audio generado ({len(response.audio_content)} bytes)")
            return response.audio_content
            
        except Exception as e:
            logger.error(f"Error en Google TTS: {str(e)}")
            raise Exception(f"Google TTS error: {str(e)}")


# Instancia global del servicio
google_tts_service = GoogleTTSService()
