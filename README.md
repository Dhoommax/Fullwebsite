# Codex AI Studio

Codex AI Studio is a full-stack AI content platform built with React, TypeScript, Vite, and Supabase. This repository contains the frontend SPA, Supabase database migrations, and server-side Edge Function templates for AI/TTS integrations.

IMPORTANT: This repository intentionally requires configuring Supabase and external AI provider credentials. Do not commit secrets.

## Features implemented in this commit

- Database migrations (supabase/migrations/001_initial.sql) creating profiles, projects, credit system, generations, usage logs, and RLS policies.
- Basic credit RPCs: deduct_credits, add_credits, get_credit_balance.
- Supabase Edge Function template for TTS (supabase/functions/tts) with provider adapter structure.
- Provider adapter templates for ElevenLabs and Google Cloud TTS (supabase/functions/lib/providers.ts).
- Frontend TTS service (src/services/tts.ts) that calls Supabase Functions securely.
- Subtitle utilities: parseSRT, formatSRT, removeSpeakerName (src/services/subtitles.ts).
- Audio player component (src/components/AudioPlayer.tsx).
- Functional Voice Studio page wired to TTS function and subtitle utilities (src/pages/voice.tsx).
- .env.example and documentation notes.

## Local development

1. Install dependencies

```bash
npm install
```

2. Configure environment variables (see .env.example)

3. Start dev server

```bash
npm run dev
```

4. To build production bundle

```bash
npm run build
```

## Supabase setup

1. Create a Supabase project.
2. Run the SQL in `supabase/migrations/001_initial.sql` using the SQL editor to create tables and RLS policies.
3. Create storage buckets: avatars, projects, audio, videos, subtitles, generated. Add policies as required.
4. Deploy Edge Functions in `supabase/functions/` (tts) to your Supabase project.

## Environment variables

Populate values in a `.env` file (do NOT commit secrets).

Frontend-safe:

- VITE_SUPABASE_URL=
- VITE_SUPABASE_ANON_KEY=

Server-only (do NOT expose in frontend):

- SUPABASE_SERVICE_ROLE_KEY=
- TTS_PROVIDER= (e.g. elevenlabs | google)
- ELEVENLABS_API_KEY=
- GOOGLE_CLOUD_TTS_KEY=

## Limitations

- Edge Functions require deployment to Supabase and environment variables set in that environment.
- Provider adapters are templates — you must provide valid API keys for ElevenLabs or Google Cloud TTS for audio generation to work.
- This commit focuses on core functionality: profiles, credits RPCs, TTS function, subtitle parsing and a functioning Voice Studio. Additional pages and admin UI should be implemented next.

