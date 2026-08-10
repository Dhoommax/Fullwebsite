// src/services/tts.ts

import { supabase } from '../lib/supabaseClient'

export type TTSRequest = {
  text: string
  voice?: string
  language?: string
  rate?: number
  pitch?: number
  project_id?: string | null
}

export async function callTTS(req: TTSRequest){
  // get session to obtain access token
  const { data: sessionRes } = await supabase.auth.getSession()
  const token = sessionRes.session?.access_token
  if (!token) throw new Error('not_authenticated')

  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(req)
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data?.error || 'tts_failed')
  return data
}
