import { serve } from "std/server"

// Supabase Edge Function template: Video job create / status
// Create a simple video_jobs entry using service role key via PostgREST.

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  try {
    const method = req.method
    if (method === 'POST'){
      const authHeader = req.headers.get('authorization') || ''
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
      if (!token) return new Response(JSON.stringify({ error: 'Missing Authorization token' }), { status: 401 })

      const body = await req.json()
      const { user_id, file_url } = body || {}
      if (!user_id || !file_url) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })

      const payload = {
        user_id,
        file_url,
        status: 'queued',
        progress: 0,
        output_url: null,
      }

      const res = await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/video_jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Prefer: 'return=representation'
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      return new Response(JSON.stringify({ data }), { status: res.status })
    }

    if (method === 'GET'){
      const url = new URL(req.url)
      const jobId = url.searchParams.get('jobId')
      if (!jobId) return new Response(JSON.stringify({ error: 'jobId required' }), { status: 400 })

      const res = await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/video_jobs?id=eq.${jobId}`, {
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          apikey: SUPABASE_SERVICE_ROLE_KEY,
        }
      })
      const data = await res.json()
      return new Response(JSON.stringify({ data }), { status: res.status })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  } catch (err: any) {
    console.error('video-jobs error', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
})
