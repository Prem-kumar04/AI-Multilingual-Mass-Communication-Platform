import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid,
  Megaphone,
  PlusCircle,
  Users,
  Filter,
  FileText,
  BarChart3,
  LogOut,
  RotateCcw,
  Radio,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

export const ManagerLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const workspaceItems = [
    { label: 'Overview', path: '/manager/dashboard', icon: LayoutGrid },
    { label: 'My Campaigns', path: '/manager/campaigns', icon: Megaphone },
    { label: 'Create Campaign', path: '/manager/campaigns/create', icon: PlusCircle },
    { label: 'Audience Directory', path: '/manager/audiences', icon: Users },
  ];

  const operationsItems = [
    { label: 'Audience Segments', path: '/manager/segments', icon: Filter },
    { label: 'Message Templates', path: '/manager/templates', icon: FileText },
    { label: 'Campaign Reports', path: '/manager/reports', icon: BarChart3 },
  ];

  const handleRefresh = () => {
    window.location.reload();
  };

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'MG';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-[#0a2018] border-b border-emerald-950 px-4 py-3 flex items-center justify-between sticky top-0 z-40 text-white">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#13382c] border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-bold">Workspace</p>
            <p className="text-sm font-bold text-white leading-tight">Campaign Preparation</p>
          </div>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl text-emerald-200 hover:bg-[#13382c]"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar matching reference */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#0a2018] border-r border-emerald-950 flex flex-col justify-between z-50 transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Workspace Switcher */}
          <div className="p-3 rounded-2xl bg-[#13382c] border border-emerald-800/40 mb-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/70">
                  Workspace
                </p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] animate-pulse"></span>
                  <span className="text-sm font-bold text-white tracking-tight">
                    Campaign Studio
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-emerald-400/70" />
            </div>
          </div>

          {/* Group 1: Workspace */}
          <div className="space-y-1 mb-6">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-400/60 mb-2">
              Workspace
            </p>
            {workspaceItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                    isActive
                      ? 'bg-[#153e31] text-white font-bold shadow-xs'
                      : 'text-emerald-100/75 hover:text-white hover:bg-emerald-900/30'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-emerald-300/70'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute right-0 top-1.5 bottom-1.5 w-1.5 rounded-l-full bg-emerald-400"></span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Group 2: Operations */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-emerald-400/60 mb-2">
              Operations
            </p>
            {operationsItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all relative ${
                    isActive
                      ? 'bg-[#153e31] text-white font-bold shadow-xs'
                      : 'text-emerald-100/75 hover:text-white hover:bg-emerald-900/30'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-emerald-300/70'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute right-0 top-1.5 bottom-1.5 w-1.5 rounded-l-full bg-emerald-400"></span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-emerald-950 bg-[#071610]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#102e24] border border-emerald-800/40 shadow-xs">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {user?.full_name || 'Campaign Manager'}
                </p>
                <p className="text-[11px] text-emerald-300/70 truncate">
                  {user?.email || 'manager@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-emerald-400/70 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Campaign Manager
            </span>
            <span className="text-xs text-slate-400">Content Authoring & Multilingual Drafting</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh data</span>
            </button>
          </div>
        </header>

        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
        ></div>
      )}
    </div>
  );
};
