"""
Parser específico para la Constitución Política del Perú de 1993.
Extrae artículos manteniendo la jerarquía: Título > Capítulo > Artículo
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


class ConstitutionParser(BaseLegalParser):
    """
    Parser para la Constitución Política del Perú de 1993.
    
    Estructura de la Constitución:
    - PREÁMBULO
    - TÍTULO I: DE LA PERSONA Y DE LA SOCIEDAD
        - CAPÍTULO I: DERECHOS FUNDAMENTALES DE LA PERSONA
            - Artículo 1.- ...
            - Artículo 2.- ...
        - CAPÍTULO II: ...
    - TÍTULO II: DEL ESTADO Y LA NACIÓN
        ...
    - DISPOSICIONES FINALES Y TRANSITORIAS
    """
    
    # Patrones regex para identificar estructura
    TITULO_PATTERN = re.compile(
        r'TÍTULO\s+([IVXLCDM]+)\s*[:\.\-]?\s*(.+?)(?=\n|CAPÍTULO|Artículo)',
        re.IGNORECASE | re.DOTALL
    )
    
    CAPITULO_PATTERN = re.compile(
        r'CAPÍTULO\s+([IVXLCDM]+)\s*[:\.\-]?\s*(.+?)(?=\n|Artículo|CAPÍTULO)',
        re.IGNORECASE | re.DOTALL
    )
    
    # Patrón para artículos - captura número y contenido
    ARTICULO_PATTERN = re.compile(
        r'Artículo\s+(\d+)[°º]?\s*[:\.\-]?\s*(.+?)(?=Artículo\s+\d+|TÍTULO\s+[IVXLCDM]+|CAPÍTULO\s+[IVXLCDM]+|DISPOSICIONES?\s+FINALES?|$)',
        re.IGNORECASE | re.DOTALL
    )
    
    # Patrón para disposiciones finales y transitorias
    DISPOSICION_PATTERN = re.compile(
        r'(PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|SÉPTIMA|OCTAVA|NOVENA|DÉCIMA|UNDÉCIMA|DUODÉCIMA|DECIMOTERCERA|DECIMOCUARTA|DECIMOQUINTA|DECIMOSEXTA)[:\.\-]?\s*(.+?)(?=PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|SÉPTIMA|OCTAVA|NOVENA|DÉCIMA|UNDÉCIMA|DUODÉCIMA|DECIMOTERCERA|DECIMOCUARTA|DECIMOQUINTA|DECIMOSEXTA|$)',
        re.IGNORECASE | re.DOTALL
    )
    
    DATE_PROMULGATED = date(1993, 12, 29)
    
    def __init__(self, pdf_path: Path):
        super().__init__(pdf_path)
        self.current_titulo: Optional[str] = None
        self.current_capitulo: Optional[str] = None
    
    @property
    def source_id(self) -> str:
        return "constitucion_1993"
    
    @property
    def source_type(self) -> SourceType:
        return SourceType.CONSTITUCION
    
    def _generate_article_id(self, article_num: str) -> str:
        """Genera ID determinista para un artículo."""
        return f"CONST_1993_ART_{article_num}"
    
    def _generate_disposicion_id(self, ordinal: str) -> str:
        """Genera ID para disposiciones finales."""
        ordinal_map = {
            "PRIMERA": "1", "SEGUNDA": "2", "TERCERA": "3", "CUARTA": "4",
            "QUINTA": "5", "SEXTA": "6", "SÉPTIMA": "7", "OCTAVA": "8",
            "NOVENA": "9", "DÉCIMA": "10", "UNDÉCIMA": "11", "DUODÉCIMA": "12",
            "DECIMOTERCERA": "13", "DECIMOCUARTA": "14", "DECIMOQUINTA": "15",
            "DECIMOSEXTA": "16"
        }
        num = ordinal_map.get(ordinal.upper(), ordinal)
        return f"CONST_1993_DISP_{num}"
    
    def _clean_article_text(self, text: str) -> str:
        """Limpieza específica para texto de artículos."""
        text = TextCleaner.normalize_whitespace(text)
        # Remover saltos de línea internos innecesarios
        text = re.sub(r'\n(?![a-z\d]\.|\-|\d+\.)', ' ', text)
        # Limpiar espacios extra
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _extract_tags(self, text: str) -> List[str]:
        """Extrae keywords relevantes del texto del artículo."""
        # Keywords legales comunes
        keywords = [
            "derechos humanos", "libertad", "igualdad", "vida", "trabajo",
            "educación", "salud", "propiedad", "familia", "debido proceso",
            "medio ambiente", "seguridad", "ciudadanía", "nacionalidad",
            "elecciones", "poder ejecutivo", "poder legislativo", "poder judicial",
            "tribunal constitucional", "defensoría", "contraloría",
            "gobierno regional", "gobierno local", "municipalidad",
            "estado de emergencia", "fuerzas armadas", "policía nacional"
        ]
        
        text_lower = text.lower()
        found_tags = [kw for kw in keywords if kw in text_lower]
        return found_tags[:5]  # Máximo 5 tags
    
    def _find_hierarchy_at_position(self, text: str, position: int) -> Tuple[Optional[str], Optional[str]]:
        """
        Encuentra el Título y Capítulo vigente para una posición en el texto.
        """
        current_titulo = None
        current_capitulo = None
        
        # Buscar todos los títulos antes de la posición
        for match in self.TITULO_PATTERN.finditer(text):
            if match.start() < position:
                numero = match.group(1).strip()
                nombre = match.group(2).strip()
                nombre = re.sub(r'\s+', ' ', nombre)
                current_titulo = f"Título {numero}: {nombre}"
                current_capitulo = None  # Reset capítulo al cambiar de título
            else:
                break
        
        # Buscar todos los capítulos antes de la posición
        for match in self.CAPITULO_PATTERN.finditer(text):
            if match.start() < position:
                numero = match.group(1).strip()
                nombre = match.group(2).strip()
                nombre = re.sub(r'\s+', ' ', nombre)
                current_capitulo = f"Capítulo {numero}: {nombre}"
            else:
                break
        
        return current_titulo, current_capitulo
    
    def parse(self) -> List[LegalArticle]:
        """
        Parsea la Constitución y extrae todos los artículos.
        """
        if not self.raw_text:
            self.extract_text()
        
        articles = []
        
        # Extraer artículos regulares
        for match in self.ARTICULO_PATTERN.finditer(self.raw_text):
            article_num = match.group(1)
            article_text = self._clean_article_text(match.group(2))
            
            # Encontrar jerarquía para este artículo
            titulo, capitulo = self._find_hierarchy_at_position(
                self.raw_text, 
                match.start()
            )
            
            article = LegalArticle(
                id=self._generate_article_id(article_num),
                source_id=self.source_id,
                source_type=self.source_type,
                payload=Payload(
                    label=f"Artículo {article_num}",
                    text_content=article_text
                ),
                hierarchy=Hierarchy(
                    level_1=titulo,
                    level_2=capitulo,
                    level_3=None
                ),
                metadata=Metadata(
                    is_active=True,
                    date_promulgated=self.DATE_PROMULGATED,
                    tags=self._extract_tags(article_text)
                )
            )
            articles.append(article)
        
        # Extraer disposiciones finales y transitorias
        # Primero encontrar dónde empiezan
        disp_section = re.search(
            r'DISPOSICIONES?\s+FINALES?\s+Y\s+TRANSITORIAS?(.+)',
            self.raw_text,
            re.IGNORECASE | re.DOTALL
        )
        
        if disp_section:
            disp_text = disp_section.group(1)
            for match in self.DISPOSICION_PATTERN.finditer(disp_text):
                ordinal = match.group(1)
                content = self._clean_article_text(match.group(2))
                
                article = LegalArticle(
                    id=self._generate_disposicion_id(ordinal),
                    source_id=self.source_id,
                    source_type=self.source_type,
                    payload=Payload(
                        label=f"Disposición {ordinal.title()}",
                        text_content=content
                    ),
                    hierarchy=Hierarchy(
                        level_1="Disposiciones Finales y Transitorias",
                        level_2=None,
                        level_3=None
                    ),
                    metadata=Metadata(
                        is_active=True,
                        date_promulgated=self.DATE_PROMULGATED,
                        tags=self._extract_tags(content)
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
    
    def get_articles_by_titulo(self, titulo_num: str) -> List[LegalArticle]:
        """Retorna todos los artículos de un título específico."""
        return [
            art for art in self.articles
            if art.hierarchy.level_1 and f"Título {titulo_num}" in art.hierarchy.level_1
        ]


def parse_constitution(pdf_path: Path) -> ConstitutionParser:
    """
    Función de conveniencia para parsear la Constitución.
    
    Args:
        pdf_path: Ruta al archivo PDF de la Constitución
        
    Returns:
        Parser con artículos extraídos
    """
    parser = ConstitutionParser(pdf_path)
    parser.extract_text()
    parser.parse()
    return parser
