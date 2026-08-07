export interface ISubtitleFileService {
  upload(file: File): Promise<{ id: string, url?: string }>
}

export interface ISubtitleParser {
  parse(content: string): Promise<any>
}

export interface ITranslationAdapter {
  translate(text: string, sourceLang?: string, targetLang?: string, opts?: any): Promise<string>
}
