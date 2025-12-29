"""
Parser específico para el Código Civil del Perú (Decreto Legislativo N° 295).
Extrae artículos manteniendo la jerarquía: Libro > Sección > Título > Capítulo > Artículo
"""

import re
from pathlib import Path
from typing import List, Optional, Tuple
from datetime import date

from src.ingestion.pdf_parser import BaseLegalParser, TextCleaner
from src.ingestion.models import (
    LegalArticle, 
    SourceType, 
    Payload, 
    Hierarchy, 
    Metadata
)


class CivilCodeParser(BaseLegalParser):
    """
    Parser para el Código Civil del Perú.
    
    Estructura del Código Civil:
    - TÍTULO PRELIMINAR
    - LIBRO I: Derecho de las Personas
        - SECCIÓN PRIMERA: Personas Naturales
            - TÍTULO I: Principio de la Persona
                - CAPÍTULO PRIMERO: ...
                    - Artículo 1.- ...
    - LIBRO II: Acto Jurídico
    - LIBRO III: Derecho de Familia
    - LIBRO IV: Derecho de Sucesiones
    - LIBRO V: Derechos Reales
    - LIBRO VI: Las Obligaciones
    - LIBRO VII: Fuentes de las Obligaciones
    - LIBRO VIII: Prescripción y Caducidad
    - LIBRO IX: Registros Públicos
    - LIBRO X: Derecho Internacional Privado
    - TÍTULO FINAL
    """
    
    # Patrones regex para identificar estructura
    LIBRO_PATTERN = re.compile(
        r'LIBRO\s+([IVXLCDM]+)\s*[:\.\-]?\s*(.+?)(?=\n|SECCIÓN|TÍTULO|Artículo)',
        re.IGNORECASE | re.DOTALL
    )
    
    SECCION_PATTERN = re.compile(
        r'SECCIÓN\s+(PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|SÉPTIMA|OCTAVA|NOVENA|DÉCIMA|\d+)\s*[:\.\-]?\s*(.+?)(?=\n|TÍTULO|Artículo)',
        re.IGNORECASE | re.DOTALL
    )
    
    TITULO_PATTERN = re.compile(
        r'TÍTULO\s+([IVXLCDM]+|PRELIMINAR|FINAL)\s*[:\.\-]?\s*(.+?)(?=\n|CAPÍTULO|Artículo)',
        re.IGNORECASE | re.DOTALL
    )
    
    CAPITULO_PATTERN = re.compile(
        r'CAPÍTULO\s+(PRIMERO|SEGUNDO|TERCERO|CUARTO|QUINTO|SEXTO|SÉPTIMO|OCTAVO|NOVENO|DÉCIMO|ÚNICO|[IVXLCDM]+)\s*[:\.\-]?\s*(.+?)(?=\n|Artículo|CAPÍTULO|SUBCAPÍTULO)',
        re.IGNORECASE | re.DOTALL
    )
    
    # Patrón para artículos
    ARTICULO_PATTERN = re.compile(
        r'Artículo\s+(\d+)[°º]?\s*[:\.\-]?\s*(.+?)(?=Artículo\s+\d+|LIBRO\s+[IVXLCDM]+|SECCIÓN|TÍTULO\s+[IVXLCDM]+|CAPÍTULO|$)',
        re.IGNORECASE | re.DOTALL
    )
    
    # Fecha de promulgación del Código Civil
    DATE_PROMULGATED = date(1984, 7, 24)
    
    def __init__(self, pdf_path: Path):
        super().__init__(pdf_path)
    
    @property
    def source_id(self) -> str:
        return "codigo_civil"
    
    @property
    def source_type(self) -> SourceType:
        return SourceType.CODIGO
    
    def _generate_article_id(self, article_num: str) -> str:
        """Genera ID determinista para un artículo."""
        return f"CC_ART_{article_num}"
    
    def _clean_article_text(self, text: str) -> str:
        """Limpieza específica para texto de artículos."""
        text = TextCleaner.normalize_whitespace(text)
        text = re.sub(r'\n(?![a-z\d]\.|\-|\d+\.)', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _extract_tags(self, text: str) -> List[str]:
        """Extrae keywords relevantes del texto del artículo."""
        keywords = [
            "persona natural", "persona jurídica", "capacidad", "nombre",
            "domicilio", "matrimonio", "divorcio", "filiación", "patria potestad",
            "tutela", "curatela", "alimentos", "herencia", "testamento",
            "sucesión", "legado", "propiedad", "posesión", "usufructo",
            "servidumbre", "hipoteca", "prenda", "obligación", "contrato",
            "compraventa", "arrendamiento", "mandato", "sociedad", "donación",
            "responsabilidad civil", "daño", "indemnización", "prescripción",
            "caducidad", "registro", "acto jurídico", "nulidad", "anulabilidad"
        ]
        
        text_lower = text.lower()
        found_tags = [kw for kw in keywords if kw in text_lower]
        return found_tags[:5]
    
    def _find_hierarchy_at_position(self, text: str, position: int) -> Tuple[Optional[str], Optional[str]]:
        """
        Encuentra el Libro/Sección y Título/Capítulo vigente para una posición.
        """
        current_libro = None
        current_seccion = None
        current_titulo = None
        current_capitulo = None
        
        # Buscar libros
        for match in self.LIBRO_PATTERN.finditer(text):
            if match.start() < position:
                numero = match.group(1).strip()
                nombre = match.group(2).strip()
                nombre = re.sub(r'\s+', ' ', nombre)
                current_libro = f"Libro {numero}: {nombre}"
                current_seccion = None
                current_titulo = None
                current_capitulo = None
            else:
                break
        
        # Buscar título preliminar
        titulo_prelim = re.search(r'TÍTULO\s+PRELIMINAR', text[:position], re.IGNORECASE)
        if titulo_prelim and not current_libro:
            current_libro = "Título Preliminar"
        
        # Buscar secciones
        for match in self.SECCION_PATTERN.finditer(text):
            if match.start() < position:
                numero = match.group(1).strip()
                nombre = match.group(2).strip()
                nombre = re.sub(r'\s+', ' ', nombre)
                current_seccion = f"Sección {numero}: {nombre}"
            else:
                break
        
        # Buscar títulos
        for match in self.TITULO_PATTERN.finditer(text):
            if match.start() < position:
                numero = match.group(1).strip()
                nombre = match.group(2).strip()
                nombre = re.sub(r'\s+', ' ', nombre)
                if numero.upper() not in ['PRELIMINAR', 'FINAL']:
                    current_titulo = f"Título {numero}: {nombre}"
            else:
                break
        
        # Buscar capítulos
        for match in self.CAPITULO_PATTERN.finditer(text):
            if match.start() < position:
                numero = match.group(1).strip()
                nombre = match.group(2).strip()
                nombre = re.sub(r'\s+', ' ', nombre)
                current_capitulo = f"Capítulo {numero}: {nombre}"
            else:
                break
        
        # Construir jerarquía level_1 y level_2
        level_1 = current_libro
        
        # level_2 combina sección + título o solo capítulo
        level_2_parts = []
        if current_seccion:
            level_2_parts.append(current_seccion)
        if current_titulo:
            level_2_parts.append(current_titulo)
        if current_capitulo:
            level_2_parts.append(current_capitulo)
        
        level_2 = " > ".join(level_2_parts) if level_2_parts else None
        
        return level_1, level_2
    
    def parse(self) -> List[LegalArticle]:
        """
        Parsea el Código Civil y extrae todos los artículos.
        """
        if not self.raw_text:
            self.extract_text()
        
        articles = []
        seen_ids = set()
        
        for match in self.ARTICULO_PATTERN.finditer(self.raw_text):
            article_num = match.group(1)
            article_id = self._generate_article_id(article_num)
            
            # Evitar duplicados
            if article_id in seen_ids:
                continue
            seen_ids.add(article_id)
            
            article_text = self._clean_article_text(match.group(2))
            
            # Encontrar jerarquía
            level_1, level_2 = self._find_hierarchy_at_position(
                self.raw_text, 
                match.start()
            )
            
            article = LegalArticle(
                id=article_id,
                source_id=self.source_id,
                source_type=self.source_type,
                payload=Payload(
                    label=f"Artículo {article_num}",
                    text_content=article_text
                ),
                hierarchy=Hierarchy(
                    level_1=level_1,
                    level_2=level_2,
                    level_3=None
                ),
                metadata=Metadata(
                    is_active=True,
                    date_promulgated=self.DATE_PROMULGATED,
                    tags=self._extract_tags(article_text)
                )
            )
            articles.append(article)
        
        self.articles = articles
        return articles
    
    def get_article_by_number(self, num: int) -> Optional[LegalArticle]:
        """Busca un artículo específico por su número."""
        target_id = self._generate_article_id(str(num))
        for article in self.articles:
            if article.id == target_id:
                return article
        return None
    
    def get_articles_by_libro(self, libro_num: str) -> List[LegalArticle]:
        """Retorna todos los artículos de un libro específico."""
        return [
            art for art in self.articles
            if art.hierarchy.level_1 and f"Libro {libro_num}" in art.hierarchy.level_1
        ]


def parse_civil_code(pdf_path: Path) -> CivilCodeParser:
    """
    Función de conveniencia para parsear el Código Civil.
    
    Args:
        pdf_path: Ruta al archivo PDF del Código Civil
        
    Returns:
        Parser con artículos extraídos
    """
    parser = CivilCodeParser(pdf_path)
    parser.extract_text()
    parser.parse()
    return parser
