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
  useLiteModel: boolean
) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // --- DUAL MODEL STRATEGY ---
  // ১. Lite: শুধু ছোট টেক্সট চ্যাটের জন্য (খরচ কম)
  // ২. Standard (Flash): ছবি, ভিডিও, পিডিএফ বা জটিল সার্চের জন্য
  const modelName = useLiteModel ? "gemini-2.5-flash-lite" : "gemini-2.5-flash";

  console.log(`Using Model: ${modelName} | Tier: ${tier} | Lite Mode: ${useLiteModel}`);

  // SEARCH TOOL CONFIGURATION
  // Lite মডেলে সার্চ টুল কাজ করে না, তাই বন্ধ রাখা হচ্ছে
  // ফ্রি ইউজারদের জন্যও সার্চ বন্ধ
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
        parts: [{ text: "System Online. CORTEXA is ready to assist." }],
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2000, // ভিডিও বা পিডিএফ এনালাইসিসের জন্য টোকেন বাড়ানো হলো
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
  attachment?: Attachment // Updated: Supports Image, Video, Doc
): Promise<CortexaResponse> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return { text: "⚠️ SYSTEM ERROR: API Key missing in Netlify." };
  }

  // --- INTELLIGENT MODEL SELECTION ---
  // Lite মডেল কখন ব্যবহার হবে?
  // ১. মেসেজ ছোট (< ২০০ শব্দ)
  // ২. কোনো অ্যাটাচমেন্ট (ছবি/ভিডিও/ফাইল) নেই
  // ৩. জটিল কিওয়ার্ড নেই
  const isSimpleText = message.length < 200;
  const hasAttachment = !!attachment;
  const hasComplexKeywords = /link|price|download|schematic|driver|buy|latest/i.test(message);
  
  // যদি ফাইল থাকে, অবশ্যই স্ট্যান্ডার্ড মডেল ডাকতে হবে
  const useLiteModel = isSimpleText && !hasAttachment && !hasComplexKeywords;

  // কনফিগারেশন কি আপডেট
  const configKey = `${location}-${role}-${tier}-${useLiteModel ? 'lite' : 'standard'}`;
  
  if (!chatSession || currentConfigKey !== configKey) {
    chatSession = await createSession(apiKey, location, role, tier, useLiteModel);
    currentConfigKey = configKey;
  }

  // মেসেজ পার্ট তৈরি
  let msgPart: any = [{ text: message }];

  // --- MULTIMODAL HANDLING (Image, Video, PDF) ---
  if (attachment) {
    // Base64 স্ট্রিং থেকে শুধু ডাটা অংশটুকু বের করা (prefix 'data:image/png;base64,' বাদ দেওয়া)
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
    
    // Fallback error message
    return { text: `⚠️ Cortexa Error: ${error.message}` };
  }
};
