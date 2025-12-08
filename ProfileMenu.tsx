import React from 'react';
import { UserProfile } from './types';
import { SUBSCRIPTION_LIMITS } from './constants';
import { 
  Settings, CreditCard, History, HelpCircle, LogOut, 
  Moon, Sun, Monitor, ChevronRight, Zap 
} from 'lucide-react';

interface ProfileMenuProps {
  userProfile: UserProfile;
  onClose: () => void;
  onLogout: () => void;
  onOpenSettings: () => void; // Personalization খোলার জন্য
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ 
  userProfile, 
  onClose, 
  onLogout,
  onOpenSettings 
}) => {
  // --- LIMIT CALCULATION ---
  const tier = userProfile.subscription_tier || 'free';
  const limits = SUBSCRIPTION_LIMITS[tier];
  const teamSize = userProfile.team_size || 1;
  const multiplier = Math.max(1, teamSize);

  const maxMessages = limits.daily_messages * multiplier;
  const maxImages = limits.daily_images * multiplier;

  // Percentage Helpers
  const msgPercent = Math.min(100, (userProfile.daily_message_count / maxMessages) * 100);
  const imgPercent = Math.min(100, (userProfile.daily_image_count / maxImages) * 100);

  // Avatar Logic (Image or Initials)
  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Background Overlay (to close menu when clicking outside) */}
      <div className="fixed inset-0 z-40" onClick={onClose}></div>

      {/* MENU CONTAINER */}
      <div className="absolute bottom-16 left-4 w-[300px] bg-[#1E1F20] rounded-2xl border border-gray-700 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
        
        {/* 1. HEADER & TRACKER */}
        <div className="p-4 bg-[#28292A] border-b border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-[#1E1F20] shadow-sm overflow-hidden">
              {userProfile.avatar_url ? (
                <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(userProfile.full_name || '')
              )}
            </div>
            
            {/* Name & Email */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {userProfile.full_name || 'CORTEXA User'}
              </h3>
              <p className="text-xs text-gray-400 truncate">
                {/* Email Supabase থেকে আসে, টাইপে না থাকলে ডিফল্ট */}
                User ID: {userProfile.id.slice(0, 6)}...
              </p>
            </div>
          </div>

          {/* Usage Progress Bars (Gemini Style) */}
          <div className="space-y-2 mt-2">
            {/* Messages */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <span>Messages</span>
                <span>{userProfile.daily_message_count} / {maxMessages}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${msgPercent > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
                  style={{ width: `${msgPercent}%` }} 
                />
              </div>
            </div>

            {/* Files */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <span>Files</span>
                <span>{userProfile.daily_image_count} / {maxImages}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all" 
                  style={{ width: `${imgPercent}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. UPGRADE ACTION (Only for Free/Basic) */}
        {(tier === 'free' || tier === 'basic') && (
          <div className="p-3">
            <button 
              onClick={() => alert("Redirect to Pricing Page...")}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Zap size={16} className="fill-white" />
              Upgrade to Pro
            </button>
          </div>
        )}

        {/* 3. MENU OPTIONS */}
        <div className="py-2 flex flex-col">
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#333] hover:text-white transition-colors"
          >
            <Settings size={18} />
            <span>Personalization</span>
          </button>

          <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#333] hover:text-white transition-colors">
            <CreditCard size={18} />
            <span>Manage Subscription</span>
          </button>

          <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#333] hover:text-white transition-colors">
            <History size={18} />
            <span>Activity</span>
          </button>

          <div className="h-px bg-gray-700 mx-4 my-1"></div>

          {/* Theme Toggle (Visual Only) */}
          <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-300">
            <span className="flex items-center gap-3">
              <Monitor size={18} /> Theme
            </span>
            <div className="flex bg-[#131314] rounded-lg p-1 border border-gray-700">
              <button className="p-1 rounded hover:bg-gray-700 text-gray-400"><Sun size={14} /></button>
              <button className="p-1 rounded bg-gray-700 text-white shadow"><Moon size={14} /></button>
              <button className="p-1 rounded hover:bg-gray-700 text-gray-400"><Monitor size={14} /></button>
            </div>
          </div>

          <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#333] hover:text-white transition-colors">
            <HelpCircle size={18} />
            <span>Help & Feedback</span>
          </button>
        </div>

        <div className="h-px bg-gray-700 mx-4"></div>

        {/* 4. FOOTER (CONTEXT INFO) */}
        <div className="p-4 bg-[#18191A]">
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span>📍 Location: South Asia</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>🛠️ Role: {userProfile.role || 'Guest'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span>🎓 Level: {userProfile.experience_level || 'Beginner'}</span>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="mt-3 flex items-center gap-2 text-xs font-medium text-red-400 hover:text-red-300 hover:underline"
          >
            <LogOut size={12} /> Log out
          </button>
        </div>

      </div>
    </>
  );
};
