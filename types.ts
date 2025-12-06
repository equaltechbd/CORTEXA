export type UserLocation = 'South Asia' | 'Global';
export type UserRole = 'Guest' | 'Verified_Pro';

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  image?: string; // Base64 string
  groundingMetadata?: GroundingMetadata;
  isThinking?: boolean;
}

export interface GroundingMetadata {
  groundingChunks: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
}

export type ChatMode = 'standard' | 'fast' | 'deep_think' | 'search';

export interface Faculty {
  id: string;
  name: string;
  category: 'Hardware' | 'Digital' | 'Tech';
  description: string;
  icon: string;
}

export interface CourseOffering {
  id: string;
  title: string;
  duration: string;
  price: string;
  iconClass: string;
}

export interface AppState {
  location: UserLocation | null;
  role: UserRole;
  activeFacultyId: string;
  isSidebarOpen: boolean;
}

// --- USAGE TRACKING ---
export interface UserUsage {
  date: string;
  image_count: number;
  message_count: number;
}

// --- FIRESTORE DATABASE SCHEMA ---

export interface UserDocument {
  profile: {
    name: string;
    country: string;
    voltage_standard: '110V' | '220V';
    language_pref: string;
    occupation: string;
  };
  access_level: {
    is_pro_subscriber: boolean;
    is_verified_mechanic: boolean;
    purchased_courses: string[]; // IDs of courses
  };
  activity_log: {
    last_active: number; // Timestamp
    total_repairs_solved: number;
  };
}

export interface CourseDocument {
  id: string;
  title: string;
  price_bdt: number;
  price_usd: number;
  modules: Record<string, string>; // e.g., { "module_1": "Title" }
}

export interface ProToolDocument {
  id: string;
  file_url: string;
  access_required: string; // e.g., "pro_subscription_tier_1"
  description: string;
}