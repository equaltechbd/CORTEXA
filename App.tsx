import React, { useState, useEffect, useRef } from 'react';
// Fixing imports: Removing 'components/' and 'services/' since files are in root
import Sidebar from './Sidebar';  
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput'; 
import { LimitModal } from './LimitModal'; 
import { CortexaLogo } from './CortexaLogo'; 
import AuthScreen from './AuthScreen';
import { OnboardingModal } from './OnboardingModal'; // Ensure this file exists
import { SettingsModal } from './SettingsModal';     // Ensure this file exists
import { sendMessageToCortexa } from './gemini';
import { checkDailyLimits, incrementUsage } from './usageService'; 
import { supabase } from './supabaseClient';
import { Message, ChatMode, UserProfile } from './types';
import { X, LogOut } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

export default function App() {
  // --- STATE ---
  const [session, setSession] = useState<Session | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [greetingSubText, setGreetingSubText] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>('standard');
  const [showLimitModal, setShowLimitModal] = useState(false); 
  
  // Profile & Modal State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // File Upload State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Context
  const [location] = useState('South Asia');
  const role = userProfile?.role || 'Guest';

  // --- AUTH & DATA FETCHING ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setUserProfile(data as UserProfile);
        // Check if onboarding needed (e.g. if role is missing)
        if (!data.role) {
          setShowOnboarding(true);
        }
      } else {
        // No profile found, show onboarding to create one
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- EFFECTS ---

  // Responsive sidebar check
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 1024) {
          setIsSidebarOpen(false);
        } else {
          setIsSidebarOpen(true);
        }
      }
    };
    handleResize(); 
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Greeting
  useEffect(() => {
    if (session) {
      generateDynamicGreeting();
    }
  }, [session]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateDynamicGreeting = () => {
    const greetings = [
      "What shall we fix today?",
      "Ready to diagnose. What's the situation?",
      "What machine is acting up?",
      "System ready. What are the symptoms?",
      "What do you want to learn today?"
    ];
    const random = greetings[Math.floor(Math.random() * greetings.length)];
    setGreetingSubText(random);
  };

  // --- HANDLERS ---

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  const clearImage = () => setSelectedImage(null);

  const handleSendMessage = async (text: string) => {
    if (!session?.user) return;

    // 1. CHECK LIMITS (Handled by Edge Function, but we catch 429)
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    const imageToSend = selectedImage;
    setSelectedImage(null);

    // Optimistic UI: Thinking State
    const thinkingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: thinkingId,
      role: 'model',
      text: 'Thinking...',
      timestamp: Date.now(),
      isThinking: true
    }]);

    try {
      // API Call
      const response = await sendMessageToCortexa(
        userMsg.text,
        chatMode, // activeFacultyName placeholder if needed, likely just passing mode or text
        location as any,
        role as any,
        imageToSend || undefined
      );

      // Replace thinking bubble with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { 
              ...msg, 
              text: response.text, 
              isThinking: false, 
              groundingMetadata: response.groundingMetadata 
            }
          : msg
      ));
    } catch (error: any) {
      console.error(error);
      
      // Handle Daily Limit Error from Edge Function
      if (error.message === 'Daily_Limit_Reached') {
        setShowLimitModal(true);
        // Remove the thinking bubble if failed
        setMessages(prev => prev.filter(msg => msg.id !== thinkingId));
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === thinkingId 
            ? { ...msg, text: "Connection interrupted. Please retry.", isThinking: false }
            : msg
        ));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER AUTH SCREEN IF NOT LOGGED IN ---
  if (!session) {
    return <AuthScreen />;
  }

  return (
    <>
      {/* MODALS */}
      {showLimitModal && (
        <LimitModal 
          onClose={() => setShowLimitModal(false)} 
          onUpgrade={() => {
            alert("Redirecting to Payment Gateway...");
            setShowLimitModal(false);
          }} 
        />
      )}

      {showOnboarding && session.user && (
        <OnboardingModal 
          userId={session.user.id} 
          onComplete={() => {
            setShowOnboarding(false);
            fetchUserProfile(session.user.id);
          }} 
        />
      )}

      {isSettingsOpen && session.user && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)}
          onProfileUpdate={() => fetchUserProfile(session.user.id)}
        />
      )}

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        id="file-input" 
        accept="image/*"
        style={{ display: 'none' }} 
        onChange={handleFileSelect}
      />

      {/* --- HEADER (Cleaned Up) --- */}
      <header className="top-bar">
        <div className="left-section">
          <button 
            id="menu-toggle"
            className="icon-btn"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Menu"
          >
            <i className="ph ph-list"></i>
          </button>
          
          <div className="logo-wrapper">
             <CortexaLogo size={32} particleCount={40} />
          </div>

          <span className="brand-name">CORTEXA</span>
        </div>

        <div className="right-section"></div>
      </header>

      {/* --- SIDEBAR --- */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onNewChat={() => setMessages([])} 
        userProfile={userProfile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      {/* --- MAIN CHAT AREA --- */}
      <div className={`main-container ${isSidebarOpen ? 'sidebar-visible' : ''}`}>
        
        {/* Greeting (Empty State) */}
        {messages.length === 0 && (
          <div className="greeting-area">
            <h1 className="gradient-text">Hi, {userProfile?.profile?.name?.split(' ')[0] || session.user.email?.split('@')[0]}</h1>
            <h2 className="sub-text">{greetingSubText}</h2>
          </div>
        )}

        {/* Active Chat */}
        {messages.length > 0 && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '4rem 10% 2rem 10%' }}>
            {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="w-full bg-[#131314] pt-2">
          {/* Image Preview */}
          {selectedImage && (
            <div className="w-full max-w-[800px] mx-auto px-4 mb-2">
              <div className="relative inline-block">
                <img src={selectedImage} alt="Preview" className="h-20 rounded-lg border border-[#444746]" />
                <button 
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 rounded-full p-1 hover:bg-zinc-700 border border-zinc-600"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          )}

          {/* New Chat Input Component */}
          <ChatInput 
             onSend={handleSendMessage}
             onAttachImage={handleAttachClick}
             isLoading={isLoading}
             disabled={showLimitModal} 
             chatMode={chatMode}
             onModeChange={setChatMode}
          />
        </div>

      </div>
    </>
  );
}
