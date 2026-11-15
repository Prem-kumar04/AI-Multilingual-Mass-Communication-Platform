import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Radio,
  Globe,
  Lock,
  PhoneCall,
  Search,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Share2,
  AlertTriangle,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const getDashboardPath = () => {
    if (!user) return '/login';
    const roleNames = user.roles.map((r) => r.name.toUpperCase());
    if (roleNames.includes('ADMIN')) return '/admin/dashboard';
    if (roleNames.includes('COMMUNICATION_TEAM')) return '/comm/dashboard';
    return '/manager/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* ── Official Civic Header ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-xs">
        {/* Subtle Civic Tricolor Bar */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600"></div>

        {/* Top Emergency / Live Notice Marquee */}
        <div className="bg-emerald-900 text-emerald-100 text-[11px] sm:text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 overflow-hidden truncate">
              <span className="flex-shrink-0 inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-700 text-white font-bold text-[10px] tracking-wider uppercase">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-300" />
                <span>Live Portal</span>
              </span>
              <span className="truncate text-emerald-100">
                Official Citizen Information Service &bull; All notices are verified and cleared by authorized communication authorities.
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-emerald-200 text-xs flex-shrink-0">
              <span className="flex items-center space-x-1">
                <PhoneCall className="w-3 h-3 text-emerald-300" />
                <span>National Emergency: <strong className="text-white">112</strong></span>
              </span>
              <span>&bull;</span>
              <span>Health Helpline: <strong className="text-white">1075</strong></span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Left: Emblem & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-800 transition-colors flex-shrink-0">
              <Building2 className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg font-serif font-bold text-slate-900 leading-tight">
                  Public Information Portal
                </span>
                <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Multilingual Awareness Advisories Distributed via WhatsApp, SMS & Email
              </p>
            </div>
          </Link>

          {/* Desktop Right Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/"
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                location.pathname === '/' || location.pathname === '/public'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Advisories
            </Link>

            <a
              href="#verify-section"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              Verify Announcement
            </a>

            <a
              href="#helpline-section"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              Helplines
            </a>

            {/* Language Selector Dropdown */}
            <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white">
              <Globe className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1"
                aria-label="Select Portal Display Language"
              >
                <option value="English">English</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                <option value="Malayalam">മലയാളം (Malayalam)</option>
                <option value="Marathi">मराठी (Marathi)</option>
                <option value="Bengali">বাংলা (Bengali)</option>
              </select>
            </div>

            {/* Auth Link (Staff Portal) */}
            {isAuthenticated ? (
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <span>Staff Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-colors bg-white hover:bg-slate-50"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Staff Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <Link
              to="/login"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
              title="Sign in"
            >
              <Lock className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-fade-in shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-800 py-1.5 px-3 rounded-lg hover:bg-slate-50"
            >
              All Public Advisories
            </Link>
            <a
              href="#verify-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-800 py-1.5 px-3 rounded-lg hover:bg-slate-50"
            >
              Verify Announcement
            </a>
            <a
              href="#helpline-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-800 py-1.5 px-3 rounded-lg hover:bg-slate-50"
            >
              Emergency Helplines
            </a>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Language:</span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white font-medium text-slate-800"
              >
                <option value="English">English</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                <option value="Malayalam">മലയാളം (Malayalam)</option>
                <option value="Marathi">मराठी (Marathi)</option>
                <option value="Bengali">বাংলা (Bengali)</option>
              </select>
            </div>

            <div className="pt-2">
              {isAuthenticated ? (
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center block py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Go to Staff Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center block py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold"
                >
                  Staff Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1">
        <Outlet context={{ portalLanguage: selectedLanguage }} />
      </main>

      {/* ── Civic Footer ── */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: About */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  PI
                </div>
                <span className="font-serif font-bold text-sm text-white">
                  Public Information Portal
                </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Official informational repository for public awareness campaigns broadcasted to citizens across WhatsApp, SMS, and Email.
              </p>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Public Communications</span>
              </div>
            </div>

            {/* Col 2: Emergency Helplines */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Emergency Helplines
              </p>
              <ul className="space-y-1.5 text-slate-400">
                <li><strong className="text-white">112</strong> &ndash; National Emergency Support</li>
                <li><strong className="text-white">1075</strong> &ndash; National Health Helpline</li>
                <li><strong className="text-white">1070</strong> &ndash; National Disaster Management</li>
                <li><strong className="text-white">1091</strong> &ndash; Women Helpline</li>
                <li><strong className="text-white">1098</strong> &ndash; Childline India</li>
              </ul>
            </div>

            {/* Col 3: Languages Supported */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Regional Languages
              </p>
              <p className="text-slate-400 leading-relaxed text-xs">
                English &bull; తెలుగు (Telugu) &bull; हिन्दी (Hindi) &bull; தமிழ் (Tamil) &bull; ಕನ್ನಡ (Kannada) &bull; മലയാളം (Malayalam) &bull; मराठी (Marathi) &bull; বাংলা (Bengali)
              </p>
              <p className="text-slate-500 text-[11px] pt-1">
                AI translation verified by human review teams before public dispatch.
              </p>
            </div>

            {/* Col 4: Quick Links & Staff Access */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Platform Access
              </p>
              <ul className="space-y-1.5">
                <li>
                  <Link to="/login" className="hover:text-emerald-400 transition-colors">
                    Authorized Staff Login &rarr;
                  </Link>
                </li>
                <li>
                  <a href="#verify-section" className="hover:text-emerald-400 transition-colors">
                    Verify Advisory Authenticity
                  </a>
                </li>
                <li>
                  <a href="#helpline-section" className="hover:text-emerald-400 transition-colors">
                    State & District Helplines
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-2">
            <p>&copy; {new Date().getFullYear()} National Public Information & Civic Awareness Portal. All rights reserved.</p>
            <p>Developed as part of the Multilingual Mass Communication Platform Initiative.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
