import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Languages,
  Send,
  Mail,
  Lock,
  CheckCircle2,
  HelpCircle,
  X,
  Radio,
} from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const redirectByRole = (roles: { name: string }[]) => {
    const names = roles.map((r) => r.name.toUpperCase());
    if (names.includes('ADMIN')) navigate('/admin/dashboard');
    else if (names.includes('COMMUNICATION_TEAM')) navigate('/comm/dashboard');
    else navigate('/manager/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      redirectByRole(user.roles);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          'Invalid email address or password. Please verify your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitted(true);
  };

  const closeForgotModal = () => {
    setIsForgotModalOpen(false);
    setForgotSubmitted(false);
    setForgotEmail('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* ── Top Subtle Bar ── */}
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-sm px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-800">
              Institutional Communications Hub
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Dual-Control Portal Online</span>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ── Left Column: Purpose & Platform Capabilities ── */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Mass Communication & Public Awareness</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Unified messaging for <span className="text-emerald-600">every citizen</span> and community.
              </h1>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                A centralized institutional portal designed to author public announcements, translate
                vital alerts across Indian regional languages, and coordinate verified multi-channel
                distribution with strict editorial governance.
              </p>
            </div>

            {/* Capability Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Send className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Multi-Channel Broadcast</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Disseminate via WhatsApp, SMS, Email, and Push notifications.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Languages className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Regional Translation</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bridge language divides across Telugu, Hindi, Tamil, Kannada, and more.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-emerald-300 transition-all group">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-bold text-slate-900">Dual-Control Clearance</h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Strict creator-to-reviewer verification ensuring vetted communication.
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Column: Login Card ── */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-100/80 p-7 sm:p-9 relative">
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Portal Sign In</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Enter your official credentials to access your designated workspace.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Official Email Address
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@organization.gov.in"
                      className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full pl-10 pr-11 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-white text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-sm shadow-emerald-600/30 hover:shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Credentials…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Security notice */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center space-x-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Protected institutional session with role-based cryptographic tokens.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-white py-4 px-6 text-center text-xs text-slate-400">
        Public Awareness & Multichannel Information Dissemination Gateway · Secure Institutional Access
      </footer>

      {/* ── Forgot Password Modal ── */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Password Recovery</h3>
              </div>
              <button
                onClick={closeForgotModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {forgotSubmitted ? (
                <div className="text-center py-4 space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Request Registered</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    If <span className="font-semibold text-slate-800">{forgotEmail}</span> corresponds to an authorized account, a password reset authorization notification has been dispatched to your system administrator.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={closeForgotModal}
                      className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      Return to Sign In
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Enter your official email address. For institutional security, reset authorizations are verified through platform administrative oversight.
                  </p>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="official@organization.gov.in"
                      className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={closeForgotModal}
                      className="w-1/2 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      Request Reset
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
