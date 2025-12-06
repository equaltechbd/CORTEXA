import React from 'react';
import { Lock } from 'lucide-react';

interface LimitModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export const LimitModal: React.FC<LimitModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1e1f20] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="text-red-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Daily Limit Reached</h2>
          <p className="text-[#c4c7c5] text-sm">
            You have reached your free tier limit for today. Access to Cortexa resets at midnight.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onUpgrade}
            className="w-full py-3 bg-[#a8c7fa] hover:bg-[#8ab4f8] text-black font-semibold rounded-full transition-colors"
          >
            Upgrade to Pro
          </button>
          <button 
            onClick={onClose}
            className="w-full py-3 bg-transparent hover:bg-[#28292a] text-[#c4c7c5] font-medium rounded-full transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};