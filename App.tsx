import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { X } from 'lucide-react';

// COMPONENTS
import { Sidebar } from './Sidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput'; 
import { LimitModal } from './LimitModal'; 
import { CortexaLogo } from './CortexaLogo'; 
import { AuthScreen } from './AuthScreen';
import { OnboardingModal } from './OnboardingModal';
import { SettingsModal } from './SettingsModal';
import { sendMessageToCortexa } from './gemini';

// SERVICE (NEW)
import { checkAndIncrementLimit } from './usageService';

// TYPES
import { Message, ChatMode, UserProfile } from './types';

export default function App() {
  // --- STATE MANAGEMENT ---
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
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Context (Default)
  const [location] = useState('South Asia');

  // --- AUTH & PROFILE FETCHING ---
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

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setUserProfile(data as UserProfile);
        if (!data.role) {
          setShowOnboarding(true);
        }
      } else {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // --- UI EFFECTS ---
  useEffect(() => {
    if (session) {
      const greetings = [
        "What shall we fix today?",
        "Ready to diagnose. What's the situation?",
        "System ready. Describe the fault.",
        "CORTEXA Online. Awaiting input.",
        "Let's troubleshoot. What do you see?"
      ];
      setGreetingSubText(greetings[Math.floor(Math.random() * greetings.length)]);
    }
  }, [session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- HANDLERS ---

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessages([]);
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
    event.target.value = ''; 
  };

  const handleSendMessage = async (text: string) => {
    if (!session?.user) return;

    // --- 🛑 LIMIT CHECK (NEW) ---
    // মেসেজ বা ছবি পাঠানোর আগে লিমিট চেক করা হচ্ছে
    const currentTier = userProfile?.subscription_tier || 'free';
    const teamSize = userProfile?.team_size || 1;
    const checkType = selectedImage ? 'image' : 'message';

    // ১. চেক: লিমিট আছে কি না?
    const hasLimit = await checkAndIncrementLimit(
      session.user.id,
      currentTier,
      teamSize,
      checkType
    );

    // ২. যদি লিমিট না থাকে, মডেল দেখাও এবং থামিয়ে দাও
    if (!hasLimit) {
      setShowLimitModal(true);
      return; 
    }
    // ----------------------------

    // ৩. মেসেজ সেটআপ (যদি লিমিট থাকে)
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

    const thinkingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: thinkingId,
      role: 'model',
      text: 'Thinking...',
      timestamp: Date.now(),
      isThinking: true
    }]);

    try {
      const currentRole = userProfile?.role || 'Guest';

      // ৪. Gemini কল করা (এখন আর এখানে লিমিট চেক করতে হবে না, উপরেই হয়ে গেছে)
      const response = await sendMessageToCortexa(
        userMsg.text,
        'General',
        location as any,
        currentRole as any,
        currentTier,
        imageToSend || undefined
      );

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
      
      // ৫. প্রোফাইল রিফ্রেশ (যাতে কাউন্ট আপডেট হয়)
      fetchUserProfile(session.user.id); 

    } catch (error: any) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { ...msg, text: "⚠️ Connection interrupted. Please retry.", isThinking: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER ---
  if (!session) {
    return <AuthScreen />;
  }

  return (
    <>
      {showLimitModal && (
        <LimitModal 
          onClose={() => setShowLimitModal(false)} 
          onUpgrade={() => {
            alert("Contact Support to Upgrade Plan!"); 
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
          userProfile={userProfile}
        />
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        id="file-input" 
        accept="image/*"
        style={{ display: 'none' }} 
        onChange={handleFileSelect}
      />

      {/* HEADER */}
      <header className="fixed top-0 w-full h-16 bg-[#131314] flex items-center px-4 z-50 backdrop-blur-md border-b border-[#333] justify-between lg:justify-start">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="text-gray-400 hover:text-white p-2 lg:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div className="flex items-center gap-2">
            <CortexaLogo size={32} particleCount={40} />
            <span className="text-xl font-medium text-gray-300 tracking-wide">CORTEXA</span>
            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
              {userProfile?.subscription_tier?.toUpperCase() || 'FREE'}
              {userProfile?.team_size && userProfile.team_size > 1 ? ` (Team: ${userProfile.team_size})` : ''}
            </span>
          </div>
        </div>
      </header>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onNewChat={() => setMessages([])} 
        userProfile={userProfile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      <div 
        className={`pt-16 h-screen bg-[#131314] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[280px]' : ''}`}
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center px-[10%] max-w-4xl mx-auto w-full">
            <h1 className="text-4xl md:text-5xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
              Hi, {userProfile?.full_name?.split(' ')[0] || 'User'}
            </h1>
            <h2 className="text-3xl md:text-5xl font-medium text-[#444746]">
              {greetingSubText}
            </h2>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:px-[10%] pb-4 scrollbar-thin scrollbar-thumb-gray-800">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* INPUT AREA */}
        <div className="bg-[#131314] pt-2 pb-6 px-4 border-t border-[#333]/30">
          {selectedImage && (
            <div className="max-w-[800px] mx-auto mb-2 relative inline-block">
              <img src={selectedImage} alt="Preview" className="h-16 rounded border border-gray-700" />
              <button 
                onClick={() => setSelectedImage(null)} 
                className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 border border-gray-600 hover:bg-gray-700"
              >
                <X size={12} className="text-gray-300" />
              </button>
            </div>
          )}
          
          <ChatInput 
             onSend={handleSendMessage}
             onAttachImage={() => fileInputRef.current?.click()}
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
