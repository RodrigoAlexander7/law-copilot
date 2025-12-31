"""
Servicio de comunicación con Google Gemini.
Gestiona la generación de respuestas con contexto legal.
"""
from abc import ABC, abstractmethod
from typing import Optional
from src.core.config import settings


class BaseLLMService(ABC):
    """Interfaz base para servicios de LLM."""
    
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.1
    ) -> str:
        """Genera una respuesta dado un prompt."""
        pass


class GeminiService(BaseLLMService):
    """Servicio de Google Gemini usando el nuevo SDK google-genai."""
    
    def __init__(self):
        from google import genai
        
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model = settings.llm_model
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None
    ) -> str:
        from google.genai import types
        
        # Usar valores de settings si no se especifican
        temp = temperature if temperature is not None else settings.llm_temperature
        
        # Construir configuración
        config = types.GenerateContentConfig(
            temperature=temp,
            max_output_tokens=settings.llm_max_tokens,
            system_instruction=system_prompt
        )
        
        # Llamada async al modelo
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config
        )
        
        return response.text


class LLMService:
    """
    Servicio de LLM con prompts especializados en derecho peruano.
    Utiliza Google Gemini como proveedor.
    """
    
    SYSTEM_PROMPT = """Eres un asistente legal especializado en el marco jurídico peruano. 
Tu rol es ayudar a ciudadanos y profesionales a entender la legislación peruana de manera clara y precisa.

INSTRUCCIONES:
1. Basa tus respuestas ÚNICAMENTE en los artículos proporcionados como contexto
2. Cita siempre el artículo específico que sustenta tu respuesta (ej: "Según el Artículo 2 de la Constitución...")
3. Si el contexto no contiene información suficiente, indícalo claramente
4. Usa un lenguaje claro y accesible, evitando jerga legal innecesaria
5. Si hay conflicto entre normas, menciona el principio de jerarquía normativa
6. NO inventes artículos ni información que no esté en el contexto

FORMATO DE RESPUESTA:
- Respuesta directa a la pregunta
- Fundamento legal (artículos citados)
- Explicación en términos simples si es necesario

IMPORTANTE: Eres un asistente informativo, NO un abogado. Siempre recomienda consultar con un profesional para casos específicos."""

    def __init__(self):
        """Inicializa el servicio LLM con Gemini."""
        if not settings.gemini_api_key:
            raise ValueError(
                "No se encontró GEMINI_API_KEY. "
                "Configúrala en el archivo .env"
            )
        self._service: Optional[GeminiService] = None
    
    def _get_service(self) -> GeminiService:
        """Obtiene o crea la instancia del servicio."""
        if self._service is None:
            self._service = GeminiService()
        return self._service
    
    async def generate_response(
        self,
        query: str,
        context: str,
        temperature: float = 0.1
    ) -> str:
        """
        Genera una respuesta legal basada en el contexto recuperado.
        
        Args:
            query: Pregunta del usuario
            context: Artículos relevantes recuperados del vector store
            temperature: Creatividad de la respuesta (0-1)
            
        Returns:
            Respuesta generada por el LLM
        """
        prompt = self._build_prompt(query, context)
        service = self._get_service()
        
        return await service.generate(
            prompt=prompt,
            system_prompt=self.SYSTEM_PROMPT,
            temperature=temperature
        )
    
    def _build_prompt(self, query: str, context: str) -> str:
        """Construye el prompt con la query y el contexto."""
        return f"""CONTEXTO LEGAL (Artículos relevantes de la legislación peruana):
{context}

---

PREGUNTA DEL USUARIO:
{query}

---

Por favor, responde la pregunta basándote ÚNICAMENTE en los artículos proporcionados arriba."""


# Instancia global
llm_service = LLMService()
