import React from 'react';
import { COURSES } from './courses';
import { BookOpen, Clock, Award, ShieldCheck, Lock, Wrench, CheckCircle } from 'lucide-react';

export const CoursesView: React.FC = () => {
  
  const handleEnroll = (course: any) => {
    // এখানে পরবর্তীতে পেমেন্ট গেটওয়ে আসবে
    alert(`To unlock "${course.title}", you need to pay ${course.price}.\n\nValidity: ${course.validity}`);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#131314] p-4 md:p-8">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
          <BookOpen className="text-blue-500" size={32} />
          CORTEXA Academy
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto md:mx-0">
          Professional training with AI Guidance. Courses are locked until purchased.
        </p>
      </div>

      {/* COURSES GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
        {COURSES.map((course) => (
          <div 
            key={course.id} 
            className="bg-[#1E1F20] border border-gray-800 rounded-2xl p-6 flex flex-col hover:border-gray-600 transition-all duration-300 group relative overflow-hidden"
          >
            {/* LOCK OVERLAY (Optional Visual Effect) */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Lock size={100} />
            </div>

            {/* LEVEL BADGE */}
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border ${
                course.level === 'Beginner' ? 'bg-green-900/30 text-green-400 border-green-800' :
                course.level.includes('Advanced') ? 'bg-red-900/30 text-red-400 border-red-800' :
                'bg-blue-900/30 text-blue-400 border-blue-800'
              }`}>
                {course.level}
              </span>
              <div className="bg-black/50 p-1.5 rounded-full border border-gray-700">
                <Lock size={16} className="text-gray-400" />
              </div>
            </div>

            {/* CONTENT */}
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">{course.title}</h3>
            <p className="text-sm text-gray-400 mb-4 relative z-10 line-clamp-2">
              {course.description}
            </p>

            {/* REQUIRED TOOLS (New Section) */}
            <div className="mb-4 bg-black/20 p-3 rounded-lg border border-gray-800 relative z-10">
              <div className="flex items-center gap-2 text-xs text-yellow-500 font-bold mb-2">
                <Wrench size={12} /> REQUIRED TOOLS
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {course.requiredTools.join(', ')}
              </p>
            </div>

            {/* META INFO */}
            <div className="space-y-2 mb-6 relative z-10">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Clock size={14} className="text-gray-500" />
                <span>Duration: <strong className="text-white">{course.duration}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <ShieldCheck size={14} className="text-gray-500" />
                <span>Validity: <strong className="text-white">{course.validity}</strong></span>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-auto pt-4 border-t border-gray-700 flex items-center justify-between relative z-10">
              <div>
                <span className="text-xs text-gray-500 block">Course Fee</span>
                <span className="text-xl font-bold text-white">{course.price}</span>
              </div>
              <button 
                onClick={() => handleEnroll(course)}
                className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                Unlock <Lock size={14} />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
