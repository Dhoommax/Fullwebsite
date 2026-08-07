export interface TtsAdapterResult { audioBase64?: string, url?: string }

export async function googleTtsSynthesize(opts: { text: string, voice?: string, language?: string, speed?: number, pitch?: number }): Promise<TtsAdapterResult> {
  // Implement server-side call to Google Cloud TTS using GOOGLE_APPLICATION_CREDENTIALS or API key from env.
  throw new Error('Not implemented')
}

export async function elevenLabsSynthesize(opts: { text: string, voice?: string, language?: string, speed?: number, pitch?: number }): Promise<TtsAdapterResult> {
  // Implement server-side call to ElevenLabs using API key from env.
  throw new Error('Not implemented')
}
