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
  
  // Subscription Fields
  subscription_tier: SubscriptionTier;
  team_size: number; // ✅ নতুন: এখানে সদস্য সংখ্যা থাকবে (যেমন: 1, 3, 5, 10)
  daily_message_count: number;
  daily_image_count: number;
  daily_search_count: number;
  last_reset_time: string;
}

// বাকি টাইপগুলো (UserRole, Message ইত্যাদি) আগের মতোই থাকবে...

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
