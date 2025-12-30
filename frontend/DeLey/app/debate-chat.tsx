import React from "react";
import { useLocalSearchParams } from "expo-router";
import VoiceChat from "../components/VoiceChat";

export default function DebateChatScreen() {
  const params = useLocalSearchParams();

  // Parse config from params
  const config = params.config ? JSON.parse(params.config as string) : null;

  if (!config) {
    return null;
  }

  // Build system prompt based on debate configuration
  const systemPrompt = buildDebateSystemPrompt(config);
  const initialGreeting = buildDebateGreeting(config);

  return (
    <VoiceChat
      educatorName={config.modelName}
      educatorAvatar={config.modelAvatar}
      educatorId={`debate-${config.modelName}`}
      systemPrompt={systemPrompt}
      initialGreeting={initialGreeting}
      moduleType="simulation"
    />
  );
}

function buildDebateSystemPrompt(config: any): string {
  const { 
    modelName, 
    topic, 
    position, 
    aggressiveness, 
    formality, 
    empathy, 
    humor,
    voiceTone,
    paceStyle,
    argumentStyle 
  } = config;

  // Map personality traits to behavior descriptions
  const aggressivenessDesc = aggressiveness > 70 ? "muy agresivo y confrontacional" :
                              aggressiveness > 40 ? "moderadamente asertivo" :
                              "gentil y respetuoso";
  
  const formalityDesc = formality > 70 ? "extremadamente formal y técnico" :
                        formality > 40 ? "profesional pero accesible" :
                        "casual e informal";
  
  const empathyDesc = empathy > 70 ? "muy emotivo y empático" :
                      empathy > 40 ? "equilibrado entre lógica y emoción" :
                      "puramente lógico y objetivo";
  
  const humorDesc = humor > 50 ? "con toques de humor e ironía" :
                    humor > 20 ? "ocasionalmente ingenioso" :
                    "completamente serio";

  return `Eres ${modelName}, un oponente de debate legal especializado.

CONFIGURACIÓN DEL DEBATE:
- Tema: ${topic}
- Tu posición: ${position}
- Estilo de argumento: ${argumentStyle}
- Tono de voz: ${voiceTone}
- Ritmo: ${paceStyle}

PERSONALIDAD (ajustada por el usuario):
- Agresividad: ${aggressiveness}/100 - Eres ${aggressivenessDesc}
- Formalidad: ${formality}/100 - Tu lenguaje es ${formalityDesc}
- Empatía: ${empathy}/100 - Tu enfoque es ${empathyDesc}
- Humor: ${humor}/100 - Tu estilo es ${humorDesc}

INSTRUCCIONES:
1. Mantén tu posición "${position}" sobre "${topic}" durante todo el debate
2. Usa argumentos legales sólidos basados en leyes peruanas
3. Responde a los puntos del usuario de forma directa y estructurada
4. Cita artículos y jurisprudencia cuando sea relevante
5. Ajusta tu tono según las configuraciones de personalidad
6. Si el estilo es "${argumentStyle}", enfócate en esa aproximación
7. Mantén respuestas concisas (2-3 párrafos máximo)
8. Desafía los argumentos débiles del usuario
9. Admite puntos válidos pero mantén tu posición

Eres un oponente formidable pero justo. ¡Que comience el debate!`;
}

function buildDebateGreeting(config: any): string {
  const { modelName, modelAvatar, topic, position } = config;
  
  return `${modelAvatar} Soy ${modelName}. Vamos a debatir sobre "${topic}". Mi posición es ${position}. Presenta tu primer argumento.`;
}
