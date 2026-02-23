import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Decks from './pages/Decks'
import DeckDetails from './pages/DeckDetails'
import Study from './pages/Study'
import Generate from './pages/Generate'
import Progress from './pages/Progress'
import Settings from './pages/Settings'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { session, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080F1E] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#1A6BFF]/20 rounded-full animate-spin border-t-[#1A6BFF]"></div>
            </div>
        )
    }

    if (!session) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/cadastro" element={<Cadastro />} />

                    {/* App Routes with Sidebar Layout - PROTECTED */}
                    <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                    <Route path="/decks" element={<ProtectedRoute><Layout><Decks /></Layout></ProtectedRoute>} />
                    <Route path="/decks/:id" element={<ProtectedRoute><Layout><DeckDetails /></Layout></ProtectedRoute>} />
                    <Route path="/study/:id" element={<ProtectedRoute><Layout><Study /></Layout></ProtectedRoute>} />
                    <Route path="/generate" element={<ProtectedRoute><Layout><Generate /></Layout></ProtectedRoute>} />
                    <Route path="/progress" element={<ProtectedRoute><Layout><Progress /></Layout></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}

export default App
