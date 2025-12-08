import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { ProfileMenu } from './ProfileMenu';
import { UserAvatar } from './UserAvatar';
import { Plus, MessageSquare, ShieldCheck, Wrench, MoreHorizontal } from 'lucide-react';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen w-[280px] bg-[#1e1f20] border-r border-[#333] transform transition-transform duration-300 z-40 flex flex-col pt-[64px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      
      {/* 1. MIDDLE SECTION: Navigation & History */}
      {/* flex-grow: 1; overflow-y: auto; - Pushes footer down naturally */}
      <div className="flex-grow overflow-y-auto p-3 custom-scrollbar flex flex-col gap-2">
        
        {/* New Chat Button */}
        <button 
          onClick={onNewChat}
          className="flex items-center gap-3 w-full px-4 py-3 bg-[#282a2c] hover:bg-[#37393b] text-[#c4c7c5] hover:text-white rounded-full transition-all group shrink-0"
        >
          <div className="p-1 bg-white/5 rounded-full group-hover:bg-white/10">
            <Plus size={18} />
          </div>
          <span className="text-sm font-medium">New chat</span>
        </button>

        {/* Workspace Section */}
        <div className="mt-4 shrink-0">
          <h3 className="px-4 text-xs font-semibold text-[#8e918f] uppercase tracking-wider mb-2">
            My Workspace
          </h3>
          <div className="px-4 py-2 text-xs text-[#5e615f] italic">
            Recent chats will appear here...
          </div>
        </div>

        {/* Pro Section */}
        <div className="mt-4 pt-4 border-t border-[#333] shrink-0">
          <h3 className="px-4 text-xs font-semibold text-[#8e918f] uppercase tracking-wider mb-2">
            Become Pro
          </h3>
          <button className="flex items-center gap-3 w-full px-4 py-2 text-[#e3e3e3] hover:bg-[#28292a] rounded-lg transition-colors text-left text-sm group">
            <ShieldCheck size={16} className="text-[#a8c7fa] group-hover:text-[#8ab4f8]" />
            <span>Cyber Security Ops</span>
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-2 text-[#e3e3e3] hover:bg-[#28292a] rounded-lg transition-colors text-left text-sm group">
            <Wrench size={16} className="text-[#a8c7fa] group-hover:text-[#8ab4f8]" />
            <span>Master Level Repair</span>
          </button>
        </div>
      </div>

      {/* 2. FOOTER SECTION: User Profile */}
      {/* Pinned to bottom via flex layout */}
      <div 
        className="p-3 border-t border-[#333] bg-[#1e1f20] relative shrink-0" 
        ref={menuRef}
      >
        
        {/* Profile Menu Popover */}
        {/* Positioned absolutely: bottom: 100%, left: 0, width: 100% */}
        {isMenuOpen && (
          <div className="absolute bottom-full left-0 w-full px-2 z-50 mb-3">
             <div className="w-full">
                <ProfileMenu 
                  onClose={() => setIsMenuOpen(false)}
                  onOpenSettings={() => {
                    onOpenSettings();
                    setIsMenuOpen(false);
                  }}
                  onLogout={onLogout}
                />
             </div>
          </div>
        )}

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-colors ${isMenuOpen ? 'bg-[#28292a]' : 'hover:bg-[#28292a]'}`}
        >
          <div className="flex-shrink-0">
             <UserAvatar userProfile={userProfile} />
          </div>
          
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-sm font-medium text-[#e3e3e3] truncate">
              {userProfile?.profile?.name || userProfile?.full_name || 'User'}
            </p>
            <p className="text-xs text-[#8e918f] truncate capitalize">
              {userProfile?.profile?.occupation || userProfile?.role?.replace(/_/g, ' ') || 'Guest'}
            </p>
          </div>

          <MoreHorizontal size={16} className="text-[#8e918f]" />
        </button>
      </div>

    </aside>
  );
};
