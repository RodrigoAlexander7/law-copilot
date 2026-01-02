"""
Servicio RAG (Retrieval-Augmented Generation).
Orquesta el flujo completo: query → embedding → búsqueda → generación.
"""
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from src.core.config import settings
from src.infrastructure.embedder import LegalEmbedder
from src.infrastructure.vector_store import vector_store
from src.services.llm_service import llm_service


@dataclass
class RAGResponse:
    """Respuesta estructurada del sistema RAG."""
    answer: str
    sources: List[Dict]
    query: str
    total_sources_found: int
    rewrite_info: Optional[Dict] = None  # Info del query rewriting


class RAGService:
    """
    Servicio principal que orquesta el flujo RAG.
    
    Flujo:
    1. Recibe query del usuario
    2. Genera embedding de la query
    3. Busca documentos similares en FAISS
    4. Construye contexto con los documentos
    5. Genera respuesta con el LLM
    6. Retorna respuesta + fuentes citadas
    """
    
    def __init__(
        self,
        top_k: Optional[int] = None,
        score_threshold: Optional[float] = None,
        temperature: Optional[float] = None
    ):
        """
        Inicializa el servicio RAG.
        Usa valores de settings por defecto.
        
        Args:
            top_k: Número de documentos a recuperar
            score_threshold: Umbral mínimo de similitud
            temperature: Creatividad del LLM
        """
        self.embedder = LegalEmbedder()
        self.top_k = top_k or settings.rag_top_k
        self.score_threshold = score_threshold or settings.rag_score_threshold
        self.temperature = temperature or settings.llm_temperature
    
    async def query(
        self,
        user_query: str,
        top_k: Optional[int] = None,
        score_threshold: Optional[float] = None,
        use_query_rewriting: bool = True
    ) -> RAGResponse:
        """
        Procesa una consulta del usuario y genera una respuesta.
        
        Args:
            user_query: Pregunta del usuario en lenguaje natural
            top_k: Override del número de documentos a recuperar
            score_threshold: Override del umbral de similitud
            use_query_rewriting: Si True, reescribe la query para mejor retrieval
            
        Returns:
            RAGResponse con la respuesta y las fuentes
        """
        k = top_k or self.top_k
        threshold = score_threshold or self.score_threshold
        
        rewrite_info = None
        search_query = user_query
        
        # 1. Query Rewriting (opcional pero recomendado)
        if use_query_rewriting:
            try:
                rewrite_info = await llm_service.rewrite_query(user_query)
                search_query = llm_service.build_enhanced_query(rewrite_info, user_query)
            except Exception:
                # Si falla el rewriting, usar query original
                search_query = user_query
        
        # 2. Generar embedding de la query (original o mejorada)
        query_embedding = self.embedder.embed_query(search_query)
        
        # 3. Buscar documentos similares
        sources, context = vector_store.search_with_context(
            query_embedding=query_embedding,
            k=k,
            score_threshold=threshold
        )
        
        # 4. Si no hay resultados y usamos rewriting, intentar con queries alternativas
        if not sources and rewrite_info and len(rewrite_info.get("queries_optimizadas", [])) > 1:
            for alt_query in rewrite_info["queries_optimizadas"][1:]:
                alt_embedding = self.embedder.embed_query(alt_query)
                sources, context = vector_store.search_with_context(
                    query_embedding=alt_embedding,
                    k=k,
                    score_threshold=threshold * 0.8  # Umbral más permisivo
                )
                if sources:
                    break
        
        # 5. Generar respuesta con LLM
        if not sources:
            answer = (
                "No encontré artículos relevantes para tu consulta en la base de datos legal. "
                "Por favor, intenta reformular tu pregunta o consulta con un abogado especializado."
            )
        else:
            answer = await llm_service.generate_response(
                query=user_query,  # Siempre usar query original para la respuesta
                context=context,
                temperature=self.temperature
            )
        
        # 6. Formatear fuentes para la respuesta
        formatted_sources = self._format_sources(sources)
        
        return RAGResponse(
            answer=answer,
            sources=formatted_sources,
            query=user_query,
            total_sources_found=len(sources),
            rewrite_info=rewrite_info
        )
    
    def _format_sources(self, sources: List[Dict]) -> List[Dict]:
        """Formatea las fuentes para incluir en la respuesta."""
        formatted = []
        for source in sources:
            payload = source.get('payload', {})
            hierarchy = source.get('hierarchy', {})
            
            formatted.append({
                "id": source.get('id', ''),
                "source": source.get('source_id', ''),
                "label": payload.get('label', ''),
                "text": payload.get('text_content', '')[:500] + "..." 
                        if len(payload.get('text_content', '')) > 500 
                        else payload.get('text_content', ''),
                "hierarchy": {
                    "title": hierarchy.get('level_1', ''),
                    "chapter": hierarchy.get('level_2', ''),
                    "section": hierarchy.get('level_3', '')
                },
                "similarity_score": source.get('similarity_score', 0)
            })
        
        return formatted
    
    def retrieve_only(
        self,
        user_query: str,
        top_k: Optional[int] = None,
        score_threshold: Optional[float] = None
    ) -> Tuple[List[Dict], str]:
        """
        Solo recupera documentos sin generar respuesta (útil para debug).
        
        Returns:
            Tuple de (documentos, contexto formateado)
        """
        k = top_k or self.top_k
        threshold = score_threshold or self.score_threshold
        
        query_embedding = self.embedder.embed_query(user_query)
        return vector_store.search_with_context(
            query_embedding=query_embedding,
            k=k,
            score_threshold=threshold
        )
    
    def health_check(self) -> Dict:
        """Verifica el estado del servicio."""
        return {
            "status": "healthy",
            "embedder": "loaded",
            "vector_store": {
                "status": "loaded",
                "total_documents": vector_store.total_documents
            },
            "llm_provider": "gemini"
        }


# Instancia global
rag_service = RAGService()
