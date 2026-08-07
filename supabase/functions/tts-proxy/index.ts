import { serve } from "std/server"

// Supabase Edge Function template: TTS Proxy (server-side)
// Accepts POST { text, voice, language, speed, pitch }
// Delegates to a server-side TTS adapter. Returns audio as base64 or a temporary URL.

const TTS_PROVIDER = Deno.env.get('TTS_PROVIDER') || Deno.env.get('VITE_TTS_PROVIDER') || 'none'

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return new Response(JSON.stringify({ error: 'Missing Authorization token' }), { status: 401 })

    const body = await req.json()
    const { text, voice, language, speed, pitch } = body || {}
    if (!text) return new Response(JSON.stringify({ error: 'Missing text payload' }), { status: 400 })

    // Adapter switch (no providers implemented yet)
    switch (TTS_PROVIDER) {
      case 'google':
        return new Response(JSON.stringify({ error: 'Google TTS adapter not implemented' }), { status: 501 })
      case 'elevenlabs':
        return new Response(JSON.stringify({ error: 'ElevenLabs TTS adapter not implemented' }), { status: 501 })
      default:
        return new Response(JSON.stringify({ error: 'No TTS provider configured' }), { status: 501 })
    }
  } catch (err: any) {
    console.error('tts-proxy error', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
})
