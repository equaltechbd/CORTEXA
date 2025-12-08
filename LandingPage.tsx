import React from 'react';
import { CortexaLogo } from './CortexaLogo';
import { ArrowRight, Lock, Zap, BookOpen } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onGuestTry: () => void;
  guestUsed: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onGuestTry, guestUsed }) => {
  return (
    <div className="min-h-screen bg-[#131314] text-white flex flex-col">
      
      {/* NAVBAR (ChatGPT Style) */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <CortexaLogo size={28} />
          <span className="font-bold text-xl tracking-tight">CORTEXA</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm text-gray-300 font-medium">
          <a href="#" className="hover:text-white">Features</a>
          <a href="#" className="hover:text-white">Pricing</a>
          <a href="#" className="hover:text-white">Academy</a>
          <a href="#" className="hover:text-white">About</a>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onLoginClick}
            className="px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            Log in
          </button>
          <button 
            onClick={onLoginClick} // Sign up also opens Auth Modal for now
            className="px-4 py-2 text-sm font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign up
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-[-60px]">
        <div className="mb-6 animate-pulse">
          <CortexaLogo size={80} particleCount={50} />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
          The Ultimate Tech Assistant
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10">
          Diagnose, repair, and learn with AI. Your personal expert for electronics, software, and engineering problems.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
          
          {/* Guest Button (Disable if already used) */}
          <button
            onClick={onGuestTry}
            disabled={guestUsed}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg transition-all ${
              guestUsed 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                : 'bg-white text-black hover:bg-gray-200 hover:scale-105'
            }`}
          >
            {guestUsed ? "Guest Limit Reached" : "Start Guest Trial"}
            {!guestUsed && <ArrowRight size={20} />}
          </button>

          <button
            onClick={onLoginClick}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg border border-gray-600 hover:bg-gray-800 transition-all"
          >
            Log in to Account
          </button>
        </div>

        {/* Disclaimer for Guest */}
        {guestUsed && (
          <p className="mt-4 text-sm text-red-400">
            You've used your free guest messages on this device. <br/> Please log in to continue solving problems.
          </p>
        )}

        {/* FEATURES GRID (Bottom) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl text-left">
          <div className="p-6 rounded-xl bg-[#1E1F20] border border-gray-800">
            <Zap className="text-yellow-400 mb-3" />
            <h3 className="font-bold text-lg mb-2">Instant Diagnosis</h3>
            <p className="text-gray-400 text-sm">Upload photos of circuit boards or describe issues for immediate solutions.</p>
          </div>
          <div className="p-6 rounded-xl bg-[#1E1F20] border border-gray-800">
            <Lock className="text-blue-400 mb-3" />
            <h3 className="font-bold text-lg mb-2">Professional Grade</h3>
            <p className="text-gray-400 text-sm">Tailored for technicians, engineers, and shop owners with schematic support.</p>
          </div>
          <div className="p-6 rounded-xl bg-[#1E1F20] border border-gray-800">
            <BookOpen className="text-green-400 mb-3" />
            <h3 className="font-bold text-lg mb-2">Learn & Grow</h3>
            <p className="text-gray-400 text-sm">Step-by-step guidance for students and beginners to master skills.</p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-6 text-center text-gray-600 text-sm">
        © 2025 CORTEXA AI. Equal Tech.
      </footer>
    </div>
  );
};
