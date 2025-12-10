import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Loader2, Check } from 'lucide-react';
import { Course } from './courses';
import { supabase } from './supabaseClient';

interface CoursePaymentModalProps {
  course: Course;
  userId: string;
  onClose: () => void;
  // onSubmit টি এখন আর ম্যানুয়াল নয়, তাই অপশনাল বা রিমুভ করা যেতে পারে, 
  // তবে টাইপস্ক্রিপ্ট এরর এড়াতে আমরা এটি রাখছি না।
  onSubmit?: (trxId: string, method: string) => void; 
}

export const CoursePaymentModal: React.FC<CoursePaymentModalProps> = ({ course, userId, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // 1. Call Backend Function (Stripe)
      // নোট: এই ফাংশনটি সুপাবেশ এজ ফাংশনে ডিপ্লয় থাকতে হবে।
      // আপাতত ফ্রন্টএন্ড এরর এড়াতে আমরা একটি ডামি অ্যালার্ট দিচ্ছি।
      
      /* // REAL CODE (যখন ব্যাকএন্ড রেডি হবে):
      const { data, error } = await supabase.functions.invoke('payment-process', {
        body: {
          courseId: course.id,
          userId: userId,
          price: parseFloat(course.priceUsd.replace('$', '')),
          courseName: course.title,
        },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url; 
      */

      // DEMO ALERT (যাতে অ্যাপ ক্র্যাশ না করে)
      alert("Payment System Integration Pending.\n\nBackend function 'payment-process' needs to be deployed to Supabase.");
      
    } catch (err) {
      console.error("Payment Error:", err);
      alert("Payment initialization failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Icon Component
  const CheckIcon = () => (
    <div className="bg-green-900/30 p-1 rounded-full text-green-400">
      <Check size={12} strokeWidth={3} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md bg-[#1E1F20] rounded-2xl border border-gray-700 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-[#131314]">
          <div>
            <h2 className="text-xl font-bold text-white">Secure Checkout 🔒</h2>
            <p className="text-sm text-gray-400">Unlock {course.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full text-gray-400"><X size={20}/></button>
        </div>

        {/* Amount */}
        <div className="p-8 text-center">
          <p className="text-gray-400 text-sm mb-2">Total Payable</p>
          <h1 className="text-5xl font-bold text-white tracking-tight">{course.priceUsd}</h1>
          <p className="text-sm text-gray-500 mt-2">or approx {course.priceBdt}</p>
        </div>

        {/* Benefits */}
        <div className="px-8 pb-6 space-y-3">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <CheckIcon /> <span>Instant Access to all lessons</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <CheckIcon /> <span>AI Instructor & Validation</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <CheckIcon /> <span>{course.validity}</span>
          </div>
        </div>

        {/* Pay Button */}
        <div className="p-6 pt-2">
          <button 
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-blue-900/50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (
              <>
                <CreditCard size={20} />
                Pay with Card / Stripe
              </>
            )}
          </button>
          
          <div className="mt-4 flex justify-center items-center gap-2 text-[10px] text-gray-500">
            <ShieldCheck size={12} />
            <span>Secured by Stripe SSL Encryption</span>
          </div>
        </div>

      </div>
    </div>
  );
};
