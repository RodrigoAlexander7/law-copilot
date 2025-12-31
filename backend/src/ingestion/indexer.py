import os
import json
import pickle
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional
from tqdm import tqdm  # Para barra de progreso
from pathlib import Path

from src.infrastructure.embedder import LegalEmbedder
# Import relativo para cuando se ejecuta como módulo
try:
    from src.core.config import settings
except ImportError:
    from core.config import settings

class LegalIndexer:
    def __init__(self, 
                 input_dir: str, 
                 output_dir: str, 
                 model_name: str = settings.EMBEDDING_MODEL):
        
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.model_name = model_name
        self.embedder = LegalEmbedder()
        
        print(f"Cargando modelo de embeddings: {model_name}...")
        self.model = SentenceTransformer(model_name, device='cpu')
        
        # Dimensiones del modelo (mpnet-base suele ser 768)
        self.embedding_dim = self.model.get_sentence_embedding_dimension()

    def load_processed_files(self) -> List[Dict]:
        """Carga todos los JSONs de la carpeta processed."""
        all_documents = []
        files = [f for f in os.listdir(self.input_dir) if f.endswith('.json')]
        
        print(f"📂 Encontrados {len(files)} archivos JSON.")
        
        for file in files:
            path = os.path.join(self.input_dir, file)
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # data es una lista de artículos
                if isinstance(data, list):
                    all_documents.extend(data)
                else:
                    print(f"⚠️ Formato inesperado en {file}, se esperaba una lista.")
        
        print(f"✅ Total de artículos cargados: {len(all_documents)}")
        return all_documents


    def build_faiss_index(self, embeddings: np.ndarray) -> faiss.Index:
        """
        Construye el índice FAISS para búsqueda por similitud.
        
        Usamos IndexFlatIP (Inner Product) porque los embeddings están normalizados,
        lo que hace que el producto punto sea equivalente a similitud coseno.
        
        Para datasets muy grandes (>1M), considera usar IndexIVFFlat o IndexHNSW.
        """
        print(f"Building FAISS index...")
        
        # Asegurar que los embeddings son float32 (requerido por FAISS)
        embeddings = embeddings.astype(np.float32)
        
        # IndexFlatIP: Búsqueda exacta por producto punto (cosine similarity con vectores normalizados)
        index = faiss.IndexFlatIP(self.embedding_dim)
        
        # Agregar los vectores al índice
        index.add(embeddings)
        
        print(f" FAISS index created with {index.ntotal} vectors")
        return index

    def save_index(self, 
                   index: faiss.Index, 
                   documents: List[Dict], 
                   index_name: str = "legal_index") -> None:
        """
        Guarda el índice FAISS y los metadatos de documentos.
        
        Archivos generados:
        - {index_name}.faiss: El índice vectorial
        - {index_name}_metadata.pkl: Los documentos originales (para recuperar al buscar)
        """
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Guardar índice FAISS
        faiss_path = os.path.join(self.output_dir, f"{index_name}.faiss")
        faiss.write_index(index, faiss_path)
        print(f"Índice guardado en: {faiss_path}")
        
        # Guardar metadatos (documentos originales)
        # Esto permite recuperar el artículo completo cuando encontramos un match
        metadata_path = os.path.join(self.output_dir, f"{index_name}_metadata.pkl")
        with open(metadata_path, 'wb') as f:
            pickle.dump(documents, f)
        print(f"Metadatos guardados en: {metadata_path}")
        
        # Guardar también un JSON con estadísticas del índice
        stats = {
            "total_documents": len(documents),
            "embedding_dim": self.embedding_dim,
            "model_name": self.model_name,
            "sources": list(set(doc.get('source_id', 'unknown') for doc in documents)),
            "index_type": "IndexFlatIP"
        }
        stats_path = os.path.join(self.output_dir, f"{index_name}_stats.json")
        with open(stats_path, 'w', encoding='utf-8') as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
        print(f"Estadísticas guardadas en: {stats_path}")

    def run(self, index_name: str = "legal_index") -> None:
        """
        Ejecuta el pipeline completo de indexación:
        1. Cargar documentos procesados
        2. Generar embeddings
        3. Construir índice FAISS
        4. Guardar índice y metadatos
        """
        print("\n" + "="*60)
        print("Initializing legal documentation")
        print("="*60)
        
        # 1. Cargar documentos
        documents = self.load_processed_files()
        
        if not documents:
            print("❌ No se encontraron documentos para indexar.")
            return
        
        # 2. Generar embeddings
        embeddings = self.embedder.embed_documents(documents)
        
        # 3. Construir índice
        index = self.build_faiss_index(embeddings)
        
        # 4. Guardar
        self.save_index(index, documents, index_name)
        
        print("\n" + "="*60)
        print("✅ INDEXACIÓN COMPLETADA")
        print(f"📁 Archivos generados en: {self.output_dir}")
        print("="*60)


def main():
    """Función principal para ejecutar el indexador."""
    indexer = LegalIndexer(
        input_dir=str(settings.PROCESSED_DIR),
        output_dir=str(settings.INDEXES_DIR)
    )
    indexer.run()


if __name__ == "__main__":
    main()