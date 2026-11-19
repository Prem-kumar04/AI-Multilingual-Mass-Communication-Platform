import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignsApi, audienceApi, templatesApi } from '../../services/api';
import { AudienceSegment, MessageTemplate } from '../../types';
import { AIContentModal } from '../../components/common/AIContentModal';
import {
  Send,
  Save,
  Layers,
  Users,
  Radio,
  Globe2,
  FileText,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES = [
  'Public Awareness',
  'Emergency Alerts',
  'Educational Notifications',
  'Healthcare Announcements',
  'Government Policy Updates',
  'Organizational Announcements',
];

const CHANNELS = [
  { id: 'WHATSAPP', label: 'WhatsApp Business API' },
  { id: 'SMS', label: 'SMS Gateway' },
  { id: 'EMAIL', label: 'Official Gov Email / SMTP' },
  { id: 'PUSH', label: 'Mobile Push Notifications' },
  { id: 'WEB_BROADCAST', label: 'Website Announcement Feed' },
];

const INDIAN_LANGUAGES = [
  'English',
  'Telugu',
  'Hindi',
  'Tamil',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Bengali',
];

export const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objective, setObjective] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [targetChannels, setTargetChannels] = useState<string[]>(['WHATSAPP', 'SMS']);
  const [primaryLanguage, setPrimaryLanguage] = useState('English');
  const [targetLanguages, setTargetLanguages] = useState<string[]>(['Telugu', 'Hindi']);
  const [selectedSegmentIds, setSelectedSegmentIds] = useState<string[]>([]);
  const [rawContent, setRawContent] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const handleApplyAIContent = (content: string, headline?: string) => {
    setRawContent(content);
    if (!title && headline) {
      setTitle(headline);
    }
  };

  useEffect(() => {
    const fetchPrereqs = async () => {
      try {
        const [segs, tmpls] = await Promise.all([
          audienceApi.getSegments(),
          templatesApi.list(),
        ]);
        setSegments(segs);
        setTemplates(tmpls);
      } catch (err) {
        console.error('Failed to load audience segments / templates', err);
      }
    };
    fetchPrereqs();
  }, []);

  const toggleChannel = (chId: string) => {
    if (targetChannels.includes(chId)) {
      setTargetChannels(targetChannels.filter((c) => c !== chId));
    } else {
      setTargetChannels([...targetChannels, chId]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (targetLanguages.includes(lang)) {
      setTargetLanguages(targetLanguages.filter((l) => l !== lang));
    } else {
      setTargetLanguages([...targetLanguages, lang]);
    }
  };

  const toggleSegment = (segId: string) => {
    if (selectedSegmentIds.includes(segId)) {
      setSelectedSegmentIds(selectedSegmentIds.filter((s) => s !== segId));
    } else {
      setSelectedSegmentIds([...selectedSegmentIds, segId]);
    }
  };

  const applyTemplate = (tmpl: MessageTemplate) => {
    setRawContent(tmpl.content);
    if (!title) setTitle(tmpl.title);
    if (tmpl.category && CATEGORIES.includes(tmpl.category)) {
      setCategory(tmpl.category);
    }
  };

  const totalEstimatedReach = selectedSegmentIds.reduce((sum, segId) => {
    const found = segments.find((s) => s.id === segId);
    return sum + (found ? found.estimated_reach : 0);
  }, 0);

  const handleSubmit = async (submitForReview: boolean) => {
    setError(null);
    if (!title.trim()) {
      setError('Campaign title is required.');
      return;
    }
    if (!objective.trim()) {
      setError('Campaign objective is required.');
      return;
    }
    if (targetChannels.length === 0) {
      setError('Please select at least one target communication channel.');
      return;
    }
    if (submitForReview && !rawContent.trim()) {
      setError('Campaign content is required before submitting for approval.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        objective,
        category,
        campaign_type: 'STANDARD',
        target_channels: targetChannels,
        primary_language: primaryLanguage,
        target_languages: targetLanguages,
        raw_content: rawContent,
        proposed_delivery_date: deliveryDate || undefined,
        proposed_delivery_time: deliveryTime || undefined,
        segment_ids: selectedSegmentIds,
      };

      const created = await campaignsApi.create(payload);

      if (submitForReview) {
        await campaignsApi.submit(created.id);
      }

      navigate(`/manager/campaigns/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create campaign.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Communication Campaign</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure objectives, demographic segments, multi-channel routes, and message content.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAIModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
          <span>✨ AI Content Assistant</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Campaign Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>1. General Campaign Information</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Monsoon Vector-Borne Disease Prevention Drive"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Campaign Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Primary Language *
                </label>
                <select
                  value={primaryLanguage}
                  onChange={(e) => setPrimaryLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {INDIAN_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Campaign Objective *
              </label>
              <textarea
                rows={2}
                required
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Specify the target public outcome, behavioral change, or emergency alert goal..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section 2: Channels & Multilingual Scope */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Radio className="w-5 h-5 text-blue-600" />
              <span>2. Delivery Channels & Target Indian Languages</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Select Proposed Channels
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => toggleChannel(ch.id)}
                    className={`flex items-center space-x-2.5 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      targetChannels.includes(ch.id)
                        ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        targetChannels.includes(ch.id)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {targetChannels.includes(ch.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span>{ch.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                Target Regional Indian Languages (for AI Translation in Milestone 2)
              </label>
              <div className="flex flex-wrap gap-2">
                {INDIAN_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      targetLanguages.includes(lang)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Content Message */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>3. Communication Content</span>
              </h2>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all hover:shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Generate with AI</span>
                </button>
                <span className="text-xs text-slate-400">
                  {rawContent.length} characters
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Original Message Body (English / Base) *
              </label>
              <textarea
                rows={5}
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                placeholder="Draft your public broadcast message or select a template from the right panel..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Proposed Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Proposed Delivery Time
                </label>
                <input
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audience & Templates Sidebar */}
        <div className="space-y-6">
          {/* Audience Segments Picker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Target Audiences</span>
              </h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Reach: {totalEstimatedReach.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
              {segments.length === 0 ? (
                <p className="text-xs text-slate-400">No audience segments defined.</p>
              ) : (
                segments.map((seg) => (
                  <div
                    key={seg.id}
                    onClick={() => toggleSegment(seg.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedSegmentIds.includes(seg.id)
                        ? 'bg-blue-50 border-blue-400 text-blue-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{seg.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {seg.estimated_reach} contacts
                      </span>
                    </div>
                    {seg.description && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {seg.description}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Template Picker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Insert Pre-Approved Template</span>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {templates.length === 0 ? (
                <p className="text-xs text-slate-400">No templates found.</p>
              ) : (
                templates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => applyTemplate(tmpl)}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-xs cursor-pointer transition-all"
                  >
                    <p className="font-semibold text-slate-800">{tmpl.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{tmpl.category}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white">Campaign Submission</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Submitting for approval locks the campaign and places it in the Communication Team verification queue.
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit(true)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold shadow transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Submit for Approval</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit(false)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Save as Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AIContentModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        campaignName={title}
        campaignObjective={objective}
        targetAudience={selectedSegmentIds.length > 0 ? "Targeted Demographic Citizens" : "General Public"}
        onApplyContent={handleApplyAIContent}
      />
    </div>
  );
};

