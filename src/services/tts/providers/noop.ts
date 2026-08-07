import type { ITtsProvider, TtsResult, TtsSynthesisOptions } from '../index'

const noop: ITtsProvider = {
  name: 'noop',
  async synthesize(text: string){
    // No-op provider used as a safe default. Returns empty result and logs.
    console.warn('TTS provider is set to none. Synthesize called with text length', text.length)
    return { audioUrl: undefined }
  }
}

export default noop
