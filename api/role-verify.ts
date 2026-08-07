// Vercel serverless template: role verify
// Place in /api/role-verify.ts for Vercel deployments. This mirrors the Supabase Edge Function.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import fetch from 'node-fetch'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return res.status(401).json({ error: 'Missing Authorization token' })

    const userRes = await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}` }})
    if (!userRes.ok) return res.status(401).json({ error: 'Invalid token' })
    const user = await userRes.json()
    const userId = user?.id
    if (!userId) return res.status(401).json({ error: 'Unable to determine user from token' })

    const profileRes = await fetch(`${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/profiles?select=role&id=eq.${userId}`, {
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: SUPABASE_SERVICE_ROLE_KEY
      }
    })
    const profileData = await profileRes.json()
    const role = (profileData && profileData[0] && profileData[0].role) || 'user'
    return res.status(200).json({ id: userId, role })
  } catch (err: any){
    console.error('role-verify (vercel) error', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
