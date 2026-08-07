import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

const Home = lazy(() => import('./pages/index'))
const AuthPage = lazy(() => import('./pages/auth'))
const Dashboard = lazy(() => import('./pages/dashboard'))
const Settings = lazy(() => import('./pages/settings'))
const Voice = lazy(() => import('./pages/voice'))
const Subtitles = lazy(() => import('./pages/subtitles'))
const Video = lazy(() => import('./pages/video'))
const Songs = lazy(() => import('./pages/songs'))
const Admin = lazy(() => import('./pages/admin'))
const AdminSettings = lazy(() => import('./pages/admin/settings'))

export default function App(){
  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home/>} />
            <Route path="/auth" element={<AuthPage/>} />

            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/voice" element={<Voice />} />
              <Route path="/subtitles" element={<Subtitles />} />
              <Route path="/video" element={<Video />} />
              <Route path="/songs" element={<Songs />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  )
}
