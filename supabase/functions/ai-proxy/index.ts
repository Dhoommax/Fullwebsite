import { serve } from "std/server"

// Supabase Edge Function template: AI Proxy (server-side adapter loader)
// This endpoint is a secure template showing how to receive requests from the frontend
// and delegate to server-side AI provider adapters. No provider keys are exposed to the client.

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const AI_PROVIDER = Deno.env.get('AI_PROVIDER') || Deno.env.get('VITE_AI_PROVIDER') || 'none'

serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return new Response(JSON.stringify({ error: 'Missing Authorization token' }), { status: 401 })

    const body = await req.json()
    const { action, payload } = body || {}

    // For now we don't implement real providers. Show adapter switch and return a placeholder.
    // In production implement adapters under src/server/adapters and call them here using server-only env keys.

    switch (AI_PROVIDER) {
      case 'gemini':
        // call Gemini adapter (not implemented)
        return new Response(JSON.stringify({ error: 'Gemini adapter not implemented' }), { status: 501 })
      default:
        return new Response(JSON.stringify({ error: 'AI provider not configured' }), { status: 501 })
    }
  } catch (err: any) {
    console.error('ai-proxy error', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
})
