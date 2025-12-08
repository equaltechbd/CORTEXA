
    Professional Technical Repair Assistant & AI Diagnostician

  ## Project Overview

CORTEXA is a next-generation AI assistant designed specifically for hardware technicians, software developers, and DIY repair enthusiasts. Built with React, Vite, and Google Gemini 1.5 Flash, it provides real-time diagnosis for electronics, coding errors, and mechanical issues.

The application features a secure, role-based system that adapts responses based on whether the user is a Student, Professional Technician, or Shop Owner.

## Key Features

- **Advanced AI Diagnostics:** Powered by Google Gemini 1.5 Flash for high-speed technical solutions.
- **Multimodal Analysis:** Upload images of circuit boards or code errors for instant AI analysis.
- **Secure Authentication:** Email & Google Authentication via Supabase.
- **Glassmorphism UI:** Modern, responsive dark-themed design.
- **Role-Based Responses:** Adapts tone and technical depth based on the user's professional profile.
- **Usage Limits:** Built-in daily limit system for Freemium access.
- **Personalization:** Settings panel to update user profile and preferences.

## Tech Stack

- **Frontend:** React (TypeScript), Vite
- **Styling:** Tailwind CSS, Lucide React
- **Backend:** Supabase (Auth, Database)
- **AI Model:** Google Gemini 1.5 Flash API
- **Deployment:** Netlify

## Getting Started

To run this project locally, follow these steps:

### Prerequisites

Node.js (v18 or higher)

### Installation

1. Clone the repository
   ```bash
   git clone [https://github.com/equaltechbd/CORTEXA.git](https://github.com/equaltechbd/CORTEXA.git)
   cd CORTEXA
Install dependencies

Bash

npm install
Set up Environment Variables Create a .env file in the root directory and add your keys:

Code snippet

VITE_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Run the development server

Bash

npm run dev
Project Structure
Bash

CORTEXA/
├── src/
│   ├── App.tsx             # Main Logic
│   ├── Sidebar.tsx         # Navigation
│   ├── ChatInput.tsx       # Input & Uploads
│   ├── ChatMessage.tsx     # Message Rendering
│   ├── AuthScreen.tsx      # Login UI
│   ├── gemini.ts           # AI Configuration
│   └── supabaseClient.ts   # Database Connection
├── public/                 # Static Assets
└── README.md               # Documentation
<div align="center"> <p>Developed by Equal Tech</p> </div>
