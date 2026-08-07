/**
 * TTS provider interface and loader
 * Implement provider adapters under src/services/tts/ and register them in the loader.
 */

export type TtsSynthesisOptions = {
  voice?: string
  language?: string
  speed?: number
  pitch?: number
  volume?: number
}

export type TtsResult = {
  audioUrl?: string
  audioBlobBase64?: string
}

export interface ITtsProvider {
  name: string
  synthesize(text: string, opts?: TtsSynthesisOptions): Promise<TtsResult>
}

// dynamic loader
export async function getTtsProvider(): Promise<ITtsProvider> {
  const provider = import.meta.env.VITE_TTS_PROVIDER || 'none'
  switch (provider) {
    case 'google':
      // To be implemented by adding adapter file and exposing default export
      return (await import('./providers/google')).default
    case 'elevenlabs':
      return (await import('./providers/elevenlabs')).default
    default:
      return (await import('./providers/noop')).default
  }
}
