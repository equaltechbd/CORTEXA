import React from 'react';
import { UserProfile } from './types';
import { SUBSCRIPTION_LIMITS } from './constants';
import { 
  Settings, CreditCard, History, HelpCircle, LogOut, 
  Moon, Sun, Monitor, Zap 
} from 'lucide-react';

interface ProfileMenuProps {
  userProfile: UserProfile;
  onClose: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenPricing: () => void; // ✅ New Prop
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ 
  userProfile, 
  onClose, 
  onLogout,
  onOpenSettings,
  onOpenPricing 
}) => {
  const tier = userProfile.subscription_tier || 'free';
  const limits = SUBSCRIPTION_LIMITS[tier];
  const teamSize = userProfile.team_size || 1;
  const multiplier = Math.max(1, teamSize);

  const maxMessages = limits.daily_messages * multiplier;
  const maxImages = limits.daily_images * multiplier;

  const msgPercent = Math.min(100, (userProfile.daily_message_count / maxMessages) * 100);
  const imgPercent = Math.min(100, (userProfile.daily_image_count / maxImages) * 100);

  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute bottom-16 left-4 w-[300px] bg-[#1E1F20] rounded-2xl border border-gray-700 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200">
        
        {/* HEADER */}
        <div className="p-4 bg-[#28292A] border-b border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-[#1E1F20] overflow-hidden">
              {userProfile.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full object-cover"/> : getInitials(userProfile.full_name || '')}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{userProfile.full_name || 'User'}</h3>
              <p className="text-xs text-gray-400 truncate">{userProfile.subscription_tier.toUpperCase()}</p>
            </div>
          </div>

          {/* TRACKERS */}
          <div className="space-y-2 mt-2">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500"><span>Messages</span><span>{userProfile.daily_message_count}/{maxMessages}</span></div>
              <div className="h-1.5 w-full bg-gray-700 rounded-full"><div className={`h-full rounded-full ${msgPercent > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${msgPercent}%` }} /></div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500"><span>Files</span><span>{userProfile.daily_image_count}/{maxImages}</span></div>
              <div className="h-1.5 w-full bg-gray-700 rounded-full"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${imgPercent}%` }} /></div>
            </div>
          </div>
        </div>

        {/* UPGRADE BUTTON */}
        {(tier === 'free' || tier === 'basic') && (
          <div className="p-3">
            <button onClick={onOpenPricing} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 shadow-lg">
              <Zap size={16} className="fill-white" /> Upgrade to Pro
            </button>
          </div>
        )}

        {/* MENU */}
        <div className="py-2 flex flex-col">
          <button onClick={onOpenSettings} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#333]"><Settings size={18}/><span>Personalization</span></button>
          <button onClick={onOpenPricing} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#333]"><CreditCard size={18}/><span>Manage Subscription</span></button>
          <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#333]"><History size={18}/><span>Activity</span></button>
          <div className="h-px bg-gray-700 mx-4 my-1"></div>
          <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-[#333]"><HelpCircle size={18}/><span>Help & Feedback</span></button>
        </div>

        <div className="h-px bg-gray-700 mx-4"></div>
        <div className="p-4 bg-[#18191A] text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span><span>📍 Location: South Asia</span></div>
          <button onClick={onLogout} className="mt-3 flex items-center gap-2 text-xs font-medium text-red-400 hover:underline"><LogOut size={12}/> Log out</button>
        </div>
      </div>
    </>
  );
};
