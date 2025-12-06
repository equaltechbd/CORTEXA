
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { CortexaLogo } from './CortexaLogo';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ text: 'Check your email for the confirmation link!', type: 'success' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setMessage({ text: error.message, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-4 text-[#e3e3e3] relative overflow-hidden font-sans">
      
      {/* Background Orbs for Premium Depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Glassmorphism Card */}
        <div 
          className="rounded-2xl p-8 animate-in fade-in zoom-in-95 duration-500"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)'
          }}
        >
          
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6 p-4 bg-white/5 rounded-full ring-1 ring-white/10 shadow-lg shadow-cyan-500/10">
              <CortexaLogo size={40} particleCount={50} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Welcome Back
            </h1>
            <p className="text-[#c4c7c5] text-sm mt-2 font-medium tracking-wide">
              {isSignUp ? 'Create your CORTEXA ID' : 'Login to access your workspace'}
            </p>
          </div>

          {/* PRIMARY ACTION: Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-black font-medium py-3 rounded-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 mb-6 shadow-lg shadow-black/20"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* DIVIDER */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-[#18181b] px-3 text-gray-500 rounded-full">Or continue with email</span>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#4F94CD] transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4F94CD]/50 focus:ring-1 focus:ring-[#4F94CD]/50 transition-all"
                  placeholder="name@example.com"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#4F94CD] transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#4F94CD]/50 focus:ring-1 focus:ring-[#4F94CD]/50 transition-all"
                  placeholder="Password"
                  minLength={6}
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 animate-in slide-in-from-top-2 ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                 <div className={`w-1.5 h-1.5 rounded-full ${message.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                 {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4F94CD] to-[#2C6688] hover:from-[#5aa0d9] hover:to-[#38789e] text-white font-semibold py-3 rounded-xl transition-all mt-2 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={18} className="opacity-75" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-sm text-[#c4c7c5]">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage(null);
                }}
                className="text-[#4F94CD] hover:text-[#78b3e3] font-semibold ml-1 transition-colors bg-transparent border-none cursor-pointer"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
        
        {/* Footer Credits */}
        <div className="text-center mt-6">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest font-medium">Powered by Equal Tech</p>
        </div>
      </div>
    </div>
  );
};
