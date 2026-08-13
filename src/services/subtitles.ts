// src/services/subtitles.ts

export type Subtitle = {
  id: string
  index: number
  start: number // seconds
  end: number // seconds
  text: string
}

// parse timestamp "00:00:01,000" -> seconds
export function parseTimestamp(ts: string){
  const m = ts.trim().match(/(\d+):(\d+):(\d+)[,\.]?(\d+)?/)
  if (!m) return 0
  const h = parseInt(m[1], 10)
  const mm = parseInt(m[2], 10)
  const s = parseInt(m[3], 10)
  const ms = parseInt((m[4] || '0').padEnd(3, '0'), 10)
  return h * 3600 + mm * 60 + s + ms / 1000
}

export function formatTimestamp(seconds: number){
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const ms = Math.floor((seconds - Math.floor(seconds)) * 1000)
  const pad = (n:number, l=2)=> String(n).padStart(l,'0')
  return `${pad(h)}:${pad(m)}:${pad(s)},${String(ms).padStart(3,'0')}`
}

export function parseSRT(srt: string){
  const parts = srt.replace(/\r\n/g,'\n').split('\n\n')
  const subs: Subtitle[] = []
  let idIdx = 0
  for (const part of parts){
    const lines = part.split('\n').filter(Boolean)
    if (lines.length < 2) continue
    let cursor = 0
    // optional numeric index
    const maybeIndex = lines[0].trim()
    if (/^\d+$/.test(maybeIndex)) { cursor = 1 }
    const times = lines[cursor].split('-->')
    if (!times || times.length < 2) continue
    const start = parseTimestamp(times[0])
    const end = parseTimestamp(times[1])
    const textLines = lines.slice(cursor+1)
    const text = textLines.join('\n')
    subs.push({ id: `srt-${idIdx++}`, index: subs.length+1, start, end, text })
  }
  return subs
}

export function formatSRT(subs: Subtitle[]){
  return subs.map((s, i)=> `${i+1}\n${formatTimestamp(s.start)} --> ${formatTimestamp(s.end)}\n${s.text}`).join('\n\n')
}

// Remove common speaker name patterns without removing real text
export function removeSpeakerName(text: string){
  // strip lines that start with NAME: or [NAME] or (Name)
  const lines = text.split('\n')
  const cleaned = lines.map(line => {
    const trimmed = line.trim()
    // patterns: JOHN:, JOHN -, [JOHN], (John)
    if (/^[A-Z\s]+[:\-]$/.test(trimmed)) return ''
    if (/^\[[A-Z\s]+\]$/.test(trimmed)) return ''
    if (/^\([A-Z][a-zA-Z\s]+\)$/.test(trimmed)) return ''
    // inline patterns like "JOHN: Hello" -> remove the prefix
    if (/^[A-Z\s]+:\s*/.test(trimmed)) return trimmed.replace(/^[A-Z\s]+:\s*/, '')
    return line
  })
  return cleaned.filter(Boolean).join('\n')
}

