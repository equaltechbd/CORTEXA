import React, { useState } from 'react';
import { supabase } from './supabaseClient';

interface OnboardingModalProps {
  userId: string;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ userId, onComplete }) => {
  const [role, setRole] = useState('Student');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const updates = {
      id: userId,
      role: 'Guest', // Default system role
      occupation: role,
      full_name: 'New User',
      updated_at: new Date(),
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    setLoading(false);
    
    if (!error) {
      onComplete();
    } else {
      console.error(error);
      alert("Failed to save profile.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="bg-[#1e1f20] p-8 rounded-2xl max-w-md w-full border border-blue-500/30 shadow-2xl text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to CORTEXA</h2>
        <p className="text-gray-400 mb-6">Please tell us a bit about yourself to verify your identity.</p>
        
        <div className="text-left mb-4">
          <label className="text-sm text-gray-300">I am a...</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full mt-2 p-3 bg-[#131314] border border-[#333] rounded-lg text-white outline-none focus:border-blue-500"
          >
            <option value="Student">Student</option>
            <option value="Technician">Professional Technician</option>
            <option value="Shop Owner">Shop Owner</option>
            <option value="Hobbyist">DIY Hobbyist</option>
          </select>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
        >
          {loading ? 'Setting up...' : 'Get Started'}
        </button>
      </div>
    </div>
  );
};
