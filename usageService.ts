
import { supabase } from './supabaseClient';

const FREE_LIMITS = {
  IMAGES: 2,
  MESSAGES: 20
};

export const checkDailyLimits = async (userId: string, isImageUpload: boolean): Promise<boolean> => {
  const today = new Date().toISOString().split('T')[0];
  
  // 1. Fetch current usage from Supabase
  const { data, error } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = JSON object requested, multiple (or no) rows returned. No rows is fine.
    console.error('Error fetching usage:', error);
    // On error, we default to allowing access to avoid blocking users due to glitches
    return true; 
  }

  const usage = data || { image_count: 0, message_count: 0 };

  if (isImageUpload) {
    if (usage.image_count >= FREE_LIMITS.IMAGES) {
      throw new Error("Daily_Limit_Reached");
    }
  } else {
    if (usage.message_count >= FREE_LIMITS.MESSAGES) {
      throw new Error("Daily_Limit_Reached");
    }
  }

  return true;
};

export const incrementUsage = async (userId: string, isImageUpload: boolean): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Get current usage first (to handle the upsert logic correctly)
  const { data: currentData } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  const currentUsage = currentData || { image_count: 0, message_count: 0 };
  
  // 2. Calculate new values
  const updates = {
    user_id: userId,
    date: today,
    image_count: isImageUpload ? currentUsage.image_count + 1 : currentUsage.image_count,
    message_count: isImageUpload ? currentUsage.message_count : currentUsage.message_count + 1
  };

  // 3. Upsert into Supabase
  const { error } = await supabase
    .from('user_usage')
    .upsert(updates, { onConflict: 'user_id,date' });

  if (error) {
    console.error('Failed to increment usage:', error);
  } else {
    console.log(`Usage Updated [${today}]:`, updates);
  }
};
