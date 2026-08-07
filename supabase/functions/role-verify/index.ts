import { serve } from "std/server"

// Supabase Edge Function (Deno) template: role verification
// Expects Authorization: Bearer <user-jwt>
// Uses Supabase Auth endpoint to verify the JWT and then uses the service role key to read the profiles table.

const SUPABASE_URL = Deno.env.get('VITE_SUPABASE_URL') || Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return new Response(JSON.stringify({ error: 'Missing Authorization token' }), { status: 401 })

    // Verify token with Supabase Auth endpoint to obtain the user id
    const userRes = await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/auth/v1/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!userRes.ok) {
      const body = await userRes.text()
      return new Response(JSON.stringify({ error: 'Invalid token', detail: body }), { status: 401 })
    }
    const user = await userRes.json()
    const userId = user?.id
    if (!userId) return new Response(JSON.stringify({ error: 'Unable to determine user from token' }), { status: 401 })

    // Query profiles table using service role key
    const profilesUrl = `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/profiles?select=role&id=eq.${userId}`
    const profileRes = await fetch(profilesUrl, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY,
      },
    })
    if (!profileRes.ok) {
      const body = await profileRes.text()
      return new Response(JSON.stringify({ error: 'Failed to fetch profile', detail: body }), { status: 500 })
    }
    const profileData = await profileRes.json()
    const role = (profileData && profileData[0] && profileData[0].role) || 'user'

    return new Response(JSON.stringify({ id: userId, role }), { status: 200 })
  } catch (err: any) {
    console.error('role-verify error', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
})
