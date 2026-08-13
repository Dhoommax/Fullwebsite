// supabase/functions/lib/providers.ts

import fetch from 'node-fetch'

export interface TTSRequest {
  text: string
  voice?: string
  language?: string
  rate?: number
  pitch?: number
  volume?: number
  style?: string
}

export interface TTSProviderResult {
  ok: boolean
  url?: string
  contentType?: string
  bytes?: number
  error?: string
}

export abstract class TTSProvider {
  abstract generateSpeech(req: TTSRequest): Promise<TTSProviderResult>
}

export class ElevenLabsProvider extends TTSProvider {
  apiKey: string
  constructor(apiKey: string){
    super()
    this.apiKey = apiKey
  }
  async generateSpeech(req: TTSRequest){
    if (!this.apiKey) return { ok: false, error: 'ElevenLabs not configured' }
    // Example ElevenLabs request - NOTE: users must provide real API key
    const endpoint = 'https://api.elevenlabs.io/v1/text-to-speech/' + (req.voice || 'alloy') + '/stream'
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({ text: req.text, voice: req.voice })
      })
      if (!res.ok) return { ok: false, error: `elevenlabs: ${res.status}` }
      const arrayBuffer = await res.arrayBuffer()
      return { ok: true, bytes: arrayBuffer.byteLength, contentType: res.headers.get('content-type') || 'audio/mpeg' }
    } catch (err: any){
      return { ok: false, error: err.message }
    }
  }
}

export class GoogleCloudTTSProvider extends TTSProvider {
  apiKey: string
  constructor(apiKey: string){
    super()
    this.apiKey = apiKey
  }
  async generateSpeech(req: TTSRequest){
    if (!this.apiKey) return { ok: false, error: 'Google Cloud TTS not configured' }
    const endpoint = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${this.apiKey}`
    const body = {
      input: { text: req.text },
      voice: { languageCode: req.language || 'en-US', name: req.voice },
      audioConfig: { audioEncoding: 'MP3', pitch: req.pitch || 0, speakingRate: req.rate || 1 }
    }
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) return { ok: false, error: `google: ${res.status}` }
      const data = await res.json()
      if (data && data.audioContent){
        // return base64 content
        return { ok: true, bytes: (data.audioContent as string).length }
      }
      return { ok: false, error: 'no audioContent' }
    } catch (err: any){
      return { ok: false, error: err.message }
    }
  }
}

export function createTTSProvider(name: string | undefined){
  const provider = (process.env.TTS_PROVIDER || name || '').toLowerCase()
  if (provider === 'elevenlabs') return new ElevenLabsProvider(process.env.ELEVENLABS_API_KEY || '')
  if (provider === 'google') return new GoogleCloudTTSProvider(process.env.GOOGLE_CLOUD_TTS_KEY || '')
  return null
}
