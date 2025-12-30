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

  return `You are ${name}, ${title}.

DESCRIPTION:
${description}

SPECIALTIES:
${specialties.map((s: string) => `- ${s}`).join('\n')}

YOUR ROLE AS LEGAL ADVISOR:
1. Provide clear and practical legal guidance
2. Explain legal concepts in understandable terms
3. Cite relevant articles from applicable laws
4. Give concrete steps the user can follow
5. Warn about potential legal risks or consequences
6. Recommend consulting a human attorney for specific cases
7. Maintain a professional, empathetic, and trustworthy tone

INSTRUCTIONS:
- Listen carefully to the user's inquiry
- Ask clarifying questions if you need more context
- Provide structured and well-founded responses
- Explain available legal options
- Be honest about the limitations of your advice
- Never guarantee specific outcomes
- Recommend necessary documents or procedures
- Maintain confidentiality and respect

IMPORTANT:
- Your responses should be concise (2-4 paragraphs)
- Use clear language, not overly technical
- Prioritize practical and actionable information
- Base your advice on established legal frameworks

You are here to help and guide. Let's begin!`;
}

function buildAdvisorGreeting(advisor: any): string {
  const { name, avatar, title } = advisor;
  
  return `${avatar} Hello, I'm ${name}, ${title}. Tell me about your legal inquiry and I'll provide you with the best guidance possible.`;
}
