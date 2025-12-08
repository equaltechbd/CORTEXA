import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { X } from 'lucide-react';

// --- IMPORTS (Corrected) ---
// ভুল ছিল: import Sidebar from './Sidebar';
// সঠিক হলো: { Sidebar } ব্র্যাকেট সহ
import { Sidebar } from './Sidebar';  
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput'; 
import { LimitModal } from './LimitModal'; 
import { CortexaLogo } from './CortexaLogo'; 
import { AuthScreen } from './AuthScreen';
import { OnboardingModal } from './OnboardingModal';
import { SettingsModal } from './SettingsModal';
import { sendMessageToCortexa } from './gemini';

// Types
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

  // User Context
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
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setUserProfile(data as UserProfile);
        if (!data.occupation || !data.role) {
          setShowOnboarding(true);
        }
      } else {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // --- UI EFFECTS ---
  
  useEffect(() => {
    if (session) {
      const greetings = [
        "What shall we fix today?",
        "Ready to diagnose. What's the situation?",
        "What machine is acting up?",
        "System ready. What are the symptoms?",
        "What do you want to learn today?"
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
      const response = await sendMessageToCortexa(
        userMsg.text,
        chatMode as any, 
        location as any,
        (userProfile?.role || 'Guest') as any,
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
    } catch (error: any) {
      console.error(error);
      
      if (error.message === 'Daily_Limit_Reached') {
        setShowLimitModal(true);
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

      <input 
        type="file" 
        ref={fileInputRef} 
        id="file-input" 
        accept="image/*"
        style={{ display: 'none' }} 
        onChange={handleFileSelect}
      />

      <header className="fixed top-0 w-full h-16 bg-[#131314] flex items-center px-4 z-50 backdrop-blur-md border-b border-[#333] justify-between lg:justify-start">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="text-gray-400 hover:text-white p-2 lg:hidden"
          >
            <i className="ph ph-list text-2xl"></i>
          </button>
          <div className="flex items-center gap-2">
            <CortexaLogo size={32} particleCount={40} />
            <span className="text-xl font-medium text-gray-300 tracking-wide">CORTEXA</span>
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
        className={`pt-16 h-screen bg-[#131314] flex flex-col transition-all duration-
