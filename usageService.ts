import { supabase } from './supabaseClient';
import { SUBSCRIPTION_LIMITS } from './constants';
import { SubscriptionTier } from './types';

export const checkAndIncrementLimit = async (
  userId: string,
  tier: SubscriptionTier,
  teamSize: number, // এই teamSize দিয়েই আমরা লিমিট গুণ করব
  type: 'message' | 'image' | 'search'
): Promise<boolean> => {
  
  // ১. বর্তমান কাউন্ট এবং শেষ রিসেট টাইম চেক করা
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('daily_message_count, daily_image_count, daily_search_count, last_reset_time')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    console.error("Error checking limits:", error);
    return true; // এরর হলে আটকে না রেখে এলাউ করে দিচ্ছি (ফেইলসেফ)
  }

  // ২. ২৪ ঘণ্টা পার হয়েছে কি না চেক করা (Daily Reset Logic)
  const lastReset = new Date(profile.last_reset_time);
  const now = new Date();
  
  // যদি তারিখ আলাদা হয়, তবে কাউন্টার ০ করে দেব
  const isNextDay = now.getDate() !== lastReset.getDate() || now.getMonth() !== lastReset.getMonth();

  if (isNextDay) {
    await supabase.from('profiles').update({
      daily_message_count: 0,
      daily_image_count: 0,
      daily_search_count: 0,
      last_reset_time: now.toISOString()
    }).eq('id', userId);
    
    // লোকাল ভেরিয়েবলও রিসেট
    profile.daily_message_count = 0;
    profile.daily_image_count = 0;
    profile.daily_search_count = 0;
  }

  // ৩. লিমিট ক্যালকুলেশন (BUSINESS PLAN MULTIPLIER)
  const tierLimits = SUBSCRIPTION_LIMITS[tier];
  
  // যদি team_size ১ এর নিচে হয়, তাহলে ডিফল্ট ১ ধরব
  const multiplier = Math.max(1, teamSize || 1); 

  let currentUsage = 0;
  let maxLimit = 0;
  let columnToUpdate = '';

  if (type === 'message') {
    currentUsage = profile.daily_message_count;
    // লজিক: লিমিট = বেসিক লিমিট × মেম্বার সংখ্যা
    maxLimit = tierLimits.daily_messages * multiplier; 
    columnToUpdate = 'daily_message_count';
  } 
  else if (type === 'image') {
    currentUsage = profile.daily_image_count;
    maxLimit = tierLimits.daily_images * multiplier;
    columnToUpdate = 'daily_image_count';
  } 
  else if (type === 'search') {
    currentUsage = profile.daily_search_count;
    maxLimit = tierLimits.search_limit * multiplier;
    columnToUpdate = 'daily_search_count';
  }

  console.log(`Limit Check [${type}]: Used ${currentUsage} / Max ${maxLimit} (Team: ${multiplier})`);

  // ৪. ভেরিফিকেশন: লিমিট শেষ কি না?
  if (currentUsage >= maxLimit) {
    return false; // লিমিট শেষ, কাজ করতে দেব না
  }

  // ৫. সব ঠিক থাকলে কাউন্টার ১ বাড়ানো (Increment)
  await supabase.from('profiles').update({
    [columnToUpdate]: currentUsage + 1
  }).eq('id', userId);

  return true; // সাকসেস
};
