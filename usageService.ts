import { supabase } from './supabaseClient';

const FREE_LIMITS = {
  IMAGES: 2,
  MESSAGES: 20
};

// --- Local Storage Helpers ---
// These provide a fallback so the app works even if the DB table is missing
const getLocalUsage = (userId: string, date: string) => {
  try {
    const key = `cortexa_usage_${userId}_${date}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : { image_count: 0, message_count: 0 };
  } catch (e) {
    return { image_count: 0, message_count: 0 };
  }
};

const setLocalUsage = (userId: string, date: string, usage: any) => {
  try {
    const key = `cortexa_usage_${userId}_${date}`;
    localStorage.setItem(key, JSON.stringify(usage));
  } catch (e) {
    console.warn('LocalStorage failed', e);
  }
};

export const checkDailyLimits = async (userId: string, isImageUpload: boolean): Promise<boolean> => {
  const today = new Date().toISOString().split('T')[0];
  let usage = { image_count: 0, message_count: 0 };
  
  // 1. Try Fetching from Supabase
  const { data, error } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error) {
    // Suppress "No rows found" error (PGRST116), it's normal for new days
    if (error.code !== 'PGRST116') {
       // Log warning but don't crash. Fallback to local.
       console.warn('Supabase usage check failed (using local fallback):', error.message);
    }
    // Fallback to local storage
    usage = getLocalUsage(userId, today);
  } else if (data) {
    usage = data;
    // Sync local with remote if remote was successful
    setLocalUsage(userId, today, usage);
  }

  // 2. Check Limits
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

  // 1. Get current usage (Try remote, fallback to local)
  let currentUsage = { image_count: 0, message_count: 0 };
  
  const { data } = await supabase
    .from('user_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
    
  if (data) {
    currentUsage = data;
  } else {
    // If fetch failed (table missing) or no data, use local
    currentUsage = getLocalUsage(userId, today);
  }
  
  // 2. Calculate New Usage
  const newUsage = {
    user_id: userId,
    date: today,
    image_count: isImageUpload ? currentUsage.image_count + 1 : currentUsage.image_count,
    message_count: isImageUpload ? currentUsage.message_count : currentUsage.message_count + 1
  };

  // 3. Update Local Storage (Immediate, robust)
  setLocalUsage(userId, today, newUsage);

  // 4. Try Upsert to Supabase (Best effort)
  const { error: upsertError } = await supabase
    .from('user_usage')
    .upsert(newUsage, { onConflict: 'user_id,date' });

  if (upsertError) {
    // Just log warning, don't show user error since local storage handled it
    console.warn('Failed to sync usage to Supabase:', upsertError.message);
  } else {
    console.log(`Usage Synced [${today}]`);
  }
};