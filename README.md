# CORTEXA: Professional Technical Repair Assistant

(Insert your logo link here)

Developed by: Equal Tech

---

## 1. Project Overview

CORTEXA is a secure, serverless web application designed to provide expert-level technical diagnosis and repair solutions. It handles queries across electronics, coding, mechanical issues, and general digital problem-solving. This MVP establishes a secure, scalable freemium model.

---

## 2. Core Features

This application is built around security, performance, and cost management:

- Secure Authentication: User sign-in/sign-up via Email/Password and Google OAuth.
- Freemium Usage Limits: Daily consumption is controlled on the backend.
- Secure AI Proxy: Expensive AI API calls are routed through a Supabase Edge Function to hide the Gemini API Key.
- Multimodal Analysis: Supports processing of both text and image queries using the Gemini 1.5 Flash model.
- Aesthetic Design: Features a responsive, dark-themed user interface.

---

## 3. Technical Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Supabase (PostgreSQL, GoTrue Auth)
- Serverless Logic: Supabase Edge Functions (Deno/TypeScript)
- AI Model: Google Gemini 1.5 Flash
- Hosting: Netlify

---

## 4. Setup and Configuration

To run this project, the following environment secrets must be configured in your Supabase Dashboard under Edge Functions > Settings > Secrets.

- GEMINI_API_KEY: Provides access to the Gemini AI API.
- SUPABASE_URL: Your project's unique REST endpoint.
- SUPABASE_SERVICE_ROLE_KEY: Authorizes the Edge Function to securely read/write to the database.

---

## 5. Deployment Instructions

If managing locally via Supabase CLI:

supabase functions deploy cortexa-ai-service

---

## 6. Production Configuration

After deploying the frontend to a public host (like Netlify), update these settings:

1. Supabase Auth: Update the Site URL to your final domain.
2. Google Cloud Console: Update the Authorized JavaScript origins and Redirect URIs to your final domain.
