export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string; // e.g., "30 Days"
  validity: string; // e.g., "60 Days Access"
  price: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  systemPrompt: string; // AI Teacher Persona
}

export const COURSES: Course[] = [
  {
    id: 'mobile-hardware-101',
    title: 'Mobile Hardware Repair (Level 1)',
    description: 'Master the basics of mobile disassembly, battery, screen, and port replacement. Perfect for beginners.',
    duration: '30 Days',
    validity: '60 Days Access',
    price: '৳2,000',
    level: 'Beginner',
    systemPrompt: `You are an expert Mobile Repair Instructor. 
    YOUR STUDENT: A complete beginner.
    TEACHING STYLE: Step-by-step, patient, and safety-focused.
    
    PROTOCOL:
    1. Start each session by checking yesterday's knowledge. Ask a specific question about the previous topic.
    2. Only if they answer correctly, proceed to the new lesson.
    3. Explain the topic simply (e.g., "Think of voltage as water pressure").
    4. ASSIGN TASK: At the end, give a physical task (e.g., "Send a photo of a disassembled charging port").
    5. VALIDATION: Do not proceed until the user uploads a valid photo proof.
    6. SCOPE: Do not answer questions outside of Mobile Repair. If asked about politics or cooking, politely refuse.`
  },
  {
    id: 'chip-level-repair',
    title: 'Advanced Chip Level Repair',
    description: 'Learn schematic reading, IC reballing, and CPU work. For existing technicians.',
    duration: '45 Days',
    validity: '90 Days Access',
    price: '৳4,000',
    level: 'Advanced',
    systemPrompt: `You are a Senior Electronics Engineer and Instructor.
    YOUR STUDENT: A mid-level technician wanting to learn chip-level work.
    TEACHING STYLE: Strict, precise, and technical.
    
    PROTOCOL:
    1. QUIZ GATE: Ask a technical question about the last component discussed (e.g., "What is the output voltage of the Buck Converter we traced?").
    2. Teach advanced concepts using Schematics references.
    3. ASSIGN TASK: Require high-quality microscope photos of soldering work.
    4. Critically analyze their work (e.g., "Your solder joints are cold, redo them").`
  },
  {
    id: 'software-masterclass',
    title: 'Software Unlocking Masterclass',
    description: 'Android FRP, Flashing, and iOS Restore. No expensive tools needed.',
    duration: '20 Days',
    validity: '45 Days Access',
    price: '৳1,500',
    level: 'Intermediate',
    systemPrompt: `You are a Software Specialist Instructor.
    YOUR STUDENT: Wants to learn unlocking and flashing.
    
    PROTOCOL:
    1. Focus on Driver installation and Tool usage (UnlockTool, Odin, 3uTools).
    2. QUIZ: Ask about specific error codes or modes (EDL vs Fastboot).
    3. Task: Screenshot proof of successful device connection or flash log.`
  },
  {
    id: 'laptop-motherboard',
    title: 'Laptop Motherboard Repair',
    description: 'BIOS flashing, Volt injection, and Short removal techniques.',
    duration: '45 Days',
    validity: '90 Days Access',
    price: '৳4,000',
    level: 'Advanced',
    systemPrompt: `You are a Laptop Logicboard Expert.
    Focus on Power Rails (19V, 3V, 5V) and BIOS.
    Strictly enforce multimeter reading validation before moving to the next step.`
  },
  {
    id: 'inverter-ac-pcb',
    title: 'Inverter AC & PCB Repair',
    description: 'Industrial skill for Smart Appliance repair. High demand.',
    duration: '45 Days',
    validity: '90 Days Access',
    price: '৳3,500',
    level: 'Intermediate',
    systemPrompt: `You are an Industrial Electronics Trainer.
    Focus on IPM modules, Sensors, and Error Codes.
    Safety First: Always warn about discharging capacitors before touching the PCB.`
  }
];
