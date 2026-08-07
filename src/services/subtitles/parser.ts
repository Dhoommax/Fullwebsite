export type SubtitleFormat = 'srt' | 'vtt' | 'txt'

export function parseSrt(srt: string){
  // Minimal SRT parser: returns array of { start, end, text }
  const blocks = srt.split(/\r?\n\r?\n/)
  const items = [] as any[]
  for (const block of blocks){
    const lines = block.split(/\r?\n/).filter(Boolean)
    if (lines.length >= 2){
      // lines[0] might be index
      let timeLineIndex = 0
      if (/^\d+$/.test(lines[0])) timeLineIndex = 1
      const timeLine = lines[timeLineIndex]
      const m = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/)
      if (m){
        const text = lines.slice(timeLineIndex+1).join('\n')
        items.push({ start: m[1], end: m[2], text })
      }
    }
  }
  return items
}
