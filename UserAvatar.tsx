import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
  userProfile: any;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ userProfile }) => {
  // If user has a photo URL in profile (future feature), use it. For now, use Initials.
  const name = userProfile?.profile?.name || userProfile?.full_name || 'User';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg border border-white/10">
      <span className="text-white font-bold text-lg">{initial}</span>
    </div>
  );
};
