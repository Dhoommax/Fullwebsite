/**
 * Enhanced auth hook with profile loading and basic flows.
 * Keeps guest mode and exposes role in profile when available.
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
    let mounted = true
    ;(async ()=>{
      setLoading(true)
      try {
        const sessionRes = await supabase.auth.getSession()
        const session = sessionRes.data.session
        if (session?.user){
          const id = session.user.id
          // fetch profile from profiles table
          const { data } = await supabase.from('profiles').select('id, email, full_name, avatar, role').eq('id', id).maybeSingle()
          if (mounted) {
            if (data) {
              setUser(data as UserProfile)
              setGuest(false)
            } else {
              // user signed in but profile row missing — set minimal
              setUser({ id, email: session.user.email })
              setGuest(false)
            }
          }
        } else {
          if (mounted) {
            setUser(null)
            setGuest(true)
          }
        }
      } catch (err){
        console.warn('useAuth init error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user){
        const id = session.user.id
        const { data } = await supabase.from('profiles').select('id, email, full_name, avatar, role').eq('id', id).maybeSingle()
        if (data) setUser(data as UserProfile)
        else setUser({ id, email: session.user.email })
        setGuest(false)
      } else {
        setUser(null)
        setGuest(true)
      }
    })

    return ()=>{ listener?.subscription?.unsubscribe?.() ; mounted = false }
  }, [])

  const signInWithMagicLink = useCallback(async (email: string) => {
    setLoading(true)
    const res = await supabase.auth.signInWithOtp({ email })
    setLoading(false)
    return res
  }, [])

  const signUp = useCallback(async (email: string, password: string | undefined) => {
    setLoading(true)
    // supabase.signUp can accept password or OAuth; here we call signUp
    const res = await supabase.auth.signUp({ email, password })
    setLoading(false)
    return res
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setLoading(true)
    const res = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    return res
  }, [])

  const signOut = useCallback(async ()=>{
    await supabase.auth.signOut()
    setUser(null)
    setGuest(true)
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    setLoading(true)
    const res = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/auth' })
    setLoading(false)
    return res
  }, [])

  return { user, loading, guest, setGuest, signInWithMagicLink, signUp, signInWithPassword, signOut, sendPasswordReset }
}
