import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Mic, Image, BarChart3, Home, Brain } from 'lucide-react'
import { Toaster } from 'react-hot-toast'

// Import pages (we'll create these next)
import HomePage from './pages/HomePage'
import AudioAnalysis from './pages/AudioAnalysis'
import ImageAnalysis from './pages/ImageAnalysis'
import MultiModal from './pages/MultiModal'

function Navigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home', color: 'blue' },
    { path: '/audio', icon: Mic, label: 'Audio', color: 'green' },
    { path: '/image', icon: Image, label: 'Image', color: 'purple' },
    { path: '/multimodal', icon: Brain, label: 'Multi-Modal', color: 'orange' },
  ]

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Emotion AI
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                    isActive
                      ? `bg-gradient-to-r from-${item.color}-100 to-${item.color}-50 text-${item.color}-700 border border-${item.color}-200 shadow-md`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navigation />
        
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="animate-fadeIn">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/audio" element={<AudioAnalysis />} />
              <Route path="/image" element={<ImageAnalysis />} />
              <Route path="/multimodal" element={<MultiModal />} />
            </Routes>
          </div>
        </main>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            },
            success: {
              style: {
                background: 'linear-gradient(135deg, #48cc6c 0%, #43a047 100%)',
              },
            },
            error: {
              style: {
                background: 'linear-gradient(135deg, #ff6b6b 0%, #e53e3e 100%)',
              },
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
