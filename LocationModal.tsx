import React from 'react';
import { UserLocation } from '../types';
import { MapPin, Globe2 } from 'lucide-react';

interface LocationModalProps {
  onSelect: (location: UserLocation) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ onSelect }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl shadow-black">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-500/30">
            <Globe2 className="text-teal-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Initialize System</h2>
          <p className="text-zinc-400">Select your physical region to calibrate voltage rules, marketplaces, and linguistic protocols.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onSelect('South Asia')}
            className="group relative p-6 bg-zinc-800/50 hover:bg-teal-900/20 border border-zinc-700 hover:border-teal-500/50 rounded-xl transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="text-amber-500" size={20} />
              <span className="font-bold text-zinc-100">South Asia</span>
            </div>
            <p className="text-xs text-zinc-500 group-hover:text-zinc-300">
              Bangladesh, India, Pakistan. 
              <br/>Includes 220V/50Hz logic & local market sourcing.
            </p>
          </button>

          <button
             onClick={() => onSelect('Global')}
             className="group relative p-6 bg-zinc-800/50 hover:bg-indigo-900/20 border border-zinc-700 hover:border-indigo-500/50 rounded-xl transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <Globe2 className="text-indigo-400" size={20} />
              <span className="font-bold text-zinc-100">Global / Western</span>
            </div>
            <p className="text-xs text-zinc-500 group-hover:text-zinc-300">
              USA, Europe, RoW. 
              <br/>Standard ANSI/ISO protocols & global suppliers.
            </p>
          </button>
        </div>
        
        <div className="mt-8 text-center">
           <p className="text-[10px] text-zinc-600 font-mono">CORTEXA v1.0 • GEO-LOGIC MATRIX</p>
        </div>
      </div>
    </div>
  );
};
