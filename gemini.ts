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
  tier: SubscriptionTier
) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // MODEL CONFIGURATION
  // আমরা স্ট্যান্ডার্ড এবং স্টেবল মডেল ব্যবহার করছি। 
  // ফ্রি টায়ারে এটি সেরা পারফরম্যান্স দেয়।
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    // PRO এবং BUSINESS ইউজারদের জন্য সার্চ টুল অন করা হবে
    tools: (tier === 'pro' || tier === 'business' || tier === 'basic') ? [
      { googleSearch: {} } 
    ] : [],
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
  tier: SubscriptionTier, // নতুন: সাবস্ক্রিপশন টায়ার চেক করার জন্য
  image?: string
): Promise<CortexaResponse> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("API Key missing");
    return { text: "⚠️ SYSTEM ERROR: API Key missing in Netlify." };
  }

  // কনফিগারেশন কি চেক (রোল বা টায়ার বদলালে নতুন সেশন হবে)
  const configKey = `${location}-${role}-${tier}`;
  
  if (!chatSession || currentConfigKey !== configKey) {
    chatSession = await createSession(apiKey, location, role, tier);
    currentConfigKey = configKey;
  }

  let msgPart: any = [{ text: message }];

  // ইমেজ প্রসেসিং (যদি থাকে)
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
    
    // গ্রাউন্ডিং মেটাডাটা (সার্চ রেজাল্ট) আছে কি না চেক করা
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return {
      text: response.text() || "No response.",
      groundingMetadata: groundingMetadata
    };

  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    // যদি সার্চ টুল ফেইল করে, তবে সাধারণ মোডে রিট্রাই করার অপশন রাখা যেতে পারে
    return { text: `⚠️ Error: ${error.message || "Connection disrupted. Please try again."}` };
  }
};
