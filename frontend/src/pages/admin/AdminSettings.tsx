import React, { useState } from 'react';
import {
  Key,
  Radio,
  Shield,
  Save,
  CheckCircle2,
  Sparkles,
  Server,
  Sliders,
  Building,
  RotateCcw,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState(true);
  const [whatsappStatus, setWhatsappStatus] = useState(true);
  const [smsStatus, setSmsStatus] = useState(true);
  const [emailStatus, setEmailStatus] = useState(true);

  // Editable system settings form state
  const [workspaceName, setWorkspaceName] = useState('Public Awareness');
  const [defaultLanguage, setDefaultLanguage] = useState('English');
  const [senderId, setSenderId] = useState('GOVT-INFO');
  const [batchLimit, setBatchLimit] = useState('50000');
  const [aiTemperature, setAiTemperature] = useState('0.3');
  const [retentionDays, setRetentionDays] = useState('180');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  const handleReset = () => {
    setWorkspaceName('Public Awareness');
    setDefaultLanguage('English');
    setSenderId('GOVT-INFO');
    setBatchLimit('50000');
    setAiTemperature('0.3');
    setRetentionDays('180');
    setGeminiStatus(true);
    setWhatsappStatus(true);
    setSmsStatus(true);
    setEmailStatus(true);
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            System Operations
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Settings & Integrations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure platform parameters, AI model connections, and multi-channel dispatch gateways.
          </p>
        </div>

        {saved && (
          <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Settings saved successfully.</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── Section 1: General Platform & Workspace Settings ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Workspace & Dispatch Defaults
              </h2>
              <p className="text-xs text-slate-400">
                Administrative parameters applied to all campaigns and distribution tasks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-sm">
            {/* Workspace Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Workspace Title
              </label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="Workspace name"
                required
              />
            </div>

            {/* Default Primary Language */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Default Primary Language
              </label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
                <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                <option value="Malayalam">Malayalam (മലയാളം)</option>
                <option value="Marathi">Marathi (मराठी)</option>
                <option value="Bengali">Bengali (বাংলা)</option>
              </select>
            </div>

            {/* Official Sender ID / DLT Header */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sender Header / DLT ID
              </label>
              <input
                type="text"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                placeholder="GOVT-INFO"
                required
              />
            </div>

            {/* Distribution Batch Limit */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Max Recipients Per Batch
              </label>
              <input
                type="number"
                value={batchLimit}
                onChange={(e) => setBatchLimit(e.target.value)}
                min="1000"
                max="500000"
                step="1000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                required
              />
            </div>

            {/* AI Drafting Temperature */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                AI Hallucination Guard (Temperature: {aiTemperature})
              </label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={aiTemperature}
                onChange={(e) => setAiTemperature(e.target.value)}
                className="w-full accent-emerald-600 mt-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0.0 (Strict factual)</span>
                <span>0.5 (Balanced)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            {/* Audit Log Retention */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Compliance Retention (Days)
              </label>
              <input
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(e.target.value)}
                min="30"
                max="3650"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                required
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: AI Provider Configuration ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                AI Content & Multilingual Translation Engines
              </h2>
              <p className="text-xs text-slate-400">
                LLM providers powering content generation and automated Indian language translations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Gemini Card */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Google Gemini API</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active in .env
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Primary regional translation and content drafting engine covering 8 Indian languages (Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, Bengali, English).
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Model tier: Gemini 2.5 Flash</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={geminiStatus}
                    onChange={(e) => setGeminiStatus(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* OpenAI API Fallback */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">OpenAI API (Fallback)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Standby
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Secondary LLM failover gateway for tone refinement, grammar enhancements, and multi-format adaptations.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">Model tier: GPT-4o-mini</span>
                <span className="text-[11px] text-slate-500 font-medium">Ready on demand</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 3: Communication Gateways ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Multi-Channel Communication Gateways
              </h2>
              <p className="text-xs text-slate-400">
                Outbound notification adapters, rate limits, and provider integration status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* WhatsApp */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">WhatsApp Business</p>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-xs text-slate-500">
                Meta Cloud API Adapter for verified templates and interactive regional messaging.
              </p>
              <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-200/60">
                <span className="text-slate-400">Rate Limit</span>
                <span className="font-semibold text-slate-700">80 msg/sec</span>
              </div>
            </div>

            {/* National SMS */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">National SMS (DLT)</p>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-xs text-slate-500">
                Telecom DLT certified messaging route for priority emergency and public advisories.
              </p>
              <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-200/60">
                <span className="text-slate-400">Rate Limit</span>
                <span className="font-semibold text-slate-700">150 msg/sec</span>
              </div>
            </div>

            {/* Gov Email SMTP */}
            <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">Official Gov Email</p>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-xs text-slate-500">
                Secure SMTP Relay cluster with TLS encryption and DKIM/SPF domain verification.
              </p>
              <div className="pt-1 flex items-center justify-between text-xs border-t border-slate-200/60">
                <span className="text-slate-400">Rate Limit</span>
                <span className="font-semibold text-slate-700">100 msg/sec</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4: Platform Governance & Security ── */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Platform Governance & Security
              </h2>
              <p className="text-xs text-slate-400">
                Cryptographic session parameters, role boundaries, and audit logging.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block mb-1">Session Token Lifetime</span>
              <span className="text-sm font-bold text-slate-900">24 Hours (JWT HS256)</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block mb-1">Database Mode</span>
              <span className="text-sm font-bold text-slate-900">PostgreSQL 18 (Local)</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block mb-1">Auditing Policy</span>
              <span className="text-sm font-bold text-slate-900">Strict Append-Only</span>
            </div>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
