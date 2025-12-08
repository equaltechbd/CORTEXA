import { SubscriptionTier } from './types';
import { SUBSCRIPTION_LIMITS } from './constants';

// ১. ফাইল ভ্যালিডেশন (সাবস্ক্রিপশন অনুযায়ী)
export const validateFile = (file: File, tier: SubscriptionTier) => {
  const limits = SUBSCRIPTION_LIMITS[tier];
  const type = file.type.split('/')[0]; // 'image', 'video', 'application'(pdf)

  // ফ্রি ইউজারদের ভিডিও বা ফাইল চেক
  if (!limits.video_allowed && (type === 'video' || file.type.includes('pdf') || file.type.includes('document'))) {
    return { valid: false, error: "Upgrade to Basic or Pro to upload Videos & Documents!" };
  }

  // ভিডিও সাইজ চেক (৫০ এমবি লিমিট সবার জন্য, যাতে সার্ভার ক্র্যাশ না করে)
  if (type === 'video' && file.size > 50 * 1024 * 1024) {
    return { valid: false, error: "Video size must be under 50MB." };
  }

  // ডকুমেন্ট সাইজ চেক (২০ এমবি)
  if (type !== 'image' && type !== 'video' && file.size > 20 * 1024 * 1024) {
    return { valid: false, error: "Document size must be under 20MB." };
  }

  return { valid: true };
};

// ২. ইমেজ কমপ্রেশন (ব্রাউজারেই সাইজ ছোট করে ফেলবে)
export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // ম্যাক্সিমাম সাইজ সেট করা (1080px)
        const maxWidth = 1080;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        
        // কোয়ালিটি ৮০% এ নামিয়ে আনা (JPEG)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// ৩. ফাইল টু Base64 কনভার্টার (ভিডিও/ডকের জন্য)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
