import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function Settings(){
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(()=>{
    let mounted = true
    async function load(){
      if (!user) return setLoading(false)
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (mounted) {
        setProfile(data)
        setLoading(false)
      }
    }
    load()
    return ()=>{ mounted = false }
  }, [user])

  if (loading) return <div className="p-6">Loading settings...</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold">Settings</h2>
      <section className="mt-4">
        <h3 className="font-medium">Profile</h3>
        <p className="text-sm text-slate-500">Full name: {profile?.full_name || '—'}</p>
        <p className="text-sm text-slate-500">Email: {profile?.email || '—'}</p>
      </section>

      <section className="mt-4">
        <h3 className="font-medium">Preferences</h3>
        <p className="text-sm text-slate-500">Theme: (switcher to be implemented)</p>
        <p className="text-sm text-slate-500">Default voice / subtitle preferences: (to be implemented)</p>
      </section>

      <section className="mt-4">
        <h3 className="font-medium">Account</h3>
        <p className="text-sm text-slate-500">Logout and account deletion flows are available via Supabase auth and server-side endpoints.</p>
      </section>
    </div>
  )
}
