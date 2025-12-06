import React from 'react';
import { Message } from '../types';
import { User } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { CortexaLogo } from './CortexaLogo'; // Relative import fixes error

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isThinking = message.isThinking;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[95%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar Area */}
        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center ${isUser ? 'user-avatar-hidden' : ''}`}>
          {isUser ? (
             <User size={18} className="text-white" />
          ) : (
             isThinking ? (
               // Animated Logo for Thinking State
               <CortexaLogo size={40} particleCount={60} />
             ) : (
               // Static Logo for Final Response
               <img 
                 src="logo.jpg" 
                 alt="Cortexa" 
                 className="app-logo w-10 h-10 rounded-md object-contain"
               />
             )
          )}
        </div>

        {/* Bubble Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}>
            
            {/* Image Attachment (User) */}
            {isUser && message.image && (
              <div className="mb-2">
                <img 
                  src={message.image} 
                  alt="Attachment" 
                  className="max-h-48 rounded-xl border border-zinc-700" 
                />
              </div>
            )}

            {/* Text Bubble */}
            <div className={`p-4 rounded-2xl ${
              isUser 
                ? 'bg-indigo-600/20 border border-indigo-500/30 rounded-tr-sm text-white' 
                : isThinking 
                  ? 'bg-transparent pl-0 pt-2' // Minimal style for thinking text
                  : 'bg-zinc-900 border border-zinc-800 rounded-tl-sm text-zinc-200'
            }`}>
              {isThinking ? (
                <span className="cortexa-loading-text">Thinking...</span>
              ) : (
                <MarkdownRenderer content={message.text} isUser={isUser} />
              )}
            </div>

            {/* Sources / Grounding */}
            {!isUser && !isThinking && message.groundingMetadata && message.groundingMetadata.groundingChunks?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.groundingMetadata.groundingChunks.map((chunk, idx) => {
                  if (chunk.web?.uri) {
                    return (
                      <a 
                        key={idx} 
                        href={chunk.web.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] bg-[#1e1f20] hover:bg-[#28292a] text-[#c4c7c5] px-2 py-1 rounded border border-[#444746] transition-colors flex items-center gap-1 no-underline"
                      >
                        <i className="ph ph-link"></i>
                        {chunk.web.title || 'Source'}
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            )}
            
            {!isThinking && (
              <span className="text-xs text-zinc-600 mt-1 px-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
        </div>
      </div>
    </div>
  );
};