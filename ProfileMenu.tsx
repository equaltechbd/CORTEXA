import React from 'react';
import { Settings, LogOut, HelpCircle, Zap } from 'lucide-react';

interface ProfileMenuProps {
  onClose: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ onClose, onOpenSettings, onLogout }) => {
  return (
    <div className="bg-[#28292a] border border-[#444746] rounded-xl shadow-xl overflow-hidden py-1 w-full animate-in fade-in slide-in-from-bottom-2">
      <button className="w-full px-4 py-3 flex items-center gap-3 text-[#e3e3e3] hover:bg-[#37393b] text-left transition-colors">
        <Zap size={18} className="text-yellow-400" />
        <span className="text-sm font-medium">Upgrade Plan</span>
      </button>
      
      <button 
        onClick={onOpenSettings}
        className="w-full px-4 py-3 flex items-center gap-3 text-[#e3e3e3] hover:bg-[#37393b] text-left transition-colors"
      >
        <Settings size={18} className="text-gray-400" />
        <span className="text-sm font-medium">Settings</span>
      </button>

      <div className="h-px bg-[#444746] my-1 mx-2"></div>

      <button className="w-full px-4 py-3 flex items-center gap-3 text-[#e3e3e3] hover:bg-[#37393b] text-left transition-colors">
        <HelpCircle size={18} className="text-gray-400" />
        <span className="text-sm font-medium">Help & Support</span>
      </button>

      <button 
        onClick={onLogout}
        className="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:bg-red-500/10 text-left transition-colors"
      >
        <LogOut size={18} />
        <span className="text-sm font-medium">Log out</span>
      </button>
    </div>
  );
};
