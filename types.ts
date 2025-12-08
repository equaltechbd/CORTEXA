export type UserRole = 'Student' | 'Professional Technician' | 'Shop Owner' | 'Engineer' | 'Hobbyist' | 'Guest';
export type UserLocation = 'South Asia' | 'Global';
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'business';

export interface UserProfile {
  id: string;
  full_name?: string;
  role?: UserRole;
  occupation?: string;
  experience_level?: string;
  primary_field?: string;
  avatar_url?: string;
  
  // New Subscription Fields
  subscription_tier: SubscriptionTier;
  daily_message_count: number;
  daily_image_count: number;
  daily_search_count: number;
  last_reset_time: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  image?: string;
  isThinking?: boolean;
  groundingMetadata?: GroundingMetadata;
}

export interface GroundingMetadata {
  webSearchQueries: string[];
  searchEntryPoint: any;
}
