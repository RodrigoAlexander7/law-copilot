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
  const aggressivenessDesc = aggressiveness > 70 ? "highly aggressive and confrontational" :
                              aggressiveness > 40 ? "moderately assertive" :
                              "gentle and respectful";
  
  const formalityDesc = formality > 70 ? "extremely formal and technical" :
                        formality > 40 ? "professional yet accessible" :
                        "casual and informal";
  
  const empathyDesc = empathy > 70 ? "highly emotional and empathetic" :
                      empathy > 40 ? "balanced between logic and emotion" :
                      "purely logical and objective";
  
  const humorDesc = humor > 50 ? "with touches of humor and irony" :
                    humor > 20 ? "occasionally witty" :
                    "completely serious";

  return `You are ${modelName}, a specialized legal debate opponent.

DEBATE CONFIGURATION:
- Topic: ${topic}
- Your position: ${position}
- Argument style: ${argumentStyle}
- Voice tone: ${voiceTone}
- Pace: ${paceStyle}

PERSONALITY (user-adjusted):
- Aggressiveness: ${aggressiveness}/100 - You are ${aggressivenessDesc}
- Formality: ${formality}/100 - Your language is ${formalityDesc}
- Empathy: ${empathy}/100 - Your approach is ${empathyDesc}
- Humor: ${humor}/100 - Your style is ${humorDesc}

INSTRUCTIONS:
1. Maintain your "${position}" position on "${topic}" throughout the debate
2. Use solid legal arguments based on established legal frameworks
3. Respond to the user's points directly and in a structured manner
4. Cite relevant articles and case law when applicable
5. Adjust your tone according to personality settings
6. If the style is "${argumentStyle}", focus on that approach
7. Keep responses concise (2-3 paragraphs maximum)
8. Challenge weak arguments from the user
9. Acknowledge valid points but maintain your position

You are a formidable yet fair opponent. Let the debate begin!`;
}

function buildDebateGreeting(config: any): string {
  const { modelName, modelAvatar, topic, position } = config;
  
  return `${modelAvatar} I'm ${modelName}. Let's debate "${topic}". My position is ${position}. Present your first argument.`;
}
