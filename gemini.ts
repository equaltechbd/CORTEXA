import { GoogleGenerativeAI } from "@google/generative-ai";
import { CORTEXA_SYSTEM_PROMPT } from './constants';
import { UserLocation, UserRole, GroundingMetadata, SubscriptionTier, Attachment } from './types';

let chatSession: any = null;
let currentConfigKey: string | null = null;

// সেশন তৈরি করার ফাংশন
const createSession = async (
  apiKey: string, 
  location: UserLocation, 
  role: UserRole, 
  tier: SubscriptionTier,
  useLiteModel: boolean,
  systemPromptOverride?: string // ✅ নতুন: টিচার মোড প্রম্পট
) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // MODEL SELECTION
  const modelName = useLiteModel ? "gemini-2.5-flash-lite" : "gemini-2.5-flash";
  console.log(`Using Model: ${modelName} | Mode: ${systemPromptOverride ? 'COURSE TEACHER' : 'ASSISTANT'}`);

  // SEARCH TOOL (Only for Pro/Business/Basic in Assistant Mode)
  // টিচার মোডে সার্চ বন্ধ রাখা ভালো, যাতে স্টুডেন্ট বিভ্রান্ত না হয়
  const tools = (!useLiteModel && !systemPromptOverride && (tier === 'pro' || tier === 'business' || tier === 'basic')) 
    ? [{ googleSearch: {} }] 
    : [];

  const model = genAI.getGenerativeModel({ 
    model: modelName,
    tools: tools,
  });
  
  // ✅ লজিক: যদি কোর্সের প্রম্পট থাকে, সেটা ব্যবহার করো। না হলে ডিফল্ট।
  const finalSystemInstruction = systemPromptOverride || CORTEXA_SYSTEM_PROMPT;

  const dynamicContext = `
[CURRENT CONTEXT]
User_Location: "${location}"
User_Role: "${role}"
Subscription_Tier: "${tier}"
SYSTEM_INSTRUCTION: ${finalSystemInstruction}
  `;

  return model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: "System Initialization: " + dynamicContext }],
      },
      {
        role: "model",
        parts: [{ text: "System Online. Ready." }],
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000,
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
  tier: SubscriptionTier, 
  attachment?: Attachment,
  courseSystemPrompt?: string // ✅ নতুন আর্গুমেন্ট রিসিভ করবে
): Promise<CortexaResponse> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return { text: "⚠️ SYSTEM ERROR: API Key missing in Netlify." };
  }

  // INTELLIGENT MODEL SELECTION
  const isSimpleText = message.length < 200;
  const hasAttachment = !!attachment;
  const hasComplexKeywords = /link|price|download|schematic|driver|buy|latest/i.test(message);
  
  // টিচার মোডে আমরা সবসময় স্ট্যান্ডার্ড মডেল ব্যবহার করব (ভালো বোঝানোর জন্য)
  const useLiteModel = !courseSystemPrompt && isSimpleText && !hasAttachment && !hasComplexKeywords;

  // কনফিগারেশন কি আপডেট (প্রম্পট পাল্টালে নতুন সেশন হবে)
  const configKey = `${location}-${role}-${tier}-${useLiteModel ? 'lite' : 'standard'}-${courseSystemPrompt ? 'course' : 'chat'}`;
  
  if (!chatSession || currentConfigKey !== configKey) {
    chatSession = await createSession(apiKey, location, role, tier, useLiteModel, courseSystemPrompt);
    currentConfigKey = configKey;
  }

  let msgPart: any = [{ text: message }];

  // MULTIMODAL HANDLING
  if (attachment) {
    const base64Data = attachment.data.split(',')[1]; 
    if (base64Data) {
        msgPart = [
            { text: message },
            {
                inlineData: {
                    mimeType: attachment.mimeType,
                    data: base64Data
                }
            }
        ];
    }
  }

  try {
    const result = await chatSession.sendMessage(msgPart);
    const response = await result.response;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return {
      text: response.text() || "No response.",
      groundingMetadata: groundingMetadata
    };

  } catch (error: any) {
    console.error("Gemini Error:", error);
    return { text: `⚠️ Cortexa Error: ${error.message}` };
  }
};
