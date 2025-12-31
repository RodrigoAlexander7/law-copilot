"""
Wrapper para FAISS - Carga y búsqueda en el índice vectorial.
Permite buscar documentos similares dado un embedding de query.
"""
import faiss
import pickle
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from src.core.config import settings


class LegalVectorStore:
    """
    Gestiona el índice FAISS y los metadatos de documentos legales.
    Patrón Singleton para evitar cargar el índice múltiples veces.
    """
    
    _instance = None
    
    # cls is a self instance of the class (similar to self )
    # self -> a instance of the class
    # cls -> the class itself
    # cls is used to ensure the singleton patern
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def _initialize(self, index_name: str = "legal_index"):
        """Carga el índice FAISS y los metadatos."""
        if self._initialized:
            return
            
        index_path = settings.INDEXES_DIR / f"{index_name}.faiss"

        # the .pkl file contains the whole list of documents on the sale indexation order
        metadata_path = settings.INDEXES_DIR / f"{index_name}_metadata.pkl"
        
        if not index_path.exists():
            raise FileNotFoundError(f"Índice FAISS no encontrado: {index_path}")
        if not metadata_path.exists():
            raise FileNotFoundError(f"Metadatos no encontrados: {metadata_path}")
        
        print(f"📂 Cargando índice FAISS desde: {index_path}")
        self.index = faiss.read_index(str(index_path))
        
        print(f"📂 Cargando metadatos desde: {metadata_path}")
        with open(metadata_path, 'rb') as f:
            self.documents = pickle.load(f)
        
        self._initialized = True
        print(f"Vector store inicializado: {self.index.ntotal} documentos")
    
    def ensure_loaded(self, index_name: str = "legal_index"):
        """Asegura que el índice esté cargado (lazy loading)."""
        if not self._initialized:
            self._initialize(index_name)
    
    def search(
        self, 
        query_embedding: np.ndarray, 
        k: int = 4,
        score_threshold: Optional[float] = None
    ) -> List[Dict]:
        """
        Busca los k documentos más similares al embedding de la query.
        
        Args:
            query_embedding: Vector de la query (debe estar normalizado)
            k: Número de resultados a retornar
            score_threshold: Umbral mínimo de similitud (0-1). None = sin filtro
            
        Returns:
            Lista de documentos con su score de similitud
        """
        self.ensure_loaded()
        
        # Asegurar formato correcto para FAISS
        if query_embedding.ndim == 1: # num of dimensions of an array of NumPy
            # Como en un mismo prompt pueden ir varias consultas, el vector debe tener esta forma
            # (n x m) donde n es el numero de consultas y m es la dimension de cada vector
            query_embedding = query_embedding.reshape(1, -1)
        query_embedding = query_embedding.astype(np.float32)
        
        # Búsqueda en FAISS
        # scores: similitud (producto punto, que es coseno con vectores normalizados)
        # indices: posiciones en el índice
        scores, indices = self.index.search(query_embedding, k)
        
        # Extraer resultados
            #scores  = [[0.95, 0.87, 0.80]]
            #indices = [[12, 7, 3]]

        results = []
        for score, idx in zip(scores[0], indices[0]):
            # FAISS retorna -1 si no hay suficientes resultados
            if idx == -1:
                continue
                
            # Filtrar por umbral si se especifica (valor de -1 a 1 para ver similitud)
            if score_threshold is not None and score < score_threshold:
                continue
            
            # Recuperar documento original
            doc = self.documents[idx].copy()
            doc['similarity_score'] = float(score)
            results.append(doc)
        
        return results
    
    def search_with_context(
        self,
        query_embedding: np.ndarray,
        k: int = 5,
        score_threshold: float = 0.3
    ) -> Tuple[List[Dict], str]:
        """
        Busca documentos y genera un contexto formateado para el LLM.
        
        Returns:
            Tuple de (documentos encontrados, contexto formateado como string)
        """
        results = self.search(query_embedding, k, score_threshold)
        
        if not results:
            return [], "No se encontraron artículos relevantes."
        
        # Formatear contexto para el LLM
        context_parts = []
        for i, doc in enumerate(results, 1):
            payload = doc.get('payload', {})
            hierarchy = doc.get('hierarchy', {})
            source_id = doc.get('source_id', 'Fuente desconocida')
            
            # Construir referencia legible
            source_name = self._format_source_name(source_id)
            hierarchy_str = self._format_hierarchy(hierarchy)
            
            context_parts.append(
                f"[{i}] {source_name}\n"
                f"    {hierarchy_str}\n"
                f"    {payload.get('label', '')}: {payload.get('text_content', '')}\n"
                f"    (Relevancia: {doc['similarity_score']:.2%})"
            )
        
        context = "\n\n".join(context_parts)
        return results, context
    
    def _format_source_name(self, source_id: str) -> str:
        """Convierte el source_id en un nombre legible."""
        mapping = {
            "constitucion_1993": "Constitución Política del Perú (1993)",
            "codigo_civil": "Código Civil del Perú",
            "codigo_proteccion_consumidor_29571": "Código de Protección al Consumidor (Ley 29571)",
            "ley_30364_violencia_mujer": "Ley 30364 - Violencia contra la Mujer"
        }
        return mapping.get(source_id, source_id.replace("_", " ").title())
    
    def _format_hierarchy(self, hierarchy: Dict) -> str:
        """Formatea la jerarquía del documento."""
        parts = []
        for level in ['level_1', 'level_2', 'level_3']:
            if hierarchy.get(level):
                parts.append(hierarchy[level])
        return " > ".join(parts) if parts else ""
    
    @property
    def total_documents(self) -> int:
        """Retorna el número total de documentos indexados."""
        self.ensure_loaded()
        return self.index.ntotal


# Instancia global (singleton)
vector_store = LegalVectorStore()
