import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar(){
  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg">Codex AI Studio</Link>
        <div className="space-x-4">
          <Link to="/voice" className="text-sm">Voice</Link>
          <Link to="/subtitles" className="text-sm">Subtitles</Link>
          <Link to="/video" className="text-sm">Video</Link>
          <Link to="/dashboard" className="text-sm">Dashboard</Link>
          <Link to="/auth" className="text-sm">Sign in</Link>
        </div>
      </div>
    </nav>
  )
}
