import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { Database, Trophy, Flame, LayoutDashboard, Medal, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { progress } = useProgress();
  const loc = useLocation();
  if (!user) return null;

  const xp = user?.xp || 0;
  const streak = user?.streak || 0;

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/leaderboard', label: 'Leaderboard', icon: Medal },
    { to: '/profile', label: 'Profile', icon: Trophy },
  ];

  return (
    <nav className="border-b border-borderLine bg-surface/60 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/tribase-logo.png" alt="Tribase" className="w-7 h-7 rounded-md object-cover" />
          <span className="text-lg font-display font-bold" style={{ background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Tribase</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                loc.pathname === to ? 'bg-surface text-white' : 'text-gray-400 hover:text-white hover:bg-surface/50'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-300">{streak}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-borderLine">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-mono font-bold text-white">{xp} XP</span>
          </div>
          <Link to="/profile">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </Link>
          <button onClick={logout} title="Logout"
            className="p-1.5 text-gray-500 hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
