const AUDIO_SERVICE_URL = "http://192.168.1.4:8001";

export async function transcribeAudio(audioBase64) {
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
