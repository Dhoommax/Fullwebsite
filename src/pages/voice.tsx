// src/pages/voice.tsx

import React, { useState } from 'react'
import { parseSRT, formatSRT, removeSpeakerName } from '../services/subtitles'
import { callTTS } from '../services/tts'
import AudioPlayer from '../components/AudioPlayer'

function detectLanguage(text: string){
  const swWords = ['habari','asante','karibu','sawa','ndio','kwaheri']
  const lowered = text.toLowerCase()
  for (const w of swWords) if (lowered.includes(w)) return 'sw-TZ'
  return 'en-US'
}

export default function Voice(){
  const [text, setText] = useState('Hello world')
  const [language, setLanguage] = useState('auto')
  const [detected, setDetected] = useState<string | null>(null)
  const [voice, setVoice] = useState('alloy')
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onGenerate = async ()=>{
    setError(null)
    setLoading(true)
    try {
      const lang = language === 'auto' ? detectLanguage(text) : language
      setDetected(lang)
      const res = await callTTS({ text, voice, language: lang })
      // The tts function returns generation id and charges; actual audio storage is provider dependent.
      // For demo flow, we attempt to fetch a demo audio URL if available in response (not guaranteed).
      if (res.result_url) setAudioUrl(res.result_url)
      else {
        // no url - show success message
        setAudioUrl(null)
      }
    } catch (err:any){
      setError(err?.message || String(err))
    } finally { setLoading(false) }
  }

  const onParseSRT = ()=>{
    try {
      const subs = parseSRT(text)
      const formatted = formatSRT(subs)
      setText(formatted)
    } catch (err:any) { setError('SRT parse failed') }
  }

  const onCleanup = ()=> setText(removeSpeakerName(text))

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold">Voice Studio</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Text input</label>
          <textarea className="w-full h-60 p-3 border rounded" value={text} onChange={(e)=>setText(e.target.value)} />
          <div className="flex items-center justify-between mt-2 text-sm text-slate-600">
            <div>Characters: {text.length} • Words: {text.trim() ? text.trim().split(/\s+/).length : 0}</div>
            <div className="flex gap-2">
              <button onClick={()=>{ setText('') }} className="px-2 py-1 bg-gray-200 rounded">Clear</button>
              <button onClick={()=>navigator.clipboard.writeText(text)} className="px-2 py-1 bg-gray-200 rounded">Copy</button>
              <button onClick={onParseSRT} className="px-2 py-1 bg-gray-200 rounded">Parse SRT</button>
              <button onClick={onCleanup} className="px-2 py-1 bg-gray-200 rounded">Remove Speaker</button>
            </div>
          </div>
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium">Language</label>
          <select value={language} onChange={(e)=>setLanguage(e.target.value)} className="w-full p-2 border rounded">
            <option value="auto">Auto-detect</option>
            <option value="en-US">English (en-US)</option>
            <option value="sw-TZ">Kiswahili (sw-TZ)</option>
          </select>

          <label className="block text-sm font-medium mt-3">Voice</label>
          <input className="w-full p-2 border rounded" value={voice} onChange={(e)=>setVoice(e.target.value)} />

          <div className="mt-3">
            <button onClick={onGenerate} className="w-full px-3 py-2 bg-blue-600 text-white rounded">{loading? 'Generating...' : 'Generate Speech'}</button>
          </div>

          {error && <div className="mt-3 text-red-600">{error}</div>}
          {detected && <div className="mt-2 text-sm text-slate-600">Detected language: {detected}</div>}

          <div className="mt-4">
            <h3 className="text-sm font-medium">Audio</h3>
            <div className="mt-2">
              <AudioPlayer src={audioUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
