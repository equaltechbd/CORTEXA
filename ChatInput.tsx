
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Image as ImageIcon, SendHorizontal, Sparkles, Zap, BrainCircuit, Search } from 'lucide-react';
import { ChatMode } from '../types';

interface ChatInputProps {
  onSend: (text: string) => void;
  onAttachImage: () => void;
  isLoading: boolean;
  disabled?: boolean;
  chatMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  onAttachImage, 
  isLoading, 
  disabled,
  chatMode,
  onModeChange
}) => {
  const [text, setText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const modeMenuRef = useRef<HTMLDivElement>(null);

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

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target as Node)) {
        setShowModeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModeIcon = (mode: ChatMode) => {
    switch (mode) {
      case 'fast': return <Zap size={20} />;
      case 'deep_think': return <BrainCircuit size={20} />;
      case 'search': return <Search size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  const getModeLabel = (mode: ChatMode) => {
    switch (mode) {
      case 'fast': return 'Fast';
      case 'deep_think': return 'Deep Scan';
      case 'search': return 'Search';
      default: return 'Standard';
    }
  };

  return (
    <div className="w-full max-w-[800px] mx-auto px-4 pb-4">
      <div className="relative flex items-center gap-2 bg-[#1e1f20] rounded-[32px] p-2 pr-4 shadow-lg border border-[#444746]/50 focus-within:bg-[#28292a] transition-colors">
        
        {/* Attachment Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            disabled={disabled}
            className={`w-10 h-10 rounded-full bg-[#28292a] hover:bg-[#37393b] flex items-center justify-center text-[#c4c7c5] hover:text-white transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Attach"
          >
            <Plus size={20} />
          </button>

          {/* Attachment Menu Popover */}
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

        {/* Mode Selector Button */}
        <div className="relative" ref={modeMenuRef}>
          <button
            onClick={() => setShowModeMenu(!showModeMenu)}
            disabled={disabled}
            className={`w-10 h-10 rounded-full bg-[#28292a] hover:bg-[#37393b] flex items-center justify-center text-[#c4c7c5] hover:text-white transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={`Current Mode: ${getModeLabel(chatMode)}`}
          >
            {getModeIcon(chatMode)}
          </button>

          {/* Mode Menu Popover */}
          {showModeMenu && (
            <div className="absolute bottom-14 left-0 bg-[#28292a] border border-[#444746] rounded-xl shadow-xl overflow-hidden min-w-[200px] z-20 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-2 text-[10px] font-semibold text-[#8e918f] uppercase tracking-wider">Select Model</div>
              
              <button
                onClick={() => { onModeChange('standard'); setShowModeMenu(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-[#37393b] transition-colors text-left ${chatMode === 'standard' ? 'bg-[#37393b] text-white' : 'text-[#c4c7c5]'}`}
              >
                <Sparkles size={16} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Standard</span>
                  <span className="text-[10px] text-[#8e918f]">Balanced reasoning</span>
                </div>
              </button>

              <button
                onClick={() => { onModeChange('fast'); setShowModeMenu(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-[#37393b] transition-colors text-left ${chatMode === 'fast' ? 'bg-[#37393b] text-white' : 'text-[#c4c7c5]'}`}
              >
                <Zap size={16} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Fast</span>
                  <span className="text-[10px] text-[#8e918f]">Quick responses</span>
                </div>
              </button>

              <button
                onClick={() => { onModeChange('deep_think'); setShowModeMenu(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-[#37393b] transition-colors text-left ${chatMode === 'deep_think' ? 'bg-[#37393b] text-white' : 'text-[#c4c7c5]'}`}
              >
                <BrainCircuit size={16} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Deep Scan</span>
                  <span className="text-[10px] text-[#8e918f]">Complex analysis</span>
                </div>
              </button>

              <button
                onClick={() => { onModeChange('search'); setShowModeMenu(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-[#37393b] transition-colors text-left ${chatMode === 'search' ? 'bg-[#37393b] text-white' : 'text-[#c4c7c5]'}`}
              >
                <Search size={16} />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Search</span>
                  <span className="text-[10px] text-[#8e918f]">Live web data</span>
                </div>
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
