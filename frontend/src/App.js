import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { supabase } from './supabaseClient';

import Landing   from './pages/Landing';
import Login     from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register  from './pages/Register';
import Sidebar   from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Calls     from './pages/Calls';
import Reviews   from './pages/Reviews';
import Analyze   from './pages/Analyze';
import History   from './pages/History';
import './index.css';


function ProtectedRoute({ user, children }) {
  if (user === null) return <Navigate to="/login" />;
  if (user === undefined) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="text-white/40 text-sm animate-pulse">Loading...</div>
    </div>
  );
  return children;
}

function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden">
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar — hidden on lg+ where the sidebar is always visible */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#0d1117]">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="text-white font-semibold text-sm">CallSense AI</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" /> : <Login />
        } />
        <Route path="/register" element={
          user ? <Navigate to="/dashboard" /> : <Register />
        } />

        {/* Forgot Password Route */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Reset Password Route */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute user={user}>
            <DashboardLayout><Dashboard /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/calls" element={
          <ProtectedRoute user={user}>
            <DashboardLayout><Calls /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/reviews" element={
          <ProtectedRoute user={user}>
            <DashboardLayout><Reviews /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/analyze" element={
          <ProtectedRoute user={user}>
            <DashboardLayout><Analyze /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute user={user}>
            <DashboardLayout><History /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;