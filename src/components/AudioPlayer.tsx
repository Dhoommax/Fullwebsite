// src/components/AudioPlayer.tsx

import React, { useRef, useState, useEffect } from 'react'

export default function AudioPlayer({ src }: { src: string | null }){
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [speed, setSpeed] = useState(1)

  useEffect(()=>{
    const a = audioRef.current
    if (!a) return
    const onTime = ()=> setCurrent(a.currentTime)
    const onDuration = ()=> setDuration(a.duration || 0)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onDuration)
    a.addEventListener('ended', ()=> setPlaying(false))
    return ()=>{ a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onDuration) }
  }, [audioRef.current])

  useEffect(()=>{ if (audioRef.current) audioRef.current.volume = volume }, [volume])
  useEffect(()=>{ if (audioRef.current) audioRef.current.playbackRate = speed }, [speed])

  const togglePlay = ()=>{
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else { a.play().then(()=>setPlaying(true)).catch(()=>setPlaying(false)) }
  }

  const seekTo = (v:number)=>{ if (audioRef.current) audioRef.current.currentTime = v }

  if (!src) return <div className="p-4 text-sm text-slate-500">No audio loaded</div>

  return (
    <div className="p-2 border rounded-md bg-white/80 dark:bg-transparent">
      <audio ref={audioRef} src={src} preload="auto" />
      <div className="flex items-center gap-3">
        <button onClick={togglePlay} aria-label="play" className="px-3 py-1 bg-blue-600 text-white rounded">{playing? 'Pause' : 'Play'}</button>
        <div className="text-sm">{new Date(current * 1000).toISOString().substr(14,5)} / {new Date((duration||0) *1000).toISOString().substr(14,5)}</div>
        <input type="range" min={0} max={duration||0} value={current} onChange={(e)=>seekTo(Number(e.target.value))} className="flex-1" />
        <label className="text-sm">Vol</label>
        <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e)=>setVolume(Number(e.target.value))} />
        <label className="text-sm">Speed</label>
        <select value={speed} onChange={(e)=>setSpeed(Number(e.target.value))} className="border rounded px-1">
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
        <a href={src} download className="ml-2 text-sm text-slate-600">Download</a>
      </div>
    </div>
  )
}
