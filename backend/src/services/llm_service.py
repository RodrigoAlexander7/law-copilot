"""
Servicio de comunicación con LLMs (OpenAI / Google Gemini).
Gestiona la generación de respuestas con contexto legal.
"""
import os
from abc import ABC, abstractmethod
from typing import Optional, List, Dict
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


class OpenAIService(BaseLLMService):
    """Servicio de OpenAI GPT."""
    
    def __init__(self, model: str = "gpt-4o-mini"):
        from openai import AsyncOpenAI
        
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = model
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.1
    ) -> str:
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=2000
        )
        
        return response.choices[0].message.content


class GeminiService(BaseLLMService):
    """Servicio de Google Gemini."""
    
    def __init__(self, model: str = "gemini-1.5-flash"):
        import google.generativeai as genai
        
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(model)
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.1
    ) -> str:
        # Gemini combina system prompt con el prompt del usuario
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"
        
        response = await self.model.generate_content_async(
            full_prompt,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": 2000
            }
        )
        
        return response.text


class LLMService:
    """
    Servicio unificado de LLM con prompts especializados en derecho peruano.
    Selecciona automáticamente el proveedor según las API keys disponibles.
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

    def __init__(self, provider: Optional[str] = None):
        """
        Inicializa el servicio LLM.
        
        Args:
            provider: 'openai', 'gemini', o None para auto-detectar
        """
        self.provider = provider or self._detect_provider()
        self._service: Optional[BaseLLMService] = None
    
    def _detect_provider(self) -> str:
        """Detecta qué proveedor usar según las API keys disponibles."""
        if settings.openai_api_key:
            return "openai"
        elif settings.gemini_api_key:
            return "gemini"
        else:
            raise ValueError(
                "No se encontró ninguna API key. "
                "Configura OPENAI_API_KEY o GEMINI_API_KEY en el archivo .env"
            )
    
    def _get_service(self) -> BaseLLMService:
        """Obtiene o crea la instancia del servicio."""
        if self._service is None:
            if self.provider == "openai":
                self._service = OpenAIService()
            elif self.provider == "gemini":
                self._service = GeminiService()
            else:
                raise ValueError(f"Proveedor no soportado: {self.provider}")
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
