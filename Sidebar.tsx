import React, { useState } from 'react';
import { MessageSquare, Plus, BookOpen, MoreHorizontal, User as UserIcon } from 'lucide-react';
import { UserProfile } from './types';
import { ProfileMenu } from './ProfileMenu';

interface SidebarProps {
  isOpen: boolean;
  onNewChat: () => void;
  userProfile: UserProfile | null;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onNewChat, 
  userProfile, 
  onOpenSettings, 
  onLogout 
}) => {
  // মেনু ওপেন/ক্লোজ করার স্টেট
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <aside 
      className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-[#131314] border-r border-[#333] transition-all duration-300 z-40 flex flex-col
      ${isOpen ? 'w-[280px] translate-x-0' : 'w-[280px] -translate-x-full lg:translate-x-0 lg:w-0 lg:border-none lg:overflow-hidden'}`}
    >
      {/* 1. TOP ACTIONS (New Chat & Courses) */}
      <div className="p-4 space-y-2">
        {/* New Chat Button */}
        <button 
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#1E1F20] hover:bg-[#28292A] text-gray-200 rounded-full transition-colors border border-gray-700 shadow-sm group"
        >
          <Plus size={20} className="text-gray-400 group-hover:text-white" />
          <span className="text-sm font-medium">New diagnosis</span>
        </button>

        {/* ✅ COURSES BUTTON (Added Here) */}
        <button 
          onClick={() => alert("CORTEXA Academy Coming Soon!")} // পরবর্তীতে আমরা রাউটিং যোগ করব
          className="w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-[#1E1F20] hover:text-white rounded-lg transition-colors group"
        >
          <BookOpen size={18} className="text-gray-400 group-hover:text-blue-400" />
          <span className="text-sm font-medium">Courses</span>
        </button>
      </div>

      {/* 2. CHATS (History List) */}
      <div className="flex-1 overflow-y-auto px-2 scrollbar-thin scrollbar-thumb-gray-800">
        <div className="px-4 py-2 mt-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent Chats</span>
        </div>
        {/* Chat History Item Example */}
        <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-[#1E1F20] rounded-lg transition-colors flex items-center gap-3 group">
          <MessageSquare size={16} className="text-gray-500 group-hover:text-white" />
          <span className="truncate">Circuit Board Analysis...</span>
        </button>
      </div>

      {/* 3. FOOTER (Profile & Settings) */}
      <div className="p-4 border-t border-[#333] bg-[#131314] relative">
        
        {/* PROFILE MENU POPUP */}
        {isMenuOpen && userProfile && (
          <ProfileMenu 
            userProfile={userProfile}
            onClose={() => setIsMenuOpen(false)}
            onLogout={onLogout}
            onOpenSettings={() => {
              setIsMenuOpen(false);
              onOpenSettings();
            }}
          />
        )}

        {/* PROFILE BUTTON TRIGGER */}
        {userProfile ? (
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-full flex items-center justify-between p-2 rounded-xl transition-all ${isMenuOpen ? 'bg-[#28292A]' : 'hover:bg-[#1E1F20]'}`}
          >
            <div className="flex items-center gap-3">
              {userProfile.avatar_url ? (
                <img src={userProfile.avatar_url} alt="Profile" className="w-9 h-9 rounded-full border border-gray-700 object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-800 text-blue-400 font-bold text-xs">
                  {userProfile.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-gray-200 truncate max-w-[120px]">
                  {userProfile.full_name?.split(' ')[0] || 'User'}
                </span>
                <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 rounded border border-gray-700 uppercase">
                  {userProfile.subscription_tier}
                </span>
              </div>
            </div>
            
            <MoreHorizontal size={18} className="text-gray-500" />
          </button>
        ) : (
          // GUEST VIEW
          <div className="text-center p-2">
            <span className="text-xs text-gray-500">Guest Mode</span>
          </div>
        )}
      </div>
    </aside>
  );
};
