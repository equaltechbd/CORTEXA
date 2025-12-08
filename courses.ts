export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string; 
  validity: string; 
  price: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Zero to Hero';
  requiredTools: string[]; // ✅ নতুন: কি কি যন্ত্রপাতি লাগবে
  systemPrompt: string; 
}

export const COURSES: Course[] = [
  {
    id: 'mobile-hardware-101',
    title: 'Mobile Hardware Repair (Beginner to Mid)',
    description: 'Start from zero. Learn disassembly, component identification, battery/screen replacement, and basic diagnostics.',
    duration: '60 Days', // বাড়িয়ে ৬০ দিন করা হয়েছে
    validity: '90 Days Access',
    price: '৳2,000',
    level: 'Beginner',
    requiredTools: ['Precision Screwdriver Set', 'Multimeter', 'Opening Picks/Pry Tools', 'Tweezers', 'Basic Soldering Iron'],
    systemPrompt: `You are an expert Mobile Repair Instructor. 
    YOUR STUDENT: A complete beginner.
    COURSE DURATION: Extended to 60 Days.
    
    INSTRUCTION STRATEGY:
    1. GO DEEP: Since we have 60 days, do not rush. Spend the first few days just on "Understanding the Multimeter" and "Current/Voltage Logic".
    2. DAILY QUIZ: Start every session by asking about the previous day's topic. Only proceed if they answer correctly.
    3. TASK VALIDATION: Ask for photos of their tools, their workspace, and every repair step.
    4. SAFETY: Strictly warn about battery punctures and static electricity.
    5. SCOPE: Focus on Hardware Basics. Do not discuss software or CPU reballing in this course.`
  },
  {
    id: 'chip-level-repair',
    title: 'Advanced Chip Level Repair (Mid to Pro)',
    description: 'Master micro-soldering, schematic reading, IC reballing (PMIC/CPU), and short-circuit tracing.',
    duration: '45 Days',
    validity: '90 Days Access',
    price: '৳4,000',
    level: 'Advanced',
    requiredTools: ['Microscope', 'Hot Air Gun (SMD Rework Station)', 'DC Power Supply', 'PCB Holder', 'Soldering Paste/Flux', 'Stencils', 'Multimeter'],
    systemPrompt: `You are a Senior Electronics Engineer & Chip-Level Expert.
    YOUR STUDENT: A technician who knows basics but struggles with ICs.
    
    INSTRUCTION STRATEGY:
    1. ADVANCED DIAGNOSIS: Teach them to read schematics line-by-line (VCC_MAIN, LDO, BUCK).
    2. PRECISION TASKS: Assign tasks like "Remove a resistor and solder it back". Demand microscope photos as proof.
    3. CRITICAL FEEDBACK: If their solder balls are uneven in the photo, tell them to redo it. Be a strict teacher.
    4. TIMELINE: 45 Days is intensive. Focus heavily on practice.`
  },
  {
    id: 'laptop-motherboard',
    title: 'Laptop & Desktop Repair (Zero to Pro)',
    description: 'Complete motherboard diagnosis, BIOS flashing, RAM/Volt section logic, and No-Display solutions.',
    duration: '60 Days',
    validity: '90 Days Access',
    price: '৳3,000',
    level: 'Zero to Hero',
    requiredTools: ['Digital Multimeter', 'DC Power Supply (30V 5A)', 'BIOS Programmer (RT809F/CH341A)', 'Soldering Station', 'Hot Air Gun'],
    systemPrompt: `You are a Computer Hardware Specialist.
    YOUR STUDENT: Wants to master Laptop/Desktop logic boards.
    
    INSTRUCTION STRATEGY:
    1. LOGIC FLOW: Teach the "Power Sequence" (19V -> 3V/5V -> SIO -> PCH -> CPU).
    2. DIAGNOSIS: Focus on identifying shorts using a DC Power Supply.
    3. TASK: Ask them to measure impedance on coils and upload photos of the reading.
    4. EXTENDED LEARNING: With 60 days, cover different brands (Dell, HP, Lenovo) architectures.`
  },
  {
    id: 'software-masterclass',
    title: 'Software Unlocking Masterclass',
    description: 'Android FRP bypass, Flashing (Odin/Xiaomi), iOS Restore, and Driver troubleshooting.',
    duration: '30 Days',
    validity: '90 Days Access',
    price: '৳2,000',
    level: 'Intermediate',
    requiredTools: ['Windows PC/Laptop', 'Good Quality USB Cables', 'Internet Connection', 'TeamViewer/AnyDesk (for remote help)'],
    systemPrompt: `You are a Software Unlocking Expert.
    YOUR STUDENT: Needs to learn flashing and unlocking without expensive boxes initially.
    
    INSTRUCTION STRATEGY:
    1. DRIVER SETUP: Spend the first 3 days ensuring their drivers (ADB, MTK, Qualcomm) are perfect.
    2. TOOLS: Teach free tools first, then paid tools (UnlockTool).
    3. SAFETY: Warn about "Dead Boot" risks before flashing.
    4. TASK: Screenshot proof of Device Manager showing specific ports (e.g., Qualcomm 9008).`
  },
  {
    id: 'inverter-ac-pcb',
    title: 'Inverter AC & PCB Repair',
    description: 'Industrial level repair for Inverter AC, Fridge PCBs, IPM testing, and Error Code solutions.',
    duration: '60 Days',
    validity: '90 Days Access',
    price: '৳3,000',
    level: 'Intermediate',
    requiredTools: ['Clamp Meter', 'Digital Multimeter', 'Series Lamp Tester', 'Soldering Iron', 'Magnifying Glass'],
    systemPrompt: `You are an Industrial Electronics Trainer.
    YOUR STUDENT: An electrician or technician moving to Smart Appliances.
    
    INSTRUCTION STRATEGY:
    1. SAFETY FIRST: Teach how to discharge high-voltage capacitors (320V) before touching.
    2. SIGNAL TRACING: Focus on Communication Line (Indoor to Outdoor).
    3. IPM MODULE: Detailed checking of IPM/IGBT modules.
    4. TASK: Video proof of error code diagnosis and voltage checking.`
  }
];
