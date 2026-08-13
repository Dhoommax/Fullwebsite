// supabase/functions/tts/index.ts

import { serve } from 'std/server'
import { createClient } from '@supabase/supabase-js'
import { createTTSProvider } from '../lib/providers'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL')
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn('Supabase URL or service role key missing in function environment')
}

const supabaseAdmin = createClient(SUPABASE_URL || '', SERVICE_ROLE_KEY || '')

serve(async (req) => {
  try {
    // Authenticate the user - require Bearer token
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    const user = userData.user

    const body = await req.json()
    const { text, voice, language, rate, pitch, project_id } = body || {}
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Text is required' }), { status: 400 })
    }

    // price model: simple: 1 credit per 100 characters (rounded up)
    const chars = text.length
    const cost = Math.max(1, Math.ceil(chars / 100))

    // check credits
    const profileRes = await supabaseAdmin.from('profiles').select('id').eq('user_id', user.id).maybeSingle()
    const profile = profileRes.data
    if (!profile || !profile.id) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 400 })
    }
    const profileId = profile.id

    const balanceRes = await supabaseAdmin.rpc('get_credit_balance', { p_user_id: profileId })
    if (balanceRes.error) {
      console.error('credit balance error', balanceRes.error)
      return new Response(JSON.stringify({ error: 'Could not check credits' }), { status: 500 })
    }
    const balance = Number(balanceRes.data) || 0
    if (balance < cost) return new Response(JSON.stringify({ error: 'insufficient_credits' }), { status: 402 })

    // select provider
    const providerInstance = createTTSProvider(undefined)
    if (!providerInstance) return new Response(JSON.stringify({ error: 'tts_provider_not_configured' }), { status: 503 })

    // create generation record (pending)
    const genRes = await supabaseAdmin.from('generations').insert([{ user_id: profileId, project_id: project_id || null, generation_type: 'tts', provider: process.env.TTS_PROVIDER || null, status: 'pending', metadata: { chars } }]).select().single()
    const generation = genRes.data

    // call provider
    const providerResult = await providerInstance.generateSpeech({ text, voice, language, rate, pitch })
    if (!providerResult.ok) {
      // mark generation failed
      await supabaseAdmin.from('generations').update({ status: 'failed', metadata: { error: providerResult.error } }).eq('id', generation.id)
      return new Response(JSON.stringify({ error: 'provider_error', detail: providerResult.error }), { status: 502 })
    }

    // deduct credits atomically via RPC
    const deduct = await supabaseAdmin.rpc('deduct_credits', { p_user_id: profileId, p_amount: cost, p_generation_id: generation.id })
    if (deduct.error) {
      console.error('deduct error', deduct.error)
      await supabaseAdmin.from('generations').update({ status: 'failed', metadata: { error: 'deduct_failed' } }).eq('id', generation.id)
      return new Response(JSON.stringify({ error: 'deduct_failed' }), { status: 500 })
    }

    // For providers that returned bytes we could store to Supabase Storage - here we return a success stub
    await supabaseAdmin.from('generations').update({ status: 'completed', result_url: null }).eq('id', generation.id)

    return new Response(JSON.stringify({ ok: true, credits_charged: cost, generation_id: generation.id }), { status: 200 })

  } catch (err: any) {
    console.error('tts function error', err)
    return new Response(JSON.stringify({ error: 'internal_error' }), { status: 500 })
  }
})
