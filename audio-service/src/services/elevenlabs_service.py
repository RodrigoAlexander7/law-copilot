"""
Servicio de ElevenLabs para TTS y STT.
Maneja text-to-speech y speech-to-text con la API de ElevenLabs.
"""

from elevenlabs.client import ElevenLabs
import requests
from src.core.config import settings
import logging

logger = logging.getLogger(__name__)


class ElevenLabsService:
    """Servicio para interactuar con la API de ElevenLabs."""
    
    def __init__(self):
        """Inicializa configuración (client se crea al primer uso)."""
        self.api_key = settings.elevenlabs_api_key
        self.voice_id = settings.elevenlabs_voice_id
        self._client = None
        logger.info("ElevenLabs service configurado (lazy init)")
    
    @property
    def client(self):
        """Lazy initialization del cliente de ElevenLabs."""
        if self._client is None:
            self._client = ElevenLabs(api_key=self.api_key)
            logger.info("Cliente ElevenLabs inicializado")
        return self._client
    
    def text_to_speech(self, text: str) -> bytes:
        """
        Convierte texto a audio usando ElevenLabs.
        
        Args:
            text: Texto a convertir
            
        Returns:
            Audio en bytes
            
        Raises:
            Exception: Si hay error en la conversión
        """
        try:
            logger.info(f"Generando audio con ElevenLabs: '{text[:50]}...'")
            
            audio = self.client.generate(
                text=text,
                voice=self.voice_id,
                model="eleven_multilingual_v2"
            )
            
            # Convertir generator a bytes
            audio_bytes = b"".join(audio)
            logger.info(f"Audio generado ({len(audio_bytes)} bytes)")
            
            return audio_bytes
            
        except Exception as e:
            logger.error(f"Error en ElevenLabs TTS: {str(e)}")
            raise Exception(f"ElevenLabs TTS error: {str(e)}")
    
    def speech_to_text_from_bytes(self, audio_bytes: bytes) -> str:
        """
        Convierte audio a texto usando ElevenLabs STT.
        
        Args:
            audio_bytes: Audio en bytes
            
        Returns:
            Texto transcrito
            
        Raises:
            Exception: Si hay error en la transcripción
        """
        try:
            logger.info(f"Transcribiendo audio con ElevenLabs ({len(audio_bytes)} bytes)")
            
            url = "https://api.elevenlabs.io/v1/speech-to-text"
            headers = {"xi-api-key": self.api_key}
            
            files = {
                "file": ("audio.mp3", audio_bytes, "audio/mpeg")
            }
            data = {
                "model_id": "scribe_v1"
            }
            
            response = requests.post(url, headers=headers, files=files, data=data)
            
            if response.status_code != 200:
                error_detail = response.json() if response.text else {}
                raise Exception(f"STT API error: {response.status_code} - {error_detail}")
            
            result = response.json()
            text = result.get("text", "")
            
            logger.info(f"Audio transcrito: '{text[:50]}...'")
            return text
            
        except Exception as e:
            logger.error(f"Error en ElevenLabs STT: {str(e)}")
            raise Exception(f"ElevenLabs STT error: {str(e)}")


# Instancia global del servicio
elevenlabs_service = ElevenLabsService()
