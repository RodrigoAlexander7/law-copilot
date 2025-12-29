"""
Parser específico para la Ley N° 30364 - Ley para prevenir, sancionar y erradicar 
la violencia contra las mujeres y los integrantes del grupo familiar.
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


class ViolenceLawParser(BaseLegalParser):
    """
    Parser para la Ley 30364 - Violencia contra la Mujer.
    
    Estructura típica de una Ley:
    - TÍTULO I: Disposiciones Generales
        - CAPÍTULO I: ...
            - Artículo 1.- Objeto de la Ley
            - Artículo 2.- ...
    - TÍTULO II: ...
    - DISPOSICIONES COMPLEMENTARIAS
    """
    
    # Patrones regex
    TITULO_PATTERN = re.compile(
        r'TÍTULO\s+([IVXLCDM]+)\s*[:\.\-]?\s*(.+?)(?=\n|CAPÍTULO|Artículo)',
        re.IGNORECASE | re.DOTALL
    )
    
    CAPITULO_PATTERN = re.compile(
        r'CAPÍTULO\s+([IVXLCDM]+)\s*[:\.\-]?\s*(.+?)(?=\n|Artículo|CAPÍTULO|SUBCAPÍTULO)',
        re.IGNORECASE | re.DOTALL
    )
    
    SUBCAPITULO_PATTERN = re.compile(
        r'SUBCAPÍTULO\s+([IVXLCDM]+)\s*[:\.\-]?\s*(.+?)(?=\n|Artículo)',
        re.IGNORECASE | re.DOTALL
    )
    
    # Patrón para artículos
    ARTICULO_PATTERN = re.compile(
        r'Artículo\s+(\d+)[°º]?\s*[:\.\-]?\s*(.+?)(?=Artículo\s+\d+|TÍTULO\s+[IVXLCDM]+|CAPÍTULO\s+[IVXLCDM]+|DISPOSICION|$)',
        re.IGNORECASE | re.DOTALL
    )
    
    # Patrón para disposiciones complementarias
    DISPOSICION_PATTERN = re.compile(
        r'(PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|SÉPTIMA|OCTAVA|NOVENA|DÉCIMA)[:\.\-]?\s*(.+?)(?=PRIMERA|SEGUNDA|TERCERA|CUARTA|QUINTA|SEXTA|SÉPTIMA|OCTAVA|NOVENA|DÉCIMA|$)',
        re.IGNORECASE | re.DOTALL
    )
    
    # Fecha de promulgación (publicada el 23 de noviembre de 2015)
    DATE_PROMULGATED = date(2015, 11, 23)
    
    def __init__(self, pdf_path: Path):
        super().__init__(pdf_path)
    
    @property
    def source_id(self) -> str:
        return "ley_30364_violencia_mujer"
    
    @property
    def source_type(self) -> SourceType:
        return SourceType.LEY
    
    def _generate_article_id(self, article_num: str) -> str:
        """Genera ID determinista para un artículo."""
        return f"LEY30364_ART_{article_num}"
    
    def _generate_disposicion_id(self, tipo: str, ordinal: str) -> str:
        """Genera ID para disposiciones complementarias."""
        ordinal_map = {
            "PRIMERA": "1", "SEGUNDA": "2", "TERCERA": "3", "CUARTA": "4",
            "QUINTA": "5", "SEXTA": "6", "SÉPTIMA": "7", "OCTAVA": "8",
            "NOVENA": "9", "DÉCIMA": "10"
        }
        num = ordinal_map.get(ordinal.upper(), ordinal)
        return f"LEY30364_DISP_{tipo}_{num}"
    
    def _clean_article_text(self, text: str) -> str:
        """Limpieza específica para texto de artículos."""
        text = TextCleaner.normalize_whitespace(text)
        text = re.sub(r'\n(?![a-z\d]\.|\-|\d+\.)', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    def _extract_tags(self, text: str) -> List[str]:
        """Extrae keywords relevantes del texto del artículo."""
        keywords = [
            "violencia", "mujer", "familia", "víctima", "agresor",
            "protección", "medidas de protección", "denuncia", "fiscalía",
            "policía", "juzgado de familia", "proceso especial", "tutela",
            "violencia física", "violencia psicológica", "violencia sexual",
            "violencia económica", "feminicidio", "hostigamiento", "acoso",
            "grupo familiar", "niño", "niña", "adolescente", "adulto mayor",
            "persona con discapacidad", "reparación", "indemnización",
            "ficha de valoración de riesgo", "casa de refugio"
        ]
        
        text_lower = text.lower()
        found_tags = [kw for kw in keywords if kw in text_lower]
        return found_tags[:5]
    
    def _find_hierarchy_at_position(self, text: str, position: int) -> Tuple[Optional[str], Optional[str]]:
        """
        Encuentra el Título y Capítulo vigente para una posición.
        """
        current_titulo = None
        current_capitulo = None
        current_subcapitulo = None
        
        # Buscar títulos
        for match in self.TITULO_PATTERN.finditer(text):
            if match.start() < position:
                numero = match.group(1).strip()
                nombre = match.group(2).strip()
                nombre = re.sub(r'\s+', ' ', nombre)
                current_titulo = f"Título {numero}: {nombre}"
                current_capitulo = None
                current_subcapitulo = None
            else:
                break
        
        # Buscar capítulos
        for match in self.CAPITULO_PATTERN.finditer(text):
            if match.start() < position:
                numero = match.group(1).strip()
                nombre = match.group(2).strip()
                nombre = re.sub(r'\s+', ' ', nombre)
                current_capitulo = f"Capítulo {numero}: {nombre}"
                current_subcapitulo = None
            else:
                break
        
        # Buscar subcapítulos
        for match in self.SUBCAPITULO_PATTERN.finditer(text):
            if match.start() < position:
                numero = match.group(1).strip()
                nombre = match.group(2).strip()
                nombre = re.sub(r'\s+', ' ', nombre)
                current_subcapitulo = f"Subcapítulo {numero}: {nombre}"
            else:
                break
        
        level_1 = current_titulo
        
        level_2_parts = []
        if current_capitulo:
            level_2_parts.append(current_capitulo)
        if current_subcapitulo:
            level_2_parts.append(current_subcapitulo)
        
        level_2 = " > ".join(level_2_parts) if level_2_parts else None
        
        return level_1, level_2
    
    def parse(self) -> List[LegalArticle]:
        """
        Parsea la Ley 30364 y extrae todos los artículos.
        """
        if not self.raw_text:
            self.extract_text()
        
        articles = []
        seen_ids = set()
        
        # Extraer artículos regulares
        for match in self.ARTICULO_PATTERN.finditer(self.raw_text):
            article_num = match.group(1)
            article_id = self._generate_article_id(article_num)
            
            if article_id in seen_ids:
                continue
            seen_ids.add(article_id)
            
            article_text = self._clean_article_text(match.group(2))
            
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
        
        # Extraer disposiciones complementarias finales
        disp_final = re.search(
            r'DISPOSICIONES?\s+COMPLEMENTARIAS?\s+FINALES?(.+?)(?=DISPOSICIONES?\s+COMPLEMENTARIAS?\s+TRANSITORIAS?|DISPOSICIONES?\s+COMPLEMENTARIAS?\s+MODIFICATORIAS?|$)',
            self.raw_text,
            re.IGNORECASE | re.DOTALL
        )
        
        if disp_final:
            for match in self.DISPOSICION_PATTERN.finditer(disp_final.group(1)):
                ordinal = match.group(1)
                content = self._clean_article_text(match.group(2))
                disp_id = self._generate_disposicion_id("FINAL", ordinal)
                
                if disp_id in seen_ids:
                    continue
                seen_ids.add(disp_id)
                
                article = LegalArticle(
                    id=disp_id,
                    source_id=self.source_id,
                    source_type=self.source_type,
                    payload=Payload(
                        label=f"Disposición Complementaria Final {ordinal.title()}",
                        text_content=content
                    ),
                    hierarchy=Hierarchy(
                        level_1="Disposiciones Complementarias Finales",
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
        
        # Extraer disposiciones complementarias transitorias
        disp_trans = re.search(
            r'DISPOSICIONES?\s+COMPLEMENTARIAS?\s+TRANSITORIAS?(.+?)(?=DISPOSICIONES?\s+COMPLEMENTARIAS?\s+MODIFICATORIAS?|$)',
            self.raw_text,
            re.IGNORECASE | re.DOTALL
        )
        
        if disp_trans:
            for match in self.DISPOSICION_PATTERN.finditer(disp_trans.group(1)):
                ordinal = match.group(1)
                content = self._clean_article_text(match.group(2))
                disp_id = self._generate_disposicion_id("TRANS", ordinal)
                
                if disp_id in seen_ids:
                    continue
                seen_ids.add(disp_id)
                
                article = LegalArticle(
                    id=disp_id,
                    source_id=self.source_id,
                    source_type=self.source_type,
                    payload=Payload(
                        label=f"Disposición Complementaria Transitoria {ordinal.title()}",
                        text_content=content
                    ),
                    hierarchy=Hierarchy(
                        level_1="Disposiciones Complementarias Transitorias",
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


def parse_violence_law(pdf_path: Path) -> ViolenceLawParser:
    """
    Función de conveniencia para parsear la Ley 30364.
    
    Args:
        pdf_path: Ruta al archivo PDF de la Ley
        
    Returns:
        Parser con artículos extraídos
    """
    parser = ViolenceLawParser(pdf_path)
    parser.extract_text()
    parser.parse()
    return parser
