import { GoogleGenerativeAI } from "@google/generative-ai";
import { CORTEXA_SYSTEM_PROMPT } from './constants';
import { UserLocation, UserRole, GroundingMetadata } from './types';

let chatSession: any = null;
let currentConfigKey: string | null = null;

const createSession = async (apiKey: string, location: UserLocation, role: UserRole) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  // FIX: মডেলের নাম আপডেট করা হলো 'gemini-1.5-flash-latest'
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
  
  const dynamicContext = `
[CURRENT CONTEXT]
User_Location: "${location}"
User_Role: "${role}"
SYSTEM_INSTRUCTION: ${CORTEXA_SYSTEM_PROMPT}
  `;

  return model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "System Initialization: " + dynamicContext }],
      },
      {
        role: "model",
        parts: [{ text: "System Online. Ready to assist based on constraints." }],
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
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
    console.error("API Key missing");
    return { text: "⚠️ SYSTEM ERROR: API Key missing in Netlify." };
  }

  const configKey = `${location}-${role}`;
  if (!chatSession || currentConfigKey !== configKey) {
    chatSession = await createSession(apiKey, location, role);
    currentConfigKey = configKey;
  }

  let msgPart: any = [{ text: message }];

  if (image) {
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
        const base64Data = matches[2];
        const mimeType = matches[1];
        
        msgPart = [
            { text: message },
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            }
        ];
    }
  }

  try {
    const result = await chatSession.sendMessage(msgPart);
    const response = await result.response;
    return {
      text: response.text() || "No response.",
    };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { text: `⚠️ Error: ${error.message || "Connection disrupted"}` };
  }
};
