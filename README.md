# Codex AI Studio

A production-ready scaffold for building an AI platform (Codex AI Studio) using React, Vite, TypeScript and Supabase. This repository contains a lightweight, deployment-ready skeleton with clean module separation for auth, voice, subtitles, video, songs, and admin panels.

What is included
- Vite + React + TypeScript scaffold
- Tailwind CSS integration (dark/light via class)
- Supabase client wrapper (src/lib/supabaseClient.ts)
- Provider-agnostic TTS interface (src/services/tts)
- Subtitle parser utilities
- Pages and component scaffolding for main app sections
- .env.example and deployment guidance

Getting started (development)
1. Clone the repo
2. Install dependencies: npm install
3. Create a Supabase project and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment (see .env.example)
4. Start dev server: npm run dev

Build
- npm run build

Deployment
- Deploy to Vercel. Configure environment variables in the Vercel dashboard (server-only keys like SUPABASE_SERVICE_ROLE_KEY and TTS_API_KEY must be set as protected values).

Notes
- This scaffold intentionally does not include concrete AI/TTS provider implementations. It provides clean interfaces and adapter loading points so you can plug in Google Cloud TTS, ElevenLabs, or any provider without changing app logic.
- Admin access must be enforced server-side. Frontend includes placeholders and admin layout but does not grant any elevated access itself.

TODO / Next steps
- Implement server-side Edge Functions or API routes for secure operations (role checks, FFmpeg jobs, server-side AI calls)
- Add concrete TTS provider adapters (Google or ElevenLabs) under src/services/tts/providers/
- Build dashboard components for usage metrics and subscription management

