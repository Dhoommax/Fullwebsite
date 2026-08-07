import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'

export default function AdminRoute(){
  const { user, loading } = useAuth()
  const location = useLocation()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(()=>{
    let mounted = true
    async function checkRole(){
      if (!user) return setIsAdmin(false)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle()
        if (error) throw error
        if (mounted) setIsAdmin((data as any)?.role === 'admin')
      } catch (err) {
        console.warn('failed to verify admin role', err)
        if (mounted) setIsAdmin(false)
      }
    }
    checkRole()
    return ()=>{ mounted = false }
  }, [user])

  if (loading || isAdmin === null) return <div className="p-6">Checking privileges...</div>
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />
  if (!isAdmin) return <div className="p-6">Access denied — admin only.</div>

  return <Outlet />
}
