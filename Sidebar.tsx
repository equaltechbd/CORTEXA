import React, { useState } from 'react';
import { MessageSquare, Plus, BookOpen, MoreHorizontal } from 'lucide-react';
import { UserProfile } from './types';
import { ProfileMenu } from './ProfileMenu';

interface SidebarProps {
  isOpen: boolean;
  onNewChat: () => void;
  userProfile: UserProfile | null;
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenPricing: () => void; // ✅
  currentView: 'chat' | 'courses'; // ✅
  onViewChange: (view: 'chat' | 'courses') => void; // ✅
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onNewChat, 
  userProfile, 
  onOpenSettings, 
  onLogout,
  onOpenPricing,
  currentView,
  onViewChange
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <aside className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-[#131314] border-r border-[#333] transition-all duration-300 z-40 flex flex-col ${isOpen ? 'w-[280px] translate-x-0' : 'w-[280px] -translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden'}`}>
      
      {/* 1. TOP ACTIONS */}
      <div className="p-4 space-y-2">
        <button 
          onClick={() => { onViewChange('chat'); onNewChat(); }}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#1E1F20] hover:bg-[#28292A] text-gray-200 rounded-full border border-gray-700 group"
        >
          <Plus size={20} className="text-gray-400 group-hover:text-white" />
          <span className="text-sm font-medium">New diagnosis</span>
        </button>

        <button 
          onClick={() => onViewChange('courses')}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors group ${currentView === 'courses' ? 'bg-[#1E1F20] text-white' : 'text-gray-300 hover:bg-[#1E1F20]'}`}
        >
          <BookOpen size={18} className={currentView === 'courses' ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'} />
          <span className="text-sm font-medium">Academy</span>
        </button>
      </div>

      {/* 2. CHATS */}
      <div className="flex-1 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-gray-800">
        <div className="px-4 py-2 mt-2"><span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent</span></div>
        <button onClick={() => onViewChange('chat')} className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1E1F20] rounded-lg flex items-center gap-3"><MessageSquare size={16} className="text-gray-500"/><span className="truncate">Circuit Analysis...</span></button>
      </div>

      {/* 3. FOOTER */}
      <div className="p-4 border-t border-[#333] bg-[#131314] relative">
        {isMenuOpen && userProfile && (
          <ProfileMenu 
            userProfile={userProfile}
            onClose={() => setIsMenuOpen(false)}
            onLogout={onLogout}
            onOpenSettings={() => { setIsMenuOpen(false); onOpenSettings(); }}
            onOpenPricing={() => { setIsMenuOpen(false); onOpenPricing(); }}
          />
        )}
        {userProfile ? (
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${isMenuOpen ? 'bg-[#28292A]' : 'hover:bg-[#1E1F20]'}`}>
            <div className="flex items-center gap-3">
              {userProfile.avatar_url ? <img src={userProfile.avatar_url} className="w-9 h-9 rounded-full border border-gray-700 object-cover"/> : <div className="w-9 h-9 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-800 text-blue-400 font-bold text-xs">{userProfile.full_name?.charAt(0).toUpperCase() || 'U'}</div>}
              <div className="flex flex-col items-start"><span className="text-sm font-medium text-gray-200 truncate max-w-[120px]">{userProfile.full_name?.split(' ')[0] || 'User'}</span><span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 rounded border border-gray-700 uppercase">{userProfile.subscription_tier}</span></div>
            </div>
            <MoreHorizontal size={18} className="text-gray-500" />
          </button>
        ) : (
          <div className="text-center p-2"><span className="text-xs text-gray-500">Guest Mode</span></div>
        )}
      </div>
    </aside>
  );
};
