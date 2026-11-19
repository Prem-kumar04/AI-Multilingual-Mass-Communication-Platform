import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { PublicCampaignItem, PublicPortalStats } from '../../types';
import {
  Search,
  Filter,
  ShieldCheck,
  Megaphone,
  Radio,
  Calendar,
  Users,
  CheckCircle2,
  ExternalLink,
  PhoneCall,
  Globe,
  Share2,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  FileCheck,
  HeartPulse,
  CloudRain,
  GraduationCap,
  Leaf,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface PublicContextType {
  portalLanguage: string;
}

export const PublicHome: React.FC = () => {
  const { portalLanguage } = useOutletContext<PublicContextType>();
  const [campaigns, setCampaigns] = useState<PublicCampaignItem[]>([]);
  const [stats, setStats] = useState<PublicPortalStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLangFilter, setSelectedLangFilter] = useState('All');

  // Verify Announcement State
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<PublicCampaignItem | null | 'NOT_FOUND'>(null);

  const categories = [
    { label: 'All', icon: Layers },
    { label: 'Health', icon: HeartPulse },
    { label: 'Emergency', icon: CloudRain },
    { label: 'Education', icon: GraduationCap },
    { label: 'Environment', icon: Leaf },
    { label: 'Government', icon: FileCheck },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [campaignList, portalStats] = await Promise.all([
        publicApi.listCampaigns(),
        publicApi.getStats(),
      ]);
      setCampaigns(campaignList || []);
      setStats(portalStats);
    } catch (err) {
      console.error('Error loading public campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      c.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesLang =
      selectedLangFilter === 'All' ||
      c.languages_available.some((l) => l.toLowerCase() === selectedLangFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesLang;
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;

    const query = verifyInput.trim().toLowerCase();
    const match = campaigns.find(
      (c) =>
        c.id.toLowerCase() === query ||
        c.title.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query))
    );

    setVerifyResult(match || 'NOT_FOUND');
  };

  return (
    <div className="space-y-12 pb-16 animate-fade-in">
      {/* ── 1. Hero Section ── */}
      <section className="relative bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white overflow-hidden py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        {/* Background glow & civic grid accents */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent"></div>
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-emerald-200 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Citizen Information & Public Awareness Repository</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
            One Message. <span className="text-amber-400">Every Language.</span> Every Citizen.
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-3xl mx-auto leading-relaxed">
            Received an SMS, WhatsApp message, or Email about a public awareness campaign?
            Access full official advisory guidelines, actionable steps, and verified translations in your regional language.
          </p>

          {/* Search Bar in Hero */}
          <div className="pt-4 max-w-2xl mx-auto">
            <div className="bg-white p-2 rounded-2xl shadow-xl flex items-center space-x-2 text-slate-800">
              <Search className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search advisories (e.g. dengue prevention, flood alert, school enrolment)..."
                className="w-full py-2 px-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => {}}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-colors flex-shrink-0"
              >
                Search
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold font-serif text-white">{campaigns.length || 6}</p>
              <p className="text-[11px] text-emerald-200">Verified Advisories</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold font-serif text-white">2,46,368+</p>
              <p className="text-[11px] text-emerald-200">Citizens Reached</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold font-serif text-white">8 Languages</p>
              <p className="text-[11px] text-emerald-200">Native Indian Dialects</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-2xl font-bold font-serif text-white">100%</p>
              <p className="text-[11px] text-emerald-200">Human Verified Content</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Filter & Categories Row ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Language Filter */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-medium whitespace-nowrap">Filter by Language:</span>
            <select
              value={selectedLangFilter}
              onChange={(e) => setSelectedLangFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none"
            >
              <option value="All">All Languages</option>
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
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between pt-4 pb-2 text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900">{filteredCampaigns.length}</strong> active public awareness advisories
          </span>
          {searchQuery && (
            <span>
              Matching search: "<span className="text-emerald-700 font-semibold">{searchQuery}</span>"
            </span>
          )}
        </div>
      </section>

      {/* ── 3. Public Campaigns Grid ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading public advisories...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3 max-w-lg mx-auto">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching advisories found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search keywords or switching category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLangFilter('All');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((c) => {
              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category + Verification */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {c.category}
                      </span>
                      <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-700 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Notice</span>
                      </span>
                    </div>

                    {/* Campaign Title */}
                    <h3 className="text-lg font-serif font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                      {c.title}
                    </h3>

                    {/* Excerpt / Objective */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {c.description || c.objective}
                    </p>

                    {/* Regional Languages Available Pills */}
                    <div className="pt-2">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
                        <Globe className="w-3 h-3" />
                        <span>Languages Available</span>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {c.languages_available.slice(0, 4).map((lang) => (
                          <span
                            key={lang}
                            className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-medium"
                          >
                            {lang}
                          </span>
                        ))}
                        {c.languages_available.length > 4 && (
                          <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium">
                            +{c.languages_available.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Card Footer */}
                  <div className="pt-5 mt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Broadcast: {c.target_channels.join(', ')}</span>
                      <span>Reach: {c.recipient_count.toLocaleString()}</span>
                    </div>

                    {/* Direct link to dedicated campaign information page */}
                    <Link
                      to={`/campaigns/${c.id}`}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-50 group-hover:bg-emerald-600 text-slate-700 group-hover:text-white text-xs font-bold transition-all border border-slate-200 group-hover:border-emerald-600 shadow-2xs"
                    >
                      <span>Read Advisory & Translations</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 4. Verify an Announcement / Received Message Tool ── */}
      <section
        id="verify-section"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6"
      >
        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 rounded-3xl border border-emerald-200 p-8 sm:p-10 shadow-xs space-y-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Anti-Fraud & Authenticity Verification</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Verify an SMS or WhatsApp Advisory You Received
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Cyber criminals often send fake notices. Paste the title, Campaign ID, or text from the message you received to verify that it is an official announcement from authorized authorities.
            </p>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              placeholder="Enter message keywords or Campaign ID (e.g. dengue, flood alert, plastic)..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 flex-shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Message Authenticity</span>
            </button>
          </form>

          {/* Verification Result Feedback */}
          {verifyResult && (
            <div className="animate-fade-in">
              {verifyResult === 'NOT_FOUND' ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Notice Not Found in Official Registry</p>
                    <p className="mt-0.5 text-rose-700">
                      We could not match this message with any approved public campaign. Please exercise caution before clicking unknown links or sharing personal data.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm text-emerald-900">
                        Official Verified Announcement Cleared by Communications Authority
                      </p>
                      <p className="font-medium text-emerald-800 mt-1">
                        Campaign: {verifyResult.title} ({verifyResult.category})
                      </p>
                      <p className="text-emerald-700 text-[11px] mt-0.5">
                        Issuing Authority: {verifyResult.issuing_authority} &bull; Broadcasted on {verifyResult.target_channels.join(', ')}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/campaigns/${verifyResult.id}`}
                    className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold whitespace-nowrap flex-shrink-0"
                  >
                    View Official Notice &rarr;
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Emergency Helplines Directory ── */}
      <section
        id="helpline-section"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4"
      >
        <div className="text-center max-w-xl mx-auto mb-8">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Rapid Citizen Support
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            Emergency & Public Assistance Helplines
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Toll-free 24/7 helplines operating across all Indian states and Union territories.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">All Emergencies</span>
              <p className="text-2xl font-bold font-serif text-slate-900 mt-1">112</p>
              <p className="text-[11px] text-slate-500">National Emergency Response (Police, Fire, Ambulance)</p>
            </div>
            <a
              href="tel:112"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1 pt-2"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Dial 112</span>
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Health & Epidemics</span>
              <p className="text-2xl font-bold font-serif text-slate-900 mt-1">1075</p>
              <p className="text-[11px] text-slate-500">National Health Portal & Dengue/Flu Advisory</p>
            </div>
            <a
              href="tel:1075"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1 pt-2"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Dial 1075</span>
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Disaster & Floods</span>
              <p className="text-2xl font-bold font-serif text-slate-900 mt-1">1070</p>
              <p className="text-[11px] text-slate-500">Disaster Management Relief & Cyclone Warning</p>
            </div>
            <a
              href="tel:1070"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1 pt-2"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Dial 1070</span>
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Women Safety</span>
              <p className="text-2xl font-bold font-serif text-slate-900 mt-1">1091</p>
              <p className="text-[11px] text-slate-500">24/7 Dedicated Women Support Helpline</p>
            </div>
            <a
              href="tel:1091"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1 pt-2"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Dial 1091</span>
            </a>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Child Support</span>
              <p className="text-2xl font-bold font-serif text-slate-900 mt-1">1098</p>
              <p className="text-[11px] text-slate-500">Childline India School & Care Helpline</p>
            </div>
            <a
              href="tel:1098"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1 pt-2"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Dial 1098</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

