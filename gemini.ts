import { GoogleGenerativeAI } from "@google/generative-ai";
import { CORTEXA_SYSTEM_PROMPT } from './constants';
import { UserLocation, UserRole, GroundingMetadata, SubscriptionTier } from './types';

let chatSession: any = null;
let currentConfigKey: string | null = null;

// সেশন তৈরি করার ফাংশন
const createSession = async (
  apiKey: string, 
  location: UserLocation, 
  role: UserRole, 
  tier: SubscriptionTier,
  useLiteModel: boolean
) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // --- DUAL MODEL STRATEGY ---
  // ছোট কাজের জন্য: gemini-2.5-flash-lite (Super Fast & Cheap)
  // বড় কাজের জন্য: gemini-2.5-flash (Standard, Smart & Vision Capable)
  const modelName = useLiteModel ? "gemini-2.5-flash-lite" : "gemini-2.5-flash";

  console.log(`Using Model: ${modelName} | Tier: ${tier}`);

  // SEARCH TOOL CONFIGURATION
  // শুধুমাত্র Pro, Business এবং Basic ইউজারদের জন্য সার্চ টুল অন থাকবে
  // এবং অবশ্যই লাইট মডেলে সার্চ দেওয়া হবে না (রিসোর্স বাঁচাতে)
  const tools = (!useLiteModel && (tier === 'pro' || tier === 'business' || tier === 'basic')) 
    ? [{ googleSearch: {} }] 
    : [];

  const model = genAI.getGenerativeModel({ 
    model: modelName,
    tools: tools,
  });
  
  const dynamicContext = `
[CURRENT CONTEXT]
User_Location: "${location}"
User_Role: "${role}"
Subscription_Tier: "${tier}"
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
        parts: [{ text: "System Online. CORTEXA (Model: ${modelName}) is ready." }],
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
  tier: SubscriptionTier, 
  image?: string
): Promise<CortexaResponse> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return { text: "⚠️ SYSTEM ERROR: API Key missing in Netlify." };
  }

  // --- INTELLIGENT MODEL SELECTION ---
  // কখন Lite মডেল ডাকবো?
  // ১. যদি মেসেজ ছোট হয় (< ২০০ শব্দ)
  // ২. যদি কোনো ছবি না থাকে
  // ৩. যদি প্রশ্নের মধ্যে জটিল শব্দ (Link, Schematic, Price) না থাকে
  const isSimpleText = message.length < 200;
  const hasComplexKeywords = /link|price|download|schematic|driver|buy|latest/i.test(message);
  const useLiteModel = isSimpleText && !image && !hasComplexKeywords;

  // কনফিগারেশন কি আপডেট (মডেল পাল্টালে সেশন রিসেট হবে)
  const configKey = `${location}-${role}-${tier}-${useLiteModel ? 'lite' : 'standard'}`;
  
  if (!chatSession || currentConfigKey !== configKey) {
    chatSession = await createSession(apiKey, location, role, tier, useLiteModel);
    currentConfigKey = configKey;
  }

  let msgPart: any = [{ text: message }];

  // ইমেজ প্রসেসিং (অবশ্যই 2.5 Flash Standard মডেলে যাবে)
  if (image) {
    const matches = image.match(/^data:(.+);base64,(.+)$/);
    if (matches) {
        const base64Data = matches[2];
        const mimeType = matches[1];
        msgPart = [
            { text: message },
            { inlineData: { mimeType: mimeType, data: base64Data } }
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
    
    // FALLBACK: যদি 2.5 মডেলে কোনো কারণে সমস্যা হয়, এরর মেসেজ দেখাবে
    // (1.5 মডেল আর নেই, তাই ফলব্যাক করার সুযোগ নেই)
    return { text: `⚠️ Cortexa Error: ${error.message}` };
  }
};
