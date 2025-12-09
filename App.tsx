import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { X, Video as VideoIcon, FileText } from 'lucide-react';

// COMPONENTS
import { Sidebar } from './Sidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput'; 
import { LimitModal } from './LimitModal'; 
import { CortexaLogo } from './CortexaLogo'; 
import { AuthScreen } from './AuthScreen';
import { LandingPage } from './LandingPage';
import { OnboardingModal } from './OnboardingModal';
import { SettingsModal } from './SettingsModal';
import { PricingModal } from './PricingModal'; 
import { CoursesView } from './CoursesView';
import { CoursePaymentModal } from './CoursePaymentModal'; 
import { sendMessageToCortexa } from './gemini';

// SERVICES
import { checkAndIncrementLimit } from './usageService';
import { validateFile, compressImage, fileToBase64 } from './utils';
import { Message, UserProfile, Attachment } from './types';
import { Course } from './courses';

const GUEST_MESSAGE_LIMIT = 5;

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // UI States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [guestCount, setGuestCount] = useState(0);

  // VIEW & COURSE STATE
  const [currentView, setCurrentView] = useState<'chat' | 'courses'>('chat'); 
  const [activeCourse, setActiveCourse] = useState<Course | null>(null); 
  const [pendingCourse, setPendingCourse] = useState<Course | null>(null); 

  // Modals
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showCoursePayment, setShowCoursePayment] = useState(false); 

  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedGuestCount = localStorage.getItem('cortexa_guest_count');
    if (savedGuestCount) setGuestCount(parseInt(savedGuestCount));

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setShowLanding(false);
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setShowLanding(false);
        setShowAuthModal(false);
        fetchUserProfile(session.user.id);
      } else {
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
      } else {
        setShowOnboarding(true);
      }
    } catch (err) {
      console.error(err); // ✅ FIXED: Added curly braces here
    }
  };

  const handleGuestTry = () => {
    const used = parseInt(localStorage.getItem('cortexa_guest_count') || '0');
    if (used >= GUEST_MESSAGE_LIMIT) {
      alert("Guest limit reached. Please Log In.");
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
    setCurrentView('chat');
    setActiveCourse(null);
  };

  // COURSE SECURITY LOCK LOGIC
  const handleCourseSelect = (course: Course) => {
    if (!userProfile) return;

    const isEnrolled = userProfile.enrolled_courses?.includes(course.id);

    if (isEnrolled) {
      setActiveCourse(course);
      setCurrentView('chat'); 
      setMessages([{
        id: 'system-welcome',
        role: 'model',
        text: `Welcome back to **${course.title}**! 🎓\n\nI am ready. Let's continue your training.`,
        timestamp: Date.now()
      }]);
    } else {
      setPendingCourse(course);
      setShowCoursePayment(true);
    }
  };

  // HANDLE MANUAL PAYMENT SUBMISSION
  const handlePaymentSubmit = async (trxId: string, method: string) => {
    alert(`Payment Request Submitted!\n\nTrxID: ${trxId}\nMethod: ${method}\n\nPlease wait for Admin Approval (Up to 24h).`);
    setShowCoursePayment(false);
    setPendingCourse(null);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const currentTier = userProfile?.subscription_tier || 'free';
    const validation = validateFile(file, currentTier);
    if (!validation.valid) { alert(validation.error); event.target.value = ''; return; }
    try {
      let data = '', type: any = 'image';
      if (file.type.startsWith('image')) { data = await compressImage(file); type = 'image'; }
      else if (file.type.startsWith('video')) { data = await fileToBase64(file); type = 'video'; }
      else { data = await fileToBase64(file); type = 'document'; }
      setSelectedAttachment({ type, mimeType: file.type, data, name: file.name });
    } catch (err) { alert("File processing error."); }
    event.target.value = ''; 
  };

  const handleSendMessage = async (text: string) => {
    if (isGuestMode && !session) {
      if (guestCount >= GUEST_MESSAGE_LIMIT) { setShowAuthModal(true); return; }
      const newCount = guestCount + 1;
      setGuestCount(newCount);
      localStorage.setItem('cortexa_guest_count', newCount.toString());
    }
    if (session?.user) {
      const currentTier = userProfile?.subscription_tier || 'free';
      const teamSize = userProfile?.team_size || 1;
      const checkType = selectedAttachment ? 'image' : 'message';
      const hasLimit = await checkAndIncrementLimit(session.user.id, currentTier, teamSize, checkType);
      if (!hasLimit) { setShowLimitModal(true); return; }
    }
    
    const attachmentToSend = selectedAttachment;
    setSelectedAttachment(null);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now(), attachment: attachmentToSend || undefined };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    const thinkingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: thinkingId, role: 'model', text: 'Analyzing...', timestamp: Date.now(), isThinking: true }]);
    
    try {
      const tier = session ? (userProfile?.subscription_tier || 'free') : 'free';
      const role = session ? (userProfile?.role || 'Guest') : 'Guest';
      
      const response = await sendMessageToCortexa(
        userMsg.text, 
        'General', 
        'South Asia', 
        role as any, 
        tier as any, 
        attachmentToSend || undefined,
        activeCourse?.systemPrompt 
      );
      
      setMessages(prev => prev.map(msg => msg.id === thinkingId ? { ...msg, text: response.text, isThinking: false, groundingMetadata: response.groundingMetadata } : msg));
      if (session) fetchUserProfile(session.user.id);
    } catch (error: any) {
      setMessages(prev => prev.map(msg => msg.id === thinkingId ? { ...msg, text: "⚠️ Error connecting to CORTEXA.", isThinking: false } : msg));
    } finally { setIsLoading(false); }
  };

  // --- RENDER ---
  if (!session && showLanding && !isGuestMode) {
    return (
      <>
        {showAuthModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"><div className="relative w-full max-w-md"><button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 z-50"><X size={24} /></button><AuthScreen /></div></div>}
        <LandingPage onLoginClick={() => setShowAuthModal(true)} onGuestTry={handleGuestTry} guestUsed={guestCount >= GUEST_MESSAGE_LIMIT} />
      </>
    );
  }

  return (
    <>
      {(!session && showAuthModal) && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"><div className="relative w-full max-w-md">{guestCount < GUEST_MESSAGE_LIMIT && <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 z-50"><X size={24} /></button>}<AuthScreen /></div></div>}
      
      {showLimitModal && <LimitModal onClose={() => setShowLimitModal(false)} onUpgrade={() => { setShowLimitModal(false); setShowPricingModal(true); }} />}
      {showPricingModal && <PricingModal onClose={() => setShowPricingModal(false)} currentTier={userProfile?.subscription_tier} />}
      
      {showCoursePayment && pendingCourse && session?.user && (
        <CoursePaymentModal 
          course={pendingCourse} 
          userId={session.user.id}
          onClose={() => setShowCoursePayment(false)} 
          onSubmit={handlePaymentSubmit} 
        />
      )}

      {showOnboarding && session && <OnboardingModal userId={session.user.id} onComplete={() => { setShowOnboarding(false); fetchUserProfile(session.user.id); }} />}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} onProfileUpdate={() => session && fetchUserProfile(session.user.id)} userProfile={userProfile} />}

      <input type="file" ref={fileInputRef} id="file-input" accept="image/*,video/*,application/pdf" style={{ display: 'none' }} onChange={handleFileSelect} />

      <header className="fixed top-0 w-full h-16 bg-[#131314] flex items-center px-4 z-40 border-b border-[#333] justify-between lg:justify-start">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-400 lg:hidden"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
          <div className="flex items-center gap-2">
            <CortexaLogo size={32} />
            <span className="text-xl font-medium text-gray-300">CORTEXA</span>
            
            {activeCourse ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-900/30 border border-blue-800 rounded-full">
                 <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                 <span className="text-xs text-blue-300 truncate max-w-[150px]">{activeCourse.title}</span>
                 <button onClick={() => { setActiveCourse(null); setMessages([]); }} className="text-gray-400 hover:text-white"><X size={12}/></button>
              </div>
            ) : (
              <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                {session ? (userProfile?.subscription_tier?.toUpperCase() || 'FREE') : 'GUEST'}
              </span>
            )}
          </div>
        </div>
        {!session && <button onClick={() => setShowAuthModal(true)} className="text-sm bg-blue-600 px-4 py-1.5 rounded-full text-white hover:bg-blue-500">Log In</button>}
      </header>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onNewChat={() => { setMessages([]); setCurrentView('chat'); setActiveCourse(null); }} 
        userProfile={userProfile} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onLogout={handleLogout}
        onOpenPricing={() => setShowPricingModal(true)} 
        currentView={currentView} 
        onViewChange={setCurrentView} 
      />

      <div className={`pt-16 h-screen bg-[#131314] flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[280px]' : ''}`}>
        
        {currentView === 'courses' ? (
          <CoursesView onCourseSelect={handleCourseSelect} /> 
        ) : (
          <>
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
               {selectedAttachment && (
                <div className="max-w-[800px] mx-auto mb-2 relative inline-flex items-center gap-3 bg-gray-800/50 p-2 rounded border border-gray-700">
                  {selectedAttachment.type === 'image' ? <img src={selectedAttachment.data} className="h-12 w-12 object-cover rounded" /> : selectedAttachment.type === 'video' ? <div className="h-12 w-12 bg-gray-900 rounded text-blue-400 flex items-center justify-center"><VideoIcon size={24}/></div> : <div className="h-12 w-12 bg-gray-900 rounded text-green-400 flex items-center justify-center"><FileText size={24}/></div>}
                  <span className="text-sm text-gray-200 truncate max-w-[200px]">{selectedAttachment.name}</span>
                  <button onClick={() => setSelectedAttachment(null)} className="bg-gray-700 rounded-full p-1 ml-2"><X size={14} className="text-gray-300" /></button>
                </div>
               )}
               <ChatInput onSend={handleSendMessage} onAttachImage={() => fileInputRef.current?.click()} isLoading={isLoading} disabled={isGuestMode && guestCount >= GUEST_MESSAGE_LIMIT} chatMode={'standard'} onModeChange={() => {}} />
               {isGuestMode && <div className="text-center mt-2 text-xs text-gray-500">Guest Mode: {guestCount}/{GUEST_MESSAGE_LIMIT} messages used.</div>}
            </div>
          </>
        )}
      </div>
    </>
  );
}
