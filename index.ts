
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Limits for Free Tier
const FREE_LIMITS = {
  IMAGES: 2,
  MESSAGES: 20,
};

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Parse Input & Environment
    const { user_id, message, image_base64, is_pro_user } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Server Configuration (API Keys)");
    }

    // Initialize Supabase Admin Client (Bypass RLS for checking/updating usage)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const isImageRequest = !!image_base64;

    // 3. USAGE TRACKING LOGIC (Skip for Pro Users)
    if (!is_pro_user) {
      // A. Fetch current usage
      const { data: usage, error: usageError } = await supabaseAdmin
        .from("user_usage")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", today)
        .single();

      // Handle "no row found" (first interaction of the day)
      const currentUsage = usage || { image_count: 0, message_count: 0 };

      // B. Check Limits
      if (isImageRequest) {
        if (currentUsage.image_count >= FREE_LIMITS.IMAGES) {
          return new Response(
            JSON.stringify({ error: "Daily_Limit_Reached", type: "IMAGE_LIMIT" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
          );
        }
      } else {
        if (currentUsage.message_count >= FREE_LIMITS.MESSAGES) {
          return new Response(
            JSON.stringify({ error: "Daily_Limit_Reached", type: "MESSAGE_LIMIT" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
          );
        }
      }
    }

    // 4. INCREMENT USAGE (Atomic Upsert)
    // We do this BEFORE the AI call to prevent abuse, or you can do it AFTER. 
    // Doing it before ensures 'credits' are reserved.
    if (!is_pro_user) {
      const { data: currentUsage } = await supabaseAdmin
        .from("user_usage")
        .select("*")
        .eq("user_id", user_id)
        .eq("date", today)
        .single();
        
      const safeUsage = currentUsage || { image_count: 0, message_count: 0 };
      
      const { error: upsertError } = await supabaseAdmin.from("user_usage").upsert(
        {
          user_id,
          date: today,
          image_count: isImageRequest ? safeUsage.image_count + 1 : safeUsage.image_count,
          message_count: isImageRequest ? safeUsage.message_count : safeUsage.message_count + 1,
        },
        { onConflict: "user_id,date" }
      );

      if (upsertError) console.error("Usage Update Error:", upsertError);
    }

    // 5. CALL GEMINI API
    // Construct Payload
    const parts: any[] = [{ text: message }];
    
    if (image_base64) {
      // Remove header if present (e.g., "data:image/png;base64,")
      const cleanBase64 = image_base64.split(',')[1] || image_base64;
      parts.push({
        inlineData: {
          mimeType: "image/jpeg", // Gemini is flexible, but defining jpeg/png is standard
          data: cleanBase64
        }
      });
    }

    const modelName = "gemini-2.5-flash"; // As requested
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000
        }
      }),
    });

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API Error: ${geminiData.error?.message || "Unknown Error"}`);
    }

    // Extract text
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

    // 6. Return Result
    return new Response(
      JSON.stringify({ text: aiText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
