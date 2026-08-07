export interface IVoiceUploadService {
  uploadFile(file: File, path?: string): Promise<{ url: string }>
}

export interface ITtsRequest {
  text: string
  voice?: string
  language?: string
  speed?: number
  pitch?: number
}

export interface IVoiceService {
  synthesize(opts: ITtsRequest): Promise<{ audioUrl?: string, audioBase64?: string }>
}
