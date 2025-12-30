import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import VoiceChat from "../components/VoiceChat";
import { saveConsultation } from "../components/ConsultationHistory";

export default function AdvisorChatScreen() {
  const params = useLocalSearchParams();

  // Parse advisor from params
  const advisor = params.advisor ? JSON.parse(params.advisor as string) : null;

  // Save consultation on first load (if not continuing)
  useEffect(() => {
    if (advisor && !params.continuing) {
      saveConsultation({
        advisorId: advisor.id,
        advisorName: advisor.name,
        advisorAvatar: advisor.avatar,
        topic: "New Consultation",
        category: advisor.specialties?.[0] || "General",
        status: "Active",
        startedAt: new Date(),
        lastMessage: "Consultation started",
        messageCount: 0,
        priority: "Medium",
      }).catch(console.error);
    }
  }, []);

  if (!advisor) {
    return null;
  }

  // Build system prompt for legal advisor
  const systemPrompt = buildAdvisorSystemPrompt(advisor);
  const initialGreeting = buildAdvisorGreeting(advisor);

  return (
    <VoiceChat
      educatorName={advisor.name}
      educatorAvatar={advisor.avatar}
      educatorId={`advisor-${advisor.id}`}
      systemPrompt={systemPrompt}
      initialGreeting={initialGreeting}
      moduleType="advisor"
    />
  );
}

function buildAdvisorSystemPrompt(advisor: any): string {
  const { name, avatar, title, specialties, description } = advisor;

  return `Eres ${name}, ${title}.

DESCRIPCIÓN:
${description}

ESPECIALIDADES:
${specialties.map((s: string) => `- ${s}`).join('\n')}

TU ROL COMO ASESOR LEGAL:
1. Proporcionar orientación legal clara y práctica
2. Explicar conceptos legales en términos comprensibles
3. Citar artículos relevantes de las leyes peruanas
4. Dar pasos concretos que el usuario puede seguir
5. Advertir sobre posibles riesgos o consecuencias legales
6. Recomendar consultar a un abogado humano para casos específicos
7. Mantener un tono profesional, empático y confiable

INSTRUCCIONES:
- Escucha atentamente la consulta del usuario
- Haz preguntas de aclaración si necesitas más contexto
- Proporciona respuestas estructuradas y bien fundamentadas
- Explica las opciones legales disponibles
- Se honesto sobre las limitaciones de tu asesoría
- Nunca garantices resultados específicos
- Recomienda documentos o trámites necesarios
- Mantén la confidencialidad y el respeto

IMPORTANTE:
- Tus respuestas deben ser concisas (2-4 párrafos)
- Usa lenguaje claro, no excesivamente técnico
- Prioriza información práctica y accionable
- Basa tus consejos en las leyes peruanas vigentes

Estás aquí para ayudar y orientar. ¡Adelante!`;
}

function buildAdvisorGreeting(advisor: any): string {
  const { name, avatar, title } = advisor;
  
  return `${avatar} Hola, soy ${name}, ${title}. Cuéntame tu consulta legal y te ayudaré con la mejor orientación posible.`;
}
