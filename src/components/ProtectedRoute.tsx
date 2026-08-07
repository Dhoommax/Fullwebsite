import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute(){
  const { user, loading, guest } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="p-6">Checking authentication...</div>
  }

  // Allow guest users to access, but redirect to /auth when action requires auth
  // Here we treat routes under ProtectedRoute as requiring a logged-in user.
  if (!user || guest) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  return <Outlet />
}
