"""
Wrapper to generate embedings using SentenceTransformer
Used by both indexer (raw files just one time) and rag_service (queries).
"""
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Union
from src.core.config import settings


class LegalEmbedder:
    """Singleton que carga el modelo UNA sola vez."""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        print(f"Cargando modelo: {settings.embedding_model}...")
        self.model = SentenceTransformer(settings.embedding_model, device='cpu')
        self.embedding_dim = self.model.get_sentence_embedding_dimension()
        print(f"Modelo cargado. Dimensiones: {self.embedding_dim}")
    
    def prepare_text(self, doc: Dict) -> str:
        """Enriquece el texto con contexto jerárquico."""
        hierarchy = doc.get('hierarchy', {})
        source_type = doc.get('source_type', '').capitalize()
        
        context_parts = [
            source_type,
            hierarchy.get('level_1', ''),
            hierarchy.get('level_2', ''),
            doc['payload']['label'],
            doc['payload']['text_content']
        ]
        return ". ".join([p for p in context_parts if p and p.strip()])
    
    def embed_query(self, query: str) -> np.ndarray:
        """Embebe una query del usuario (single text)."""
        return self.model.encode(
            query,
            convert_to_numpy=True,
             # IMPORTANTE!
            # SE EXPLICA ABAJO EN embed_documents

            normalize_embeddings=True
        )
    
    def embed_documents(self, documents: List[Dict], batch_size: int = 32) -> np.ndarray:
        """Embebe múltiples documentos (batch para indexación)."""
        texts = [self.prepare_text(doc) for doc in documents]
        return self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=True,
            convert_to_numpy=True,
            # IMPORTANTE!
            # a cada vector se le saca la normal (modulo = 1 -> longitud = 1)
            # entonces -> El producto punto se convierte en similitud coseno
            # |-> Valor 1 -> idénticos, 
            # |-> Valor 0 -> ortogonales, no relacionados
            # |-> Valor -1 -> opuestos

            normalize_embeddings=True
        )