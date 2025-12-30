const AUDIO_SERVICE_URL = "http://192.168.1.4:8001";

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

export async function processQuery(
  text: string, 
  moduleType: "teaching" | "simulation" | "advisor" = "teaching"
): Promise<{
  text_response: string;
  audio_base64: string;
  service_used: string;
  processing_time_ms: number;
}> {
  try {
    const response = await fetch(`${AUDIO_SERVICE_URL}/api/process-query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        module_type: moduleType,
        text: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Process query failed: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Response (${data.service_used}):`, data.text_response);
    console.log(`⏱️ Processing time: ${data.processing_time_ms}ms`);
    
    return data;
  } catch (error) {
    console.error("❌ Process Query Error:", error);
    throw error;
  }
}
