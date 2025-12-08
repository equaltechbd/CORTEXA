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
  team_size: number;
  daily_message_count: number;
  daily_image_count: number;
  daily_search_count: number;
  last_reset_time: string;
}

// ফাইল অ্যাটাচমেন্টের টাইপ
export interface Attachment {
  type: 'image' | 'video' | 'document';
  mimeType: string;
  data: string; // Base64 string
  name: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachment?: Attachment; // আগে শুধু image ছিল, এখন attachment
  isThinking?: boolean;
  groundingMetadata?: GroundingMetadata;
}

export interface GroundingMetadata {
  webSearchQueries: string[];
  searchEntryPoint: any;
}
