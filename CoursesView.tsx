import React from 'react';
import { BookOpen } from 'lucide-react';

export const CoursesView: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
      <div className="bg-[#1E1F20] p-6 rounded-full mb-4">
        <BookOpen size={48} className="text-blue-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">CORTEXA Academy</h2>
      <p className="max-w-md">
        Professional repair courses, schematic reading guides, and certification programs are coming soon.
      </p>
    </div>
  );
};
