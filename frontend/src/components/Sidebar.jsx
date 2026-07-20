import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, PhoneCall, Star, Zap, LogOut, History, User, X
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import logo from '../logo.png';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/calls',     icon: PhoneCall,       label: 'Calls' },
  { path: '/reviews',   icon: Star,            label: 'Reviews' },
  { path: '/analyze',   icon: Zap,             label: 'Analyze' },
  { path: '/history',   icon: History,         label: 'History' },
];

function Sidebar({ isOpen = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [user, setUser]       = useState(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        // Get profile from user_profiles table
        supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setProfile(data));
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <>
      {/* Mobile/tablet backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      <div
        className={`
          fixed lg:static top-0 left-0 z-50
          w-64 h-screen bg-[#0d1117] border-r border-white/10 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="CallSense AI"
              className="w-9 h-9 rounded-xl object-cover shadow-lg"
            />
            <div>
              <h1 className="text-white font-bold text-sm">CallSense AI</h1>
              <p className="text-white/40 text-xs">Sales Intelligence</p>
            </div>
          </div>
          {/* Close button — mobile/tablet only */}
          <button
            onClick={onClose}
            className="lg:hidden text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {/* Admin only */}
          {isAdmin && (
            <div className="pt-2 mt-2 border-t border-white/10">
              <p className="text-white/20 text-xs px-3 mb-2">Admin</p>
              <NavLink
                to="/users"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <User size={18} />
                Users
              </NavLink>
            </div>
          )}
        </nav>

        {/* Bottom — User Info + Logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-white/40 text-xs truncate">
                {profile?.company_or_organization || user?.email || ''}
              </p>
              {isAdmin && (
                <span className="text-indigo-400 text-xs font-medium">Admin</span>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>

      </div>
    </>
  );
}

export default Sidebar;
