import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { X, FileText, Video as VideoIcon, Image as ImageIcon } from 'lucide-react';

// COMPONENTS
import { Sidebar } from './Sidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput'; 
import { LimitModal } from './LimitModal'; 
import { CortexaLogo } from './CortexaLogo'; 
import { AuthScreen } from './AuthScreen'; // এটা এখন পপ-আপ হিসেবে ব্যবহার হবে
import { LandingPage } from './LandingPage'; // নতুন ল্যান্ডিং পেজ
import { OnboardingModal } from './OnboardingModal';
import { SettingsModal } from './SettingsModal';
import { sendMessageToCortexa } from './gemini';

import { checkAndIncrementLimit } from './usageService';
import { validateFile, compressImage, fileToBase64 } from './utils';
import { Message, ChatMode, UserProfile, Attachment } from './types';

// GUEST LIMIT CONFIG
const GUEST_MESSAGE_LIMIT = 5;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false); // পপ-আপ লগইন
  const [showLanding, setShowLanding] = useState(true); // ল্যান্ডিং পেজ স্ট্যাটাস
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestCount, setGuestCount] = useState(0);

  // Modals & Profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [greetingSubText, setGreetingSubText] = useState('');

  // --- INITIALIZATION ---
  useEffect(() => {
    // ১. লোকাল স্টোরেজ থেকে গেস্ট কাউন্ট চেক করা
    const savedGuestCount = localStorage.getItem('cortexa_guest_count');
    if (savedGuestCount) {
      setGuestCount(parseInt(savedGuestCount));
    }

    // ২. সেশন চেক করা
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setShowLanding(false); // লগইন থাকলে ল্যান্ডিং পেজ বন্ধ
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setShowLanding(false);
        setShowAuthModal(false); // লগইন হলে মডাল বন্ধ
        fetchUserProfile(session.user.id);
      } else {
        // লগআউট হলে ল্যান্ডিং পেজে ফেরত
        setShowLanding(true);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        setUserProfile(data as UserProfile);
        if (!data.role) setShowOnboarding(true);
        
        // Google Login Sync (Auto-fill Name/Avatar if missing)
        if (!data.full_name && session?.user?.user_metadata?.full_name) {
           await supabase.from('profiles').update({
             full_name: session.user.user_metadata.full_name,
             avatar_url: session.user.user_metadata.avatar_url
           }).eq('id', userId);
        }
      } else {
        setShowOnboarding(true);
      }
    } catch (err) console.error(err);
  };

  // --- HANDLERS ---

  const handleGuestTry = () => {
    const used = parseInt(localStorage.getItem('cortexa_guest_count') || '0');
    if (used >= GUEST_MESSAGE_LIMIT) {
      alert("Guest limit reached on this device. Please Log In.");
      setShowAuthModal(true);
    } else {
      setShowLanding(false);
      setIsGuestMode(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessages([]);
    setIsGuestMode(false);
    setShowLanding(true);
  };

  const handleSendMessage = async (text: string) => {
    // --- GUEST LOGIC ---
    if (isGuestMode && !session) {
      if (guestCount >= GUEST_MESSAGE_LIMIT) {
        setShowAuthModal(true); // ৫টার বেশি হলে লগইন পেজ আসবে
        return;
      }
      // গেস্ট কাউন্ট বাড়ানো
      const newCount = guestCount + 1;
      setGuestCount(newCount);
      localStorage.setItem('cortexa_guest_count', newCount.toString());
    }

    // --- MEMBER LIMIT LOGIC ---
    if (session?.user) {
      const currentTier = userProfile?.subscription_tier || 'free';
      const teamSize = userProfile?.team_size || 1;
      const checkType = selectedAttachment ? 'image' : 'message';
      const hasLimit = await checkAndIncrementLimit(session.user.id, currentTier, teamSize, checkType);
      
      if (!hasLimit) {
        setShowLimitModal(true);
        return;
      }
    }

    // --- SEND MESSAGE ---
    const attachmentToSend = selectedAttachment;
    setSelectedAttachment(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
      attachment: attachmentToSend || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    const thinkingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: thinkingId,
      role: 'model',
      text: 'Analyzing...',
      timestamp: Date.now(),
      isThinking: true
    }]);

    try {
      // গেস্টদের জন্য ডিফল্ট 'free' এবং 'Guest' রোল
      const tier = session ? (userProfile?.subscription_tier || 'free') : 'free';
      const role = session ? (userProfile?.role || 'Guest') : 'Guest';

      const response = await sendMessageToCortexa(
        userMsg.text,
        'General',
        'South Asia',
        role as any,
        tier as any,
        attachmentToSend || undefined
      );

      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { ...msg, text: response.text, isThinking: false, groundingMetadata: response.groundingMetadata }
          : msg
      ));
      
      if (session) fetchUserProfile(session.user.id);

    } catch (error: any) {
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId ? { ...msg, text: "⚠️ Error connecting to CORTEXA.", isThinking: false } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // --- RENDER FLOW ---

  // 1. Show Landing Page if not logged in AND not in Guest Mode
  if (!session && showLanding && !isGuestMode) {
    return (
      <>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-50"
              >
                <X size={24} />
              </button>
              <AuthScreen /> 
            </div>
          </div>
        )}
        <LandingPage 
          onLoginClick={() => setShowAuthModal(true)} 
          onGuestTry={handleGuestTry}
          guestUsed={guestCount >= GUEST_MESSAGE_LIMIT}
        />
      </>
    );
  }

  // 2. Chat Interface (Logged In OR Guest Mode)
  return (
    <>
      {/* POPUP AUTH MODAL (For Guests reaching limit) */}
      {(!session && showAuthModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md">
            {/* গেস্টদের জন্য ক্রস বাটন থাকবে, কিন্তু লিমিট শেষ হলে তারা আটকা পড়বে */}
            {guestCount < GUEST_MESSAGE_LIMIT && (
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-50">
                <X size={24} />
              </button>
            )}
            <AuthScreen /> 
          </div>
        </div>
      )}

      {showLimitModal && <LimitModal onClose={() => setShowLimitModal(false)} onUpgrade={() => alert("Upgrade Plan")} />}
      {showOnboarding && session && <OnboardingModal userId={session.user.id} onComplete={() => { setShowOnboarding(false); fetchUserProfile(session.user.id); }} />}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} onProfileUpdate={() => session && fetchUserProfile(session.user.id)} userProfile={userProfile} />}

      <input type="file" ref={fileInputRef} id="file-input" accept="image/*,video/*,application/pdf" style={{ display: 'none' }} onChange={(e) => { /* Reuse logic */ }} />

      {/* HEADER */}
      <header className="fixed top-0 w-full h-16 bg-[#131314] flex items-center px-4 z-40 border-b border-[#333] justify-between lg:justify-start">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 lg:hidden"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
          <div className="flex items-center gap-2">
            <CortexaLogo size={32} />
            <span className="text-xl font-medium text-gray-300">CORTEXA</span>
            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
              {session ? (userProfile?.subscription_tier?.toUpperCase() || 'FREE') : 'GUEST'}
            </span>
          </div>
        </div>
        {!session && (
          <button onClick={() => setShowAuthModal(true)} className="text-sm bg-blue-600 px-4 py-1.5 rounded-full text-white hover:bg-blue-500">
            Log In
          </button>
        )}
      </header>

      <Sidebar isOpen={isSidebarOpen} onNewChat={() => setMessages([])} userProfile={userProfile} onOpenSettings={() => setIsSettingsOpen(true)} onLogout={handleLogout} />

      <div className={`pt-16 h-screen bg-[#131314] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[280px]' : ''}`}>
        <div className="flex-1 overflow-y-auto p-4 md:px-[10%] pb-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center">
              <h1 className="text-4xl font-bold text-gray-700 mb-2">How can I help you?</h1>
            </div>
          ) : (
            messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-[#131314] pt-2 pb-6 px-4 border-t border-[#333]/30">
           {/* Attachment Preview Here (Reuse previous code) */}
           <ChatInput 
             onSend={handleSendMessage} 
             onAttachImage={() => fileInputRef.current?.click()} 
             isLoading={isLoading} 
             // গেস্ট লিমিট শেষ হলে ইনপুট ডিজেবল করে দেয়া যায়, অথবা মডাল তো আসবেই
             disabled={isGuestMode && guestCount >= GUEST_MESSAGE_LIMIT}
             chatMode={'standard'}
             onModeChange={() => {}}
           />
           {isGuestMode && (
             <div className="text-center mt-2 text-xs text-gray-500">
               Guest Mode: {guestCount}/{GUEST_MESSAGE_LIMIT} messages used.
             </div>
           )}
        </div>
      </div>
    </>
  );
}
