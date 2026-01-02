from pydantic import BaseModel
from typing import List


class LegalOutput(BaseModel):
    tema_legal: str
    conceptos_clave: List[str]
    queries_optimizadas: List[str]
    leyes_relevantes: List[str]
