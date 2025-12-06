
import Sidebar from './Sidebar';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput'; 
import { LimitModal } from './components/LimitModal'; 
import { CortexaLogo } from './components/CortexaLogo'; 
import { AuthScreen } from './components/AuthScreen';
import { sendMessageToCortexa } from './services/gemini';
import { checkDailyLimits, incrementUsage } from './services/usageService'; 
import { supabase } from './services/supabaseClient';
import { Message, ChatMode } from './types';
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
  const [showIntro, setShowIntro] = useState(true);

  // File Upload State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Context
  const [location] = useState('South Asia');
  const role = 'Verified_Pro'; // In real app, fetch from user profile

  // --- AUTH INITIALIZATION ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- EFFECTS ---

  // Handle Intro Splash
  useEffect(() => {
    if (session) {
      const timer = setTimeout(() => setShowIntro(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [session]);

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

    // 1. CHECK LIMITS BEFORE PROCESSING
    try {
      const isImage = !!selectedImage;
      await checkDailyLimits(session.user.id, isImage);
    } catch (error: any) {
      if (error.message === 'Daily_Limit_Reached') {
        setShowLimitModal(true);
        return; // STOP execution
      }
    }

    // 2. PROCEED IF WITHIN LIMITS
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    // Clear inputs immediately
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
        chatMode,
        location as any,
        role,
        imageToSend || undefined
      );

      // 3. INCREMENT USAGE ON SUCCESS
      await incrementUsage(session.user.id, !!imageToSend);

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
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingId 
          ? { ...msg, text: "Connection interrupted. Please retry.", isThinking: false }
          : msg
      ));
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
      {/* Intro Splash Screen */}
      {showIntro && (
        <div className="intro-overlay">
          <CortexaLogo size={200} particleCount={250} />
        </div>
      )}

      {/* Limit Modal */}
      {showLimitModal && (
        <LimitModal 
          onClose={() => setShowLimitModal(false)} 
          onUpgrade={() => {
            alert("Redirecting to Payment Gateway...");
            setShowLimitModal(false);
          }} 
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

      {/* --- HEADER --- */}
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

        <div className="right-section flex items-center gap-3">
          <button 
            onClick={handleLogout}
            className="text-xs text-[#c4c7c5] hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-[#28292a] transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
          <div className="user-avatar">
            {session.user.email ? session.user.email[0].toUpperCase() : 'U'}
          </div>
        </div>
      </header>

      {/* --- SIDEBAR --- */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onNewChat={() => setMessages([])} 
      />

      {/* --- MAIN CHAT AREA --- */}
      <div className={`main-container ${isSidebarOpen ? 'sidebar-visible' : ''}`}>
        
        {/* Mode Selector */}
        <div className="absolute top-4 left-0 w-full flex justify-center z-10 px-4">
          <div className="flex bg-[#1e1f20] p-1 rounded-full border border-[#444746]">
             {(['standard', 'fast', 'deep_think', 'search'] as ChatMode[]).map(mode => (
               <button
                 key={mode}
                 onClick={() => setChatMode(mode)}
                 className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                   chatMode === mode 
                     ? 'bg-[#28292a] text-[#e3e3e3] shadow-sm' 
                     : 'text-[#c4c7c5] hover:text-[#e3e3e3]'
                 }`}
               >
                 {mode === 'deep_think' ? 'Deep Scan' : mode.charAt(0).toUpperCase() + mode.slice(1)}
               </button>
             ))}
          </div>
        </div>
        
        {/* Greeting (Empty State) */}
        {messages.length === 0 && (
          <div className="greeting-area">
            <h1 className="gradient-text">Hi, {session.user.email?.split('@')[0]}</h1>
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
             disabled={showLimitModal} // Disable input if limit reached
          />
        </div>

      </div>
    </>
  );
}
