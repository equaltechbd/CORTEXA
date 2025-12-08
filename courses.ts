export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string; 
  validity: string; 
  priceBdt: string; // বাংলাদেশী টাকা
  priceUsd: string; // গ্লোবাল ডলার
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Zero to Hero';
  requiredTools: string[];
  systemPrompt: string; 
}

export const COURSES: Course[] = [
  {
    id: 'mobile-hardware-101',
    title: 'Mobile Hardware Repair (Beginner to Mid)',
    description: 'Start from zero. Learn disassembly, component identification, battery/screen replacement, and basic diagnostics.',
    duration: '60 Days', 
    validity: '90 Days Access',
    priceBdt: '৳2,000',
    priceUsd: '$25', // গ্লোবাল প্রাইস
    level: 'Beginner',
    requiredTools: ['Precision Screwdriver Set', 'Digital Multimeter', 'Pry Tools/Opening Picks', 'Tweezers (Curved & Straight)', 'Soldering Iron (Variable Temp)'],
    systemPrompt: `You are an expert Multilingual Mobile Repair Instructor.
    
    GLOBAL INSTRUCTION PROTOCOL:
    1. **LANGUAGE ADAPTABILITY:** DETECT the user's language immediately. If they speak English, teach in English. If Bangla, teach in Bangla. If Spanish, teach in Spanish.
    2. **COURSE PACE:** Use the 60-day duration to teach deeply. Start with fundamentals like Voltage/Amps before touching screws.
    3. **DAILY QUIZ:** Always verify previous knowledge before starting a new lesson.
    4. **TASK VALIDATION:** Demand clear photos of their workbench and repair steps.
    5. **SAFETY:** Warn about battery safety standards (Global safety protocols).`
  },
  {
    id: 'chip-level-repair',
    title: 'Advanced Chip Level Repair (Mid to Pro)',
    description: 'Master micro-soldering, schematic reading, IC reballing (PMIC/CPU), and short-circuit tracing.',
    duration: '45 Days',
    validity: '90 Days Access',
    priceBdt: '৳4,000',
    priceUsd: '$50',
    level: 'Advanced',
    requiredTools: ['Stereo Microscope', 'SMD Rework Station (Hot Air)', 'DC Power Supply (5A)', 'PCB Holder', 'Soldering Paste & Flux', 'Stencils', 'Multimeter'],
    systemPrompt: `You are a Senior Electronics Engineer & Chip-Level Expert.
    
    GLOBAL INSTRUCTION PROTOCOL:
    1. **LANGUAGE:** Teach in the user's preferred language fluently.
    2. **ADVANCED DIAGNOSIS:** Teach schematic reading using international symbols.
    3. **PRECISION TASKS:** Require microscope-view photos for validation.
    4. **STANDARD:** Teach IPC-7711/21 standards for reworking electronic assemblies.`
  },
  {
    id: 'laptop-motherboard',
    title: 'Laptop & Desktop Repair (Zero to Pro)',
    description: 'Complete motherboard diagnosis, BIOS flashing, RAM/Volt section logic, and No-Display solutions.',
    duration: '60 Days',
    validity: '90 Days Access',
    priceBdt: '৳3,000',
    priceUsd: '$40',
    level: 'Zero to Hero',
    requiredTools: ['Digital Multimeter', 'Bench Power Supply', 'BIOS Programmer (RT809F/CH341A)', 'Soldering Station', 'Desoldering Wick'],
    systemPrompt: `You are a Computer Hardware Specialist.
    
    GLOBAL INSTRUCTION PROTOCOL:
    1. **LANGUAGE:** Adapt to the user's language (English/Bangla/Hindi etc.).
    2. **LOGIC FLOW:** Teach Power Sequences for major global brands (Dell, HP, Lenovo, MacBook).
    3. **DIAGNOSIS:** Focus on "Volt Injection" methods safely.
    4. **TASK:** Verify impedance readings via photo proof.`
  },
  {
    id: 'software-masterclass',
    title: 'Software Unlocking Masterclass',
    description: 'Android FRP bypass, Flashing (Odin/Xiaomi), iOS Restore, and Driver troubleshooting.',
    duration: '30 Days',
    validity: '90 Days Access',
    priceBdt: '৳2,000',
    priceUsd: '$25',
    level: 'Intermediate',
    requiredTools: ['Windows PC/Laptop', 'High-Quality USB Data Cables', 'Stable Internet', 'Remote Tools (AnyDesk)'],
    systemPrompt: `You are a Global Software Unlocking Expert.
    
    GLOBAL INSTRUCTION PROTOCOL:
    1. **LANGUAGE:** Communicate clearly in the user's language.
    2. **DRIVER SETUP:** Ensure ADB/Fastboot/Qualcomm/MTK drivers are set up correctly on their OS.
    3. **TOOLS:** Teach generic/global tools first, then dongles.
    4. **SAFETY:** Warn about region-locking issues when flashing firmware.`
  },
  {
    id: 'inverter-ac-pcb',
    title: 'Inverter AC & PCB Repair',
    description: 'Industrial level repair for Inverter AC, Fridge PCBs, IPM testing, and Error Code solutions.',
    duration: '60 Days',
    validity: '90 Days Access',
    priceBdt: '৳3,000',
    priceUsd: '$40',
    level: 'Intermediate',
    requiredTools: ['Clamp Meter', 'Digital Multimeter', 'Series Test Lamp', 'Soldering Iron', 'Magnifying Glass'],
    systemPrompt: `You are an Industrial Electronics Trainer.
    
    GLOBAL INSTRUCTION PROTOCOL:
    1. **LANGUAGE:** Teach in the user's native language for better understanding.
    2. **SAFETY:** High Voltage (110V-240V) warnings must be prominent.
    3. **DIAGNOSIS:** Teach universal error code logic applicable to global brands (Samsung, LG, Daikin, General).
    4. **TASK:** Video proof required for voltage testing.`
  }
];
