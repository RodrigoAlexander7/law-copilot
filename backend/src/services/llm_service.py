"""
Servicio de comunicación con Google Gemini.
Gestiona la generación de respuestas con contexto legal.
"""
from typing import Optional, Type
from src.core.config import settings
from pydantic import BaseModel
from src.infrastructure.models import LegalOutput


class GeminiService:
    """Servicio de Google Gemini usando el SDK google-genai."""
    
    def __init__(self):
        from google import genai
        
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model = settings.llm_model
    
    async def generate(
        self,
        model: Type[BaseModel],
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
    ) -> str:
        from google.genai import types
        
        temp = temperature if temperature is not None else settings.llm_temperature
        
        config = types.GenerateContentConfig(
            temperature=temp,
            max_output_tokens=settings.llm_max_tokens,
            system_instruction=system_prompt,
            response_mime_type="application/json",
            response_json_schema=model.model_json_schema(),
        )
        
        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=prompt,
            config=config
        )
        
        return response.text or ""


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

    QUERY_REWRITE_PROMPT = """Eres un experto en derecho peruano. Tu tarea es transformar consultas coloquiales de usuarios en búsquedas optimizadas para un sistema de recuperación de documentos legales.

CONTEXTO DEL SISTEMA:
- Base de datos contiene: Constitución Política del Perú, Código Civil, Código Penal, Ley de Protección al Consumidor, Ley contra la Violencia Familiar, entre otras.
- El sistema usa embeddings semánticos para buscar artículos relevantes.

INSTRUCCIONES:
1. Identifica el TEMA LEGAL principal de la consulta
2. Extrae los CONCEPTOS JURÍDICOS aplicables (ej: "garantía", "defecto de fábrica", "derecho de consumidor")
3. Genera 2-3 variantes de búsqueda usando terminología legal peruana
4. Incluye términos que probablemente aparezcan en los artículos de ley

EJEMPLOS DE SALIDA:

Usuario: "Me vendieron un celular que no prende"
Salida:
{
    "tema_legal": "Protección al consumidor - productos defectuosos",
    "conceptos_clave": ["producto defectuoso", "garantía legal", "derecho a reparación", "derecho a cambio"],
    "queries_optimizadas": [
        "derecho del consumidor producto defectuoso garantía reparación cambio devolución",
        "idoneidad producto responsabilidad proveedor defecto",
        "garantía implícita producto consumidor reemplazo restitución"
    ],
    "leyes_relevantes": ["Código de Protección y Defensa del Consumidor", "Ley 29571"]
}

Usuario: "Mi vecino hace mucho ruido en las noches"
Salida:
{
    "tema_legal": "Derechos de vecindad - perturbación de la tranquilidad",
    "conceptos_clave": ["ruidos molestos", "tranquilidad pública", "derechos de vecindad"],
    "queries_optimizadas": [
        "perturbación tranquilidad ruidos molestos vecindad",
        "límites propiedad obligaciones vecinos inmisiones",
        "contravención tranquilidad pública ruido"
    ],
    "leyes_relevantes": ["Código Civil", "Ordenanzas municipales"]
}

Ahora transforma la siguiente consulta:"""

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
    
    async def rewrite_query(self, user_query: str) -> dict:
        """
        Transforma una consulta coloquial en búsquedas optimizadas para RAG.
        
        Args:
            user_query: Pregunta original del usuario en lenguaje natural
            
        Returns:
            Dict con queries optimizadas y metadata legal
        """
        import json
        
        service = self._get_service()
        
        prompt = f"{self.QUERY_REWRITE_PROMPT}\n\nUsuario: \"{user_query}\""
        
        try:
            response = await service.generate(
                model=LegalOutput,
                prompt=prompt,
                system_prompt=None,
                temperature=0.3
            )
            
            # Con structured output, el JSON ya viene limpio
            result = json.loads(response)
            return result
            
        except (json.JSONDecodeError, Exception):
            # Fallback: retornar query original si falla
            return {
                "tema_legal": "No identificado",
                "conceptos_clave": [],
                "queries_optimizadas": [user_query],
                "leyes_relevantes": []
            }
    
    def build_enhanced_query(self, rewrite_result: dict, original_query: str) -> str:
        """
        Construye una query enriquecida combinando las variantes optimizadas.
        
        Args:
            rewrite_result: Resultado de rewrite_query
            original_query: Query original del usuario
            
        Returns:
            Query combinada optimizada para embedding
        """
        queries = rewrite_result.get("queries_optimizadas", [original_query])
        conceptos = rewrite_result.get("conceptos_clave", [])
        
        # Combinar: query original + conceptos clave + primera query optimizada
        parts = [original_query]
        
        if conceptos:
            parts.append(" ".join(conceptos[:4]))  # Max 4 conceptos
        
        if queries and queries[0] != original_query:
            parts.append(queries[0])
        
        return " | ".join(parts)

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
            temperature=temperature,
            model=LegalOutput
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
