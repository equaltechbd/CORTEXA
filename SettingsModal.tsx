import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { X, Save } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onProfileUpdate: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [occupation, setOccupation] = useState('');

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setFullName(data.full_name || '');
        setOccupation(data.occupation || '');
      }
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const updates = {
        id: user.id,
        full_name: fullName,
        occupation: occupation,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (!error) {
        onProfileUpdate();
        onClose();
        alert('Profile updated successfully!');
      } else {
        alert('Error updating profile!');
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1e1f20] border border-[#333] rounded-2xl p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-6">Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#131314] border border-[#333] rounded-lg p-3 text-white focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Occupation</label>
            <select 
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full bg-[#131314] border border-[#333] rounded-lg p-3 text-white focus:border-blue-500 outline-none"
            >
              <option value="">Select Role</option>
              <option value="Student">Student</option>
              <option value="Technician">Technician</option>
              <option value="Shop Owner">Shop Owner</option>
              <option value="Hobbyist">Hobbyist</option>
            </select>
          </div>
          
          <button 
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 mt-4 transition-colors"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
