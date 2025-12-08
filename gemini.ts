import { GoogleGenAI, ChatSession, Part } from "@google/genai";
import { CORTEXA_SYSTEM_PROMPT } from './constants';
import { UserLocation, UserRole, GroundingMetadata } from './types';

let chatSession: ChatSession | null = null;
let currentConfigKey: string | null = null;

const createSession = (apiKey: string, location: UserLocation, role: UserRole) => {
  const ai = new GoogleGenAI({ apiKey });
  
  // Dynamic system prompt construction
  const dynamicContext = `
[CURRENT CONTEXT]
User_Location: "${location}"
User_Role: "${role}"
  `;

  return ai.chats.create({
    model: 'gemini-1.5-flash', 
    config: {
      systemInstruction: CORTEXA_SYSTEM_PROMPT + dynamicContext,
      temperature: 0.7, 
    },
  });
};

export interface CortexaResponse {
  text: string;
  groundingMetadata?: GroundingMetadata;
}

export const sendMessageToCortexa = async (
  message: string,
  activeFacultyName: string,
  location: UserLocation,
  role: UserRole,
  image?: string
): Promise<CortexaResponse> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API Key not found. Please set API_KEY in your environment variables.");
    return { text: "⚠️ SYSTEM ERROR: API Key missing. Please ensure the API_KEY environment variable is set." };
  }

  // Re-create session if context changes significantly
  const configKey = `${location}-${role}`;
  if (!chatSession || currentConfigKey !== configKey) {
    chatSession = createSession(apiKey, location, role);
    currentConfigKey = configKey;
  }

  const contextAwareMessage = `[ACTIVE FACULTY: ${activeFacultyName}]\n${message}`;

  let messageContent: string | Part[] = contextAwareMessage;

  if (image) {
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
      const mimeType = matches[1];
      const data = matches[2];
      messageContent = [
        { text: contextAwareMessage },
        { inlineData: { mimeType, data } }
      ];
    }
  }

  try {
    const result = await chatSession.sendMessage({ message: messageContent });
    return {
      text: result.text || "CORTEXA Offline. Please retry.",
      groundingMetadata: result.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "⚠️ SYSTEM ERROR: Connection to Cortexa Core disrupted. Check network or API quota." };
  }
};
