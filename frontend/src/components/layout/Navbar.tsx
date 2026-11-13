import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Radio } from 'lucide-react';

interface NavbarProps {
  roleTitle: string;
  roleColor?: string;
  accentColor?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  roleTitle,
  roleColor = 'bg-emerald-50 text-emerald-800 border-emerald-200',
  accentColor = '#059669',
}) => {
  const { user, logout } = useAuth();

  // Extract initials for avatar
  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Left: Brand / Section + Role Badge */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
            <Radio className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-800 text-sm hidden sm:inline tracking-tight">
            Institutional Communications Hub
          </span>
        </div>
        <span className="text-slate-300 hidden sm:inline">|</span>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${roleColor}`}
        >
          {roleTitle}
        </span>
      </div>

      {/* Right: User info + logout */}
      <div className="flex items-center space-x-4">
        {/* User info */}
        <div className="hidden md:flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.full_name || 'Authorized Official'}
            </p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          {/* Avatar circle */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-emerald-600 shadow-sm shadow-emerald-200"
          >
            {initials}
          </div>
        </div>

        {/* Mobile avatar */}
        <div
          className="flex md:hidden w-9 h-9 rounded-full items-center justify-center text-white text-xs font-bold bg-emerald-600 shadow-sm shadow-emerald-200"
        >
          {initials}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 hidden md:block" />

        {/* Logout */}
        <button
          onClick={logout}
          title="Sign Out"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
