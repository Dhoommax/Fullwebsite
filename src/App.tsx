import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/index'
import Dashboard from './pages/dashboard'
import Admin from './pages/admin'
import Voice from './pages/voice'
import Subtitles from './pages/subtitles'
import Video from './pages/video'
import Songs from './pages/songs'
import AuthPage from './pages/auth'
import Layout from './components/Layout'

export default function App(){
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/auth" element={<AuthPage/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/admin" element={<Admin/>} />
          <Route path="/voice" element={<Voice/>} />
          <Route path="/subtitles" element={<Subtitles/>} />
          <Route path="/video" element={<Video/>} />
          <Route path="/songs" element={<Songs/>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
