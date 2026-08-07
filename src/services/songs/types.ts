export interface IMusicGenerationAdapter {
  generateSong(opts: { lyrics?: string, genre?: string, mood?: string, tempo?: number, duration?: number }): Promise<{ audioUrl?: string, metadata?: any }>
}
