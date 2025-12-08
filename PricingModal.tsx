import React, { useState } from 'react';
import { X, Check, Zap, Users, Star, Briefcase } from 'lucide-react';

interface PricingModalProps {
  onClose: () => void;
  currentTier?: string;
}

export const PricingModal: React.FC<PricingModalProps> = ({ onClose, currentTier }) => {
  const [teamSize, setTeamSize] = useState(3);

  // Business Pricing Logic (1300 Taka per head instead of 1500)
  const businessPrice = 1300 * teamSize;
  const saving = (1500 * teamSize) - businessPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#131314] rounded-2xl border border-gray-800 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center sticky top-0 bg-[#131314] z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Upgrade your Diagnosis 🚀</h2>
            <p className="text-gray-400 text-sm">Choose the plan that fits your repair business.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* PLANS GRID */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. FREE PLAN */}
          <div className="border border-gray-700 rounded-xl p-6 bg-[#1E1F20] flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-300">Starter</h3>
              <div className="text-3xl font-bold text-white mt-2">Free</div>
              <p className="text-xs text-gray-500 mt-1">For students & hobbyists</p>
            </div>
            <ul className="space-y-3 text-sm text-gray-400 flex-1 mb-6">
              <li className="flex gap-2"><Check size={16} className="text-gray-500" /> 20 Messages / day</li>
              <li className="flex gap-2"><Check size={16} className="text-gray-500" /> 5 Low-Res Images</li>
              <li className="flex gap-2"><Check size={16} className="text-gray-500" /> 3 Days File Retention</li>
              <li className="flex gap-2 text-gray-600"><X size={16} /> No Video Uploads</li>
              <li className="flex gap-2 text-gray-600"><X size={16} /> No Live Search</li>
            </ul>
            <button disabled className="w-full py-2 rounded-lg border border-gray-600 text-gray-400 cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* 2. BASIC PLAN */}
          <div className="border border-blue-900/50 rounded-xl p-6 bg-[#1E1F20] flex flex-col relative overflow-hidden">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-blue-400">Basic / Go</h3>
              <div className="text-3xl font-bold text-white mt-2">৳500 <span className="text-sm font-normal text-gray-500">/mo</span></div>
              <p className="text-xs text-gray-500 mt-1">For new technicians</p>
            </div>
            <ul className="space-y-3 text-sm text-gray-300 flex-1 mb-6">
              <li className="flex gap-2"><Check size={16} className="text-blue-400" /> 100 Messages / day</li>
              <li className="flex gap-2"><Check size={16} className="text-blue-400" /> 20 Images</li>
              <li className="flex gap-2"><Check size={16} className="text-blue-400" /> 3 Videos (1 min)</li>
              <li className="flex gap-2"><Check size={16} className="text-blue-400" /> 15 Days Retention</li>
              <li className="flex gap-2"><Check size={16} className="text-blue-400" /> Basic Search (5/day)</li>
            </ul>
            <button className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
              Get Basic
            </button>
          </div>

          {/* 3. PRO PLAN (Recommended) */}
          <div className="border-2 border-purple-500 rounded-xl p-6 bg-[#25202b] flex flex-col relative transform scale-105 shadow-2xl z-10">
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
              MOST POPULAR
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Star size={20} className="fill-purple-500 text-purple-500" />
                <h3 className="text-lg font-bold text-white">Pro Mechanic</h3>
              </div>
              <div className="text-3xl font-bold text-white mt-2">৳1,500 <span className="text-sm font-normal text-gray-400">/mo</span></div>
              <p className="text-xs text-gray-400 mt-1">For professional experts</p>
            </div>
            <ul className="space-y-3 text-sm text-white flex-1 mb-6">
              <li className="flex gap-2"><Check size={16} className="text-purple-400" /> <strong>Unlimited</strong> Messages*</li>
              <li className="flex gap-2"><Check size={16} className="text-purple-400" /> <strong>Unlimited</strong> Images</li>
              <li className="flex gap-2"><Check size={16} className="text-purple-400" /> 10 Videos (3 min)</li>
              <li className="flex gap-2"><Check size={16} className="text-purple-400" /> 30 Days Retention</li>
              <li className="flex gap-2"><Check size={16} className="text-purple-400" /> <strong>Google Search</strong> (20/day)</li>
              <li className="flex gap-2"><Check size={16} className="text-purple-400" /> Schematic Analysis</li>
            </ul>
            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg transition-transform active:scale-95">
              Upgrade to Pro
            </button>
          </div>

          {/* 4. BUSINESS PLAN (Dynamic) */}
          <div className="border border-yellow-600/50 rounded-xl p-6 bg-[#1E1F20] flex flex-col">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Briefcase size={20} className="text-yellow-500" />
                <h3 className="text-lg font-bold text-yellow-500">Business</h3>
              </div>
              
              {/* Dynamic Price Calculation */}
              <div className="text-3xl font-bold text-white mt-2">৳{businessPrice} <span className="text-sm font-normal text-gray-500">/mo</span></div>
              <p className="text-xs text-green-400 mt-1">You save ৳{saving} monthly!</p>
            </div>

            {/* Team Size Slider */}
            <div className="mb-6 bg-gray-800 p-3 rounded-lg">
              <label className="text-xs text-gray-400 block mb-2">Team Size: <strong className="text-white">{teamSize} Members</strong></label>
              <input 
                type="range" 
                min="2" 
                max="10" 
                value={teamSize} 
                onChange={(e) => setTeamSize(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>2</span>
                <span>10</span>
              </div>
            </div>

            <ul className="space-y-3 text-sm text-gray-300 flex-1 mb-6">
              <li className="flex gap-2"><Check size={16} className="text-yellow-500" /> All <strong>Pro Features</strong></li>
              <li className="flex gap-2"><Check size={16} className="text-yellow-500" /> {teamSize}x Limits</li>
              <li className="flex gap-2"><Check size={16} className="text-yellow-500" /> Centralized Billing</li>
              <li className="flex gap-2"><Check size={16} className="text-yellow-500" /> Priority Support</li>
            </ul>
            <button 
              className="w-full py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-medium transition-colors"
              onClick={() => alert(`Contact Sales for ${teamSize} members plan!`)}
            >
              Contact Sales
            </button>
          </div>

        </div>
        
        {/* FOOTER */}
        <div className="p-4 border-t border-gray-800 text-center bg-[#131314]">
          <p className="text-xs text-gray-500">
            *Unlimited usage is subject to fair use policy (500/day). Prices include VAT. 
            Secure payment via Bkash/Nagad coming soon.
          </p>
        </div>

      </div>
    </div>
  );
};
