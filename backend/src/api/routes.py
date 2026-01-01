"""
Definición de endpoints de la API.
"""
from fastapi import APIRouter, HTTPException, status
from src.api.schemas import (
    QueryRequest,
    QueryResponse,
    QueryRewriteInfo,
    RetrieveRequest,
    RetrieveResponse,
    HealthResponse,
    SourceDocument,
    SourceHierarchy
)
from src.services.rag_service import rag_service

router = APIRouter()


@router.post(
    "/query",
    response_model=QueryResponse,
    summary="Consulta Legal con IA",
    description="Procesa una pregunta legal y genera una respuesta basada en la legislación peruana.",
    tags=["RAG"]
)
async def query_legal(request: QueryRequest) -> QueryResponse:
    """
    Endpoint principal para consultas legales.
    
    Flujo:
    1. Recibe la pregunta del usuario
    2. Busca artículos relevantes en la base de datos vectorial
    3. Genera una respuesta usando el LLM con el contexto legal
    4. Retorna la respuesta junto con las fuentes citadas
    """
    try:
        response = await rag_service.query(
            user_query=request.query,
            top_k=request.top_k,
            score_threshold=request.score_threshold
        )
        
        # Convertir a modelo de respuesta
        sources = [
            SourceDocument(
                id=s["id"],
                source=s["source"],
                label=s["label"],
                text=s["text"],
                hierarchy=SourceHierarchy(**s["hierarchy"]),
                similarity_score=s["similarity_score"]
            )
            for s in response.sources
        ]
        
        # Convertir rewrite_info si existe
        rewrite_info = None
        if response.rewrite_info:
            rewrite_info = QueryRewriteInfo(
                tema_legal=response.rewrite_info.get("tema_legal"),
                conceptos_clave=response.rewrite_info.get("conceptos_clave", []),
                queries_optimizadas=response.rewrite_info.get("queries_optimizadas", []),
                leyes_relevantes=response.rewrite_info.get("leyes_relevantes", [])
            )
        
        return QueryResponse(
            answer=response.answer,
            sources=sources,
            query=response.query,
            total_sources_found=response.total_sources_found,
            rewrite_info=rewrite_info
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error procesando la consulta: {str(e)}"
        )


@router.post(
    "/retrieve",
    response_model=RetrieveResponse,
    summary="Recuperar Documentos",
    description="Busca documentos relevantes sin generar respuesta (útil para debug).",
    tags=["RAG"]
)
async def retrieve_documents(request: RetrieveRequest) -> RetrieveResponse:
    """
    Endpoint para solo recuperar documentos sin generación LLM.
    Útil para debugging y pruebas del sistema de búsqueda.
    """
    try:
        sources, context = rag_service.retrieve_only(
            user_query=request.query,
            top_k=request.top_k,
            score_threshold=request.score_threshold
        )
        
        # Formatear documentos
        documents = []
        for source in sources:
            payload = source.get('payload', {})
            hierarchy = source.get('hierarchy', {})
            
            documents.append(
                SourceDocument(
                    id=source.get('id', ''),
                    source=source.get('source_id', ''),
                    label=payload.get('label', ''),
                    text=payload.get('text_content', '')[:500],
                    hierarchy=SourceHierarchy(
                        title=hierarchy.get('level_1', ''),
                        chapter=hierarchy.get('level_2', ''),
                        section=hierarchy.get('level_3', '')
                    ),
                    similarity_score=source.get('similarity_score', 0)
                )
            )
        
        return RetrieveResponse(
            documents=documents,
            context=context,
            query=request.query,
            total_found=len(documents)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en la búsqueda: {str(e)}"
        )


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health Check",
    description="Verifica el estado del servicio y sus componentes.",
    tags=["System"]
)
async def health_check() -> HealthResponse:
    """
    Endpoint de salud del servicio.
    Verifica que todos los componentes estén funcionando.
    """
    try:
        health = rag_service.health_check()
        return HealthResponse(**health)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Servicio no disponible: {str(e)}"
        )
