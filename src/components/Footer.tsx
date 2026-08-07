import React from 'react'

export default function Footer(){
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-8">
      <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-500">
        © {new Date().getFullYear()} Codex AI Studio — Built with Supabase + Vite + React.
      </div>
    </footer>
  )
}
