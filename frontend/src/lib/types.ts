// Tipos del sistema legal RAG

export interface SourceHierarchy {
  title: string;
  chapter: string;
  section: string;
}

export interface Source {
  id: string;
  source: string;
  label: string;
  text: string;
  hierarchy: SourceHierarchy;
  similarity_score: number;
}

export interface QueryRewriteInfo {
  tema_legal: string | null;
  conceptos_clave: string[];
  queries_optimizadas: string[];
  leyes_relevantes: string[];
}

export interface QueryResponse {
  answer: string;
  sources: Source[];
  query: string;
  total_sources_found: number;
  rewrite_info: QueryRewriteInfo | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  rewriteInfo?: QueryRewriteInfo | null;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
