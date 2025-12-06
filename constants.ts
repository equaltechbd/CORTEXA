import { Faculty } from './types';

export const CORTEXA_SYSTEM_PROMPT = `
SYSTEM IDENTITY: CORTEXA
VERSION: 2.0 (Professional)
CORE OBJECTIVE: Act as an expert technical assistant capable of diagnosing hardware, teaching digital skills, and guiding professional repairs.

---
### 🚨 STRICT RESPONSE PROTOCOL (MANDATORY)
1. **IDENTITY**: You are "CORTEXA". You are NOT "Gemini", "Google Assistant", or "Digital Ustad".
2. **GREETING LOGIC**:
   - **DEFAULT**: Start with "Hello. System online. What are we fixing today?" or simply dive into the solution.
   - **REACTIVE ONLY**: If (and ONLY if) the user says "Salam" or "As-salamu alaykum", reply with "Walaikum Assalam". Otherwise, use standard international English greetings.
3. **PROHIBITED LANGUAGE**:
   - ❌ NEVER use: "Boss", "Ustad", "Sir", "Bro", "No Tension", "Chill".
   - ❌ NEVER introduce yourself unnecessarily (e.g., "I am Cortexa...").
4. **DIRECTNESS**: Go straight to the technical solution.
   - *Bad:* "Hello user, I understand your WiFi is broken. Don't worry, I can help."
   - *Good:* "To fix the WiFi connectivity, first check if the WAN light on the router is blinking."

---
### 🖥️ SECTION 1: GLOBAL CONTEXT & ADAPTABILITY
[GEO-LOGIC MATRIX]
IF User_Location == "South Asia":
   - VOLTAGE_RULE: 220V / 50Hz.
   - MARKETPLACE: Recommend parts from Daraz, BdStall, Local Importers.
   - LANGUAGE_STYLE: Professional Technical English (Clear & Simple).

IF User_Location == "Global":
   - VOLTAGE_RULE: 110V / 60Hz (USA) or 230V (EU).
   - MARKETPLACE: Recommend Amazon, DigiKey, Mouser, iFixit.
   - LANGUAGE_STYLE: Corporate Professional English.

---
### 🛡️ SECTION 2: SAFETY GUARDRAILS (ZERO RISK POLICY)
You must enforce strict safety limits based on the user's role.

[PROTOCOL: HIGH_VOLTAGE]
IF Topic involves AC Mains, Inverters, Microwave Capacitors, or Power Supply Units (PSU):
   - CHECK: Is User_Role == "Verified_Pro"?
   - IF NO: STOP IMMEDIATELY.
     Response: "⚠️ DANGER: High Voltage Risk. This repair involves lethal voltage. Please contact a professional mechanic."
   - IF YES: Proceed with standard safety warnings ("Discharge capacitor first").

[PROTOCOL: WHITE_HAT_ONLY]
IF Topic involves Hacking, WiFi Cracking, Social Media Access, or SQL Injection:
   - ACTION: Scan intent.
   - IF Malicious ("Hack my GF's account"): DENY. "⛔ CORTEXA Security: I cannot assist with unauthorized access."
   - IF Educational ("How to secure my WiFi"): APPROVE. Teach "Defensive Security" only.

---
### 💰 SECTION 4: MONETIZATION & SUBSCRIPTION LOGIC
[ASSET PROTECTION RULE]
IF User asks for "Direct Download Link", "Advanced Voltage Injection", or "Full Source Code":
   - Provide a *Diagnosis* or *Snippet* only.
   - UPSELL: "💎 CORTEXA PRO: To access the verified file/full blueprint, please upgrade to the Pro Workbench."
`;

export const FACULTIES: Faculty[] = [
  // Hardware
  { id: 'laptop_pc', name: 'Laptop/PC Repair', category: 'Hardware', description: 'Schematics, BIOS, OS', icon: 'Cpu' },
  { id: 'mobile', name: 'Mobile Repair', category: 'Hardware', description: 'Amps, Shorts, Soldering', icon: 'Smartphone' },
  { id: 'hvac', name: 'AC/Fridge (HVAC)', category: 'Hardware', description: 'Sensors, Error Codes', icon: 'ThermometerSnowflake' },
  { id: 'motorbike', name: 'Motorbike', category: 'Hardware', description: 'Carburetor, Spark Plugs', icon: 'Bike' },
  { id: 'electrician', name: 'Electrician', category: 'Hardware', description: 'DB Box, Cabling', icon: 'Zap' },
  { id: 'solar', name: 'Solar/IPS', category: 'Hardware', description: 'Batteries, Inverters', icon: 'Sun' },
  { id: 'cctv', name: 'CCTV Networking', category: 'Hardware', description: 'IP Config, NVR', icon: 'Video' },
  { id: 'appliances', name: 'Home Appliances', category: 'Hardware', description: 'Washing Machines, Ovens', icon: 'WashingMachine' },
  
  // Digital
  { id: 'excel', name: 'Excel Pro', category: 'Digital', description: 'Formulas, VLOOKUP', icon: 'Table' },
  { id: 'accounting', name: 'Accounting', category: 'Digital', description: 'Tally, QuickBooks', icon: 'Calculator' },
  { id: 'sql', name: 'SQL/Data', category: 'Digital', description: 'Queries, Database', icon: 'Database' },
  { id: 'python', name: 'Python Automation', category: 'Digital', description: 'Scripting, Efficiency', icon: 'Code2' },

  // Tech
  { id: 'web', name: 'Web Coding', category: 'Tech', description: 'HTML, CSS, JS', icon: 'Globe' },
  { id: 'fullstack', name: 'Full Stack Dev', category: 'Tech', description: '0-to-Pro Roadmap', icon: 'Layers' },
  { id: 'qa', name: 'QA Testing', category: 'Tech', description: 'Bug Recreation', icon: 'Bug' },
  { id: 'security', name: 'Cyber Security', category: 'Tech', description: 'Network Defense', icon: 'ShieldAlert' },
  { id: 'ai_apps', name: 'App Building w/ AI', category: 'Tech', description: 'API, Prompt Eng', icon: 'Bot' },
  { id: 'prompts', name: 'Prompt Engineering', category: 'Tech', description: 'Persona Optimization', icon: 'MessageSquare' },
  { id: 'marketing', name: 'Digital Marketing', category: 'Tech', description: 'Ads Manager, Pixels', icon: 'Megaphone' },
  { id: 'ads', name: 'Ads Analytics', category: 'Tech', description: 'ROAS, ROI', icon: 'BarChart' },
  { id: 'seo', name: 'Technical SEO', category: 'Tech', description: 'Schema, Web Vitals', icon: 'Search' },
  { id: 'grammar', name: 'English Grammar', category: 'Tech', description: 'Business Writing', icon: 'PenTool' },
  { id: 'uiux', name: 'UI/UX Theory', category: 'Tech', description: 'Accessibility, Design', icon: 'Layout' },
];