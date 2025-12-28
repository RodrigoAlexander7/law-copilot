"""
Script para procesar documentos legales y generar JSONs estructurados.
Ejecutar desde la raíz del proyecto backend:
    python -m src.ingestion.process_documents
"""

import json
import sys
from pathlib import Path
from datetime import date

# Agregar el directorio padre al path para imports
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from src.core.config import settings
from src.ingestion.constitution_parser import parse_constitution
from src.ingestion.models import LegalArticle


class DateEncoder(json.JSONEncoder):
    """Encoder JSON personalizado para manejar fechas."""
    def default(self, obj):
        if isinstance(obj, date):
            return obj.isoformat()
        return super().default(obj)


def save_articles_to_json(articles: list[LegalArticle], output_path: Path) -> None:
    """
    Guarda los artículos en un archivo JSON.
    
    Args:
        articles: Lista de artículos a guardar
        output_path: Ruta del archivo de salida
    """
    # Convertir a diccionarios
    articles_data = [article.model_dump() for article in articles]
    
    # Asegurar que el directorio existe
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Guardar JSON con formato legible
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(articles_data, f, ensure_ascii=False, indent=2, cls=DateEncoder)
    
    print(f"✅ Guardados {len(articles)} artículos en {output_path}")





def process_constitution():
    """Procesa la Constitución Política del Perú."""
    print("\n" + "="*60)
    print("📜 Procesando: Constitución Política del Perú 1993")
    print("="*60)
    
    pdf_path = settings.RAW_DIR / "constitucion.pdf"
    
    if not pdf_path.exists():
        print(f"❌ Error: No se encontró el archivo {pdf_path}")
        return None
    
    # Parsear el documento
    print(f"📖 Leyendo PDF: {pdf_path}")
    parser = parse_constitution(pdf_path)
    
    print(f"📊 Artículos encontrados: {len(parser.articles)}")
    
    # Mostrar resumen por título
    titulos = {}
    for article in parser.articles:
        titulo = article.hierarchy.level_1 or "Sin Título"
        titulos[titulo] = titulos.get(titulo, 0) + 1
    
    print("\n📋 Distribución por Título:")
    for titulo, count in titulos.items():
        print(f"   - {titulo}: {count} artículos")
    
    # Guardar archivo consolidado (un JSON por documento legal)
    output_file = settings.PROCESSED_DIR / "constitucion_1993.json"
    save_articles_to_json(parser.articles, output_file)
    
    return parser


def main():
    """Función principal de procesamiento."""
    print("\n🚀 Iniciando procesamiento de documentos legales")
    print(f"📁 Directorio RAW: {settings.RAW_DIR}")
    print(f"📁 Directorio PROCESSED: {settings.PROCESSED_DIR}")
    
    # Procesar Constitución
    constitution_parser = process_constitution()
    
    if constitution_parser and constitution_parser.articles:
        # Mostrar ejemplo de artículo procesado
        print("\n" + "="*60)
        print("📝 Ejemplo de artículo procesado:")
        print("="*60)
        
        # Buscar el Artículo 2 (Derechos Fundamentales)
        art_2 = constitution_parser.get_article_by_number(2)
        if art_2:
            print(json.dumps(art_2.model_dump(), ensure_ascii=False, indent=2, cls=DateEncoder))
    
    print("\n✅ Procesamiento completado!")
    print(f"📂 Archivos generados en: {settings.PROCESSED_DIR}")


if __name__ == "__main__":
    main()
