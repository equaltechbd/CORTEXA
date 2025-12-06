import React, { useState, useRef, useEffect } from 'react';
import { Plus, Image as ImageIcon, SendHorizontal } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  onAttachImage: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onAttachImage, isLoading, disabled }) => {
  const [text, setText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (!text.trim() || isLoading || disabled) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-[800px] mx-auto px-4 pb-4">
      <div className="relative flex items-center gap-2 bg-[#1e1f20] rounded-[32px] p-2 pr-4 shadow-lg border border-[#444746]/50 focus-within:bg-[#28292a] transition-colors">
        
        {/* Plus Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={disabled}
            className={`w-10 h-10 rounded-full bg-[#28292a] hover:bg-[#37393b] flex items-center justify-center text-[#c4c7c5] hover:text-white transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Plus size={20} />
          </button>

          {/* Plus Menu Popover */}
          {showMenu && (
            <div className="absolute bottom-14 left-0 bg-[#28292a] border border-[#444746] rounded-xl shadow-xl overflow-hidden min-w-[180px] z-20 animate-in fade-in zoom-in-95 duration-200">
              <button
                onClick={() => {
                  onAttachImage();
                  setShowMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-[#e3e3e3] hover:bg-[#37393b] transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <ImageIcon size={16} className="text-blue-400" />
                </div>
                <span className="text-sm font-medium">Upload Image</span>
              </button>
            </div>
          )}
        </div>

        {/* Text Input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Cortexa is thinking..." : "Ask CORTEXA..."}
          disabled={isLoading || disabled}
          className="flex-1 bg-transparent border-none outline-none text-[#e3e3e3] text-[16px] placeholder:text-[#8e918f] h-[40px]"
        />

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading || disabled}
          className={`p-2 rounded-full transition-colors ${
            text.trim() && !isLoading && !disabled
              ? 'text-white hover:bg-[#37393b]' 
              : 'text-[#444746] cursor-not-allowed'
          }`}
        >
          <SendHorizontal size={24} />
        </button>
      </div>
      
      <div className="text-center mt-2">
        <p className="text-[11px] text-[#444746]">
          CORTEXA can make mistakes. Verify critical repair protocols.
        </p>
      </div>
    </div>
  );
};