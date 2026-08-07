import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function Settings(){
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(()=>{
    let mounted = true
    async function load(){
      if (!user) { setLoading(false); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (mounted) { setProfile(data); setLoading(false) }
    }
    load()
    return ()=>{ mounted = false }
  }, [user])

  async function uploadAvatar(file: File){
    if (!user) throw new Error('Not authenticated')
    const path = `avatars/${user.id}/${Date.now()}-${file.name}`
    const bucket = 'avatars'
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: '3600', upsert: true })
    if (error) throw error
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path)
    return urlData.publicUrl
  }

  async function handleSave(e: React.FormEvent){
    e.preventDefault()
    if (!user) return
    setSaving(true); setMessage(null)
    try {
      let avatarUrl = profile?.avatar
      if (avatarFile){
        avatarUrl = await uploadAvatar(avatarFile)
      }
      const payload = {
        id: user.id,
        email: profile?.email || user.email,
        full_name: profile?.full_name || '',
        avatar: avatarUrl,
        updated_at: new Date().toISOString()
      }
      const { error } = await supabase.from('profiles').upsert(payload)
      if (error) throw error
      setMessage('Profile saved')
    } catch (err: any){
      setMessage(err.message || 'Failed to save profile')
    } finally { setSaving(false) }
  }

  async function handleDeleteAccount(){
    // Implement a server-side account deletion flow. Here we only sign out and show a message.
    // Real deletion must be performed server-side with service role key.
    await signOut()
    setMessage('Account deletion requested. Please contact support to complete deletion in this scaffold.')
  }

  if (loading) return <div className="p-6">Loading settings...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold">Settings</h2>

      <form onSubmit={handleSave} className="mt-4 space-y-4">
        <section>
          <h3 className="font-medium">Profile</h3>
          <div className="mt-2 grid grid-cols-1 gap-3">
            <label className="text-sm">Full name</label>
            <input value={profile?.full_name||''} onChange={e=>setProfile({...profile, full_name: e.target.value})} className="w-full px-3 py-2 rounded border bg-white dark:bg-slate-800" />

            <label className="text-sm">Email</label>
            <input value={profile?.email||''} disabled className="w-full px-3 py-2 rounded border bg-slate-100 dark:bg-slate-700" />

            <label className="text-sm">Avatar</label>
            <input type="file" accept="image/*" onChange={e=>setAvatarFile(e.target.files?.[0]||null)} />
          </div>
        </section>

        <section>
          <h3 className="font-medium">Preferences</h3>
          <div className="mt-2 grid grid-cols-1 gap-3">
            <label className="text-sm">Theme</label>
            <select className="w-full px-3 py-2 rounded" value={(profile?.theme) || 'system'} onChange={e=>setProfile({...profile, theme: e.target.value})}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>

            <label className="text-sm">Default voice</label>
            <input className="w-full px-3 py-2 rounded" value={profile?.default_voice||''} onChange={e=>setProfile({...profile, default_voice: e.target.value})} placeholder="e.g., en-US-Wavenet-D" />

            <label className="text-sm">Default subtitle language</label>
            <input className="w-full px-3 py-2 rounded" value={profile?.default_subtitle_lang||''} onChange={e=>setProfile({...profile, default_subtitle_lang: e.target.value})} placeholder="e.g., en" />

            <label className="text-sm">Translation style</label>
            <select className="w-full px-3 py-2 rounded" value={profile?.translation_style||'natural'} onChange={e=>setProfile({...profile, translation_style: e.target.value})}>
              <option value="natural">Natural (movie-style)</option>
              <option value="literal">Literal</option>
              <option value="concise">Concise</option>
            </select>
          </div>
        </section>

        <section>
          <h3 className="font-medium">Account</h3>
          <div className="mt-2 space-y-2">
            <button type="button" onClick={async ()=>{ await signOut(); window.location.href = '/' }} className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-700">Logout</button>
            <button type="button" onClick={handleDeleteAccount} className="px-3 py-2 rounded bg-red-600 text-white">Request account deletion</button>
          </div>
        </section>

        <div>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-violet-600 text-white">{saving ? 'Saving...' : 'Save changes'}</button>
        </div>

        {message && <div className="mt-2 text-sm text-green-600">{message}</div>}
      </form>
    </div>
  )
}
