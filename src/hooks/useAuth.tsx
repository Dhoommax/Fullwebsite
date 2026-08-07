/**
 * Auth hook: a lightweight wrapper around Supabase auth features.
 * - Provides guest mode state
 * - Exposes login/register/logout helpers (declarative; integration points)
 */

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'

export type UserProfile = {
  id: string
  email?: string | null
  full_name?: string | null
  avatar?: string | null
  role?: 'user' | 'admin'
}

export function useAuth(){
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [guest, setGuest] = useState<boolean>(true)

  useEffect(()=>{
    // initial check
    const session = supabase.auth.getSession()
    // getSession returns a promise; handle it
    session.then(res => {
      // If there's a user session, fetch profile
      const s = res.data.session
      if (s?.user){
        // TODO: fetch profile row from profiles table on server
        setUser({ id: s.user.id, email: s.user.email })
        setGuest(false)
      } else {
        setGuest(true)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user){
        setUser({ id: session.user.id, email: session.user.email })
        setGuest(false)
      } else {
        setUser(null)
        setGuest(true)
      }
    })

    return ()=>{ listener?.subscription?.unsubscribe?.() }
  }, [])

  const signInWithEmail = useCallback(async (email: string) => {
    setLoading(true)
    const res = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    return res
  }, [])

  const signOut = useCallback(async ()=>{
    await supabase.auth.signOut()
    setUser(null)
    setGuest(true)
  }, [])

  return { user, loading, guest, setGuest, signInWithEmail, signOut }
}
