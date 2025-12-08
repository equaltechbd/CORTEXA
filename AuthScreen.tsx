import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { CortexaLogo } from './CortexaLogo';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // --- SIGNUP LOGIC ---
        // 1. Validation
        if (!fullName.trim()) throw new Error("Full Name is required.");
        if (!birthDate) throw new Error("Date of Birth is required.");

        // 2. Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName, // মেটাডেটাতে নাম সেভ হবে
              birth_date: birthDate
            }
          }
        });
        if (error) throw error;
        
        // 3. Profile Update (Optional but recommended to sync immediately)
        if (data.user) {
           await supabase.from('profiles').upsert({
             id: data.user.id,
             full_name: fullName,
             // birth_date কলাম থাকলে এখানে পাঠাতে হবে
           });
        }

        setMessage("Check your email for the confirmation link!");
      }
    } catch (err: any) {
      setError(err.message);
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
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first to reset password.");
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin, // পাসওয়ার্ড রিসেট করে অ্যাপে ফিরে আসবে
      });
      if (error) throw error;
      setMessage("Password reset link sent to your email!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#131314] px-4">
      <div className="w-full max-w-md bg-[#1E1F20] p-8 rounded-2xl border border-gray-800 shadow-2xl">
        
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <CortexaLogo size={64} particleCount={60} />
          <h1 className="text-2xl font-bold text-white mt-4 tracking-wider">CORTEXA</h1>
          <p className="text-gray-400 text-sm mt-1">Advanced Technical Assistant</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* SIGNUP FIELDS (Name & DOB) */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#282A2C] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Date of Birth *</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-[#282A2C] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-all"
                  required
                />
              </div>
            </>
          )}

          {/* EMAIL */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="technician@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#282A2C] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-all"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#282A2C] text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-all pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* FORGOT PASSWORD LINK */}
          {isLogin && (
            <div className="flex justify-end">
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* ERROR / SUCCESS MESSAGES */}
          {error && <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 text-sm rounded-lg">{error}</div>}
          {message && <div className="p-3 bg-green-900/30 border border-green-800 text-green-300 text-sm rounded-lg">{message}</div>}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* DIVIDER */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-[#1E1F20] text-gray-500">Or continue with</span></div>
        </div>

        {/* GOOGLE LOGIN */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Google
        </button>

        {/* TOGGLE LOGIN/SIGNUP */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-blue-400 hover:text-blue-300 font-medium hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
