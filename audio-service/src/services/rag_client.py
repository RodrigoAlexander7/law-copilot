"""
Cliente HTTP para comunicación con el RAG service.
Maneja requests al backend de LangChain para obtener respuestas legales.
"""

import httpx
import logging
from typing import Optional
from src.core.config import settings

logger = logging.getLogger(__name__)


class RAGClient:
    """Cliente para interactuar con el RAG service."""
    
    def __init__(self):
        """Inicializa el cliente HTTP para RAG."""
        self.base_url = settings.rag_service_url
        self.timeout = settings.rag_service_timeout
        logger.info(f"RAG Client inicializado: {self.base_url}")
    
    async def query(self, question: str, module: str) -> str:
        """
        Envía una consulta al RAG service y obtiene la respuesta.
        
        Args:
            question: Pregunta del usuario
            module: Tipo de módulo (teaching, simulation, advisor)
            
        Returns:
            Respuesta en texto del RAG
            
        Raises:
            Exception: Si hay error en la comunicación con RAG
        """
        # Modo mock para testing sin RAG
        if settings.mock_rag:
            logger.info("Modo MOCK activado - Retornando respuesta simulada")
            return self._get_mock_response(question, module)
        
        try:
            logger.info(f"Enviando consulta a RAG: '{question[:50]}...'")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                # El backend RAG usa /api/v1/query y espera "query" (no "question")
                response = await client.post(
                    f"{self.base_url}/api/v1/query",
                    json={
                        "query": question,
                        "top_k": 5,
                        "score_threshold": 0.3
                    }
                )
                response.raise_for_status()
                
                data = response.json()
                answer = data.get("answer", "")
                
                # Log las fuentes usadas para debugging
                sources = data.get("sources", [])
                if sources:
                    logger.info(f"📚 Fuentes usadas: {len(sources)} artículos")
                    for src in sources[:2]:  # Mostrar las 2 primeras
                        logger.info(f"   - {src.get('label', 'N/A')} (score: {src.get('similarity_score', 0):.2f})")
                
                logger.info(f"✅ Respuesta de RAG recibida ({len(answer)} chars)")
                return answer
                
        except httpx.TimeoutException:
            logger.error(f"Timeout al consultar RAG ({self.timeout}s)")
            raise Exception(f"RAG service timeout después de {self.timeout}s")
        except httpx.HTTPStatusError as e:
            logger.error(f"Error HTTP del RAG: {e.response.status_code}")
            raise Exception(f"RAG service error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Error al comunicarse con RAG: {str(e)}")
            raise Exception(f"Error al comunicarse con RAG: {str(e)}")
    
    def _get_mock_response(self, question: str, module: str) -> str:
        """
        Genera respuesta mock para testing sin RAG.
        
        Args:
            question: Pregunta del usuario
            module: Tipo de módulo
            
        Returns:
            Respuesta simulada
        """
        mock_responses = {
            "teaching": f"Respuesta MOCK para módulo de enseñanza. Tu pregunta fue: {question}. El artículo 2 de la Constitución Política del Perú establece los derechos fundamentales de la persona, incluyendo el derecho a la vida, a la identidad, al libre desarrollo y bienestar.",
            "simulation": f"Respuesta MOCK para simulación de debate. Pregunta: {question}. En base a la evidencia presentada y el marco legal aplicable, se determina que el artículo en cuestión protege los derechos fundamentales establecidos en la Constitución.",
            "advisor": f"Respuesta MOCK para módulo asesor. Consulta: {question}. Le recomiendo revisar el artículo correspondiente de la Constitución. Para su caso específico, los artículos 2, 138 y 139 son relevantes."
        }
        
        return mock_responses.get(module, f"Respuesta mock genérica para: {question}")

    
    async def health_check(self) -> bool:
        """
        Verifica si el RAG service está disponible.
        
        Returns:
            True si el servicio responde, False en caso contrario
        """
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                # El backend usa /api/v1/health
                response = await client.get(f"{self.base_url}/api/v1/health")
                return response.status_code == 200
        except Exception:
            return False


# Instancia global del cliente
rag_client = RAGClient()
