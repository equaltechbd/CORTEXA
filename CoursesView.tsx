import React from 'react';
import { COURSES } from './courses'; // আমরা যে courses.ts ফাইল বানিয়েছি, সেখান থেকে ডাটা আনবে
import { BookOpen, Clock, Award, ShieldCheck, CheckCircle } from 'lucide-react';

export const CoursesView: React.FC = () => {
  
  const handleEnroll = (courseTitle: string) => {
    // ভবিষ্যতে এখানে পেমেন্ট গেটওয়ে বা এনরোলমেন্ট লজিক বসবে
    alert(`You are interested in "${courseTitle}". \nPayment Gateway integration is the next step!`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#131314] p-4 md:p-8">
      
      {/* HEADER SECTION */}
      <div className="max-w-6xl mx-auto mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
          <BookOpen className="text-blue-500" size={32} />
          CORTEXA Academy
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto md:mx-0">
          Master technical skills with your personal AI Instructor. 
          Step-by-step guidance, real-world tasks, and strict validation.
        </p>
      </div>

      {/* COURSES GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {COURSES.map((course) => (
          <div 
            key={course.id} 
            className="bg-[#1E1F20] border border-gray-800 rounded-2xl p-6 flex flex-col hover:border-gray-600 transition-all duration-300 group"
          >
            {/* LEVEL BADGE */}
            <div className="flex justify-between items-start mb-4">
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${
                course.level === 'Beginner' ? 'bg-green-900/30 text-green-400 border-green-800' :
                course.level === 'Advanced' ? 'bg-red-900/30 text-red-400 border-red-800' :
                'bg-blue-900/30 text-blue-400 border-blue-800'
              }`}>
                {course.level}
              </span>
              <Award size={20} className="text-gray-600 group-hover:text-yellow-500 transition-colors" />
            </div>

            {/* TITLE & DESC */}
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-gray-400 mb-6 line-clamp-3 flex-1">
              {course.description}
            </p>

            {/* META INFO */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Clock size={14} className="text-gray-500" />
                <span>Duration: <strong className="text-white">{course.duration}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <ShieldCheck size={14} className="text-gray-500" />
                <span>Validity: <strong className="text-white">{course.validity}</strong></span>
              </div>
            </div>

            {/* FOOTER & PRICE */}
            <div className="mt-auto pt-4 border-t border-gray-700 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block">Course Fee</span>
                <span className="text-xl font-bold text-white">{course.price}</span>
              </div>
              <button 
                onClick={() => handleEnroll(course.title)}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                Enroll <CheckCircle size={14} />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
