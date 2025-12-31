const AUDIO_SERVICE_URL = "https://audio-service-nine.vercel.app";
const RAG_SERVICE_URL = "https://law-copilot-backend-537825049720.us-central1.run.app";

// Interfaces
interface RAGSource {
  id: string;
  source: string;
  label: string;
  text: string;
  hierarchy: {
    title: string;
    chapter: string;
    section: string;
  };
  similarity_score: number;
}

interface RAGResponse {
  answer: string;
  sources: RAGSource[];
  query: string;
  total_sources_found: number;
}

// Speech-to-Text: Transcribe audio to text
export async function transcribeAudio(audioBase64: string): Promise<string> {
  try {
    const response = await fetch(`${AUDIO_SERVICE_URL}/internal/stt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_base64: audioBase64,
      }),
    });

    if (!response.ok) {
      throw new Error(`STT failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Transcription (${data.service_used}):`, data.text);
    
    return data.text;
  } catch (error) {
    console.error("❌ STT Error:", error);
    throw error;
  }
}

// Query RAG Service: Get answer from legal documents
export async function queryRAG(
  query: string,
  topK: number = 5,
  scoreThreshold: number = 0.3
): Promise<RAGResponse> {
  try {
    const response = await fetch(`${RAG_SERVICE_URL}/api/v1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
        top_k: topK,
        score_threshold: scoreThreshold,
      }),
    });

    if (!response.ok) {
      throw new Error(`RAG query failed: ${response.status}`);
    }

    const data: RAGResponse = await response.json();
    console.log(`✅ RAG Response:`, data.answer);
    console.log(`📚 Sources found: ${data.total_sources_found}`);
    
    return data;
  } catch (error) {
    console.error("❌ RAG Query Error:", error);
    throw error;
  }
}

// Text-to-Speech: Convert text to audio
export async function textToSpeech(
  text: string,
  moduleType: "teaching" | "simulation" | "advisor" = "teaching"
): Promise<string> {
  try {
    const response = await fetch(`${AUDIO_SERVICE_URL}/internal/tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        module_type: moduleType,
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ TTS (${data.service_used}): Audio generated`);
    
    return data.audio_base64;
  } catch (error) {
    console.error("❌ TTS Error:", error);
    throw error;
  }
}
