import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Send,
  MessageSquare,
  Mail,
  Share2,
  FileText,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { contentGenerationApi } from '../../services/api';
import {
  ContentGenerationRequest,
  ContentRegenerationRequest,
  ContentGenerationResponse,
  ContentVariation,
  PromptTemplateItem,
  AIServiceConfigStatus,
} from '../../types';

interface AIContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignName: string;
  campaignObjective: string;
  targetAudience: string;
  onApplyContent: (content: string, headline?: string, cta?: string) => void;
}

const CONTENT_TYPES: { id: string; label: string; icon: any; defaultLength: string }[] = [
  { id: 'WHATSAPP', label: 'WhatsApp Broadcast', icon: MessageSquare, defaultLength: 'MEDIUM' },
  { id: 'EMAIL', label: 'Email Campaign', icon: Mail, defaultLength: 'MEDIUM' },
  { id: 'SOCIAL_MEDIA', label: 'Social Media Post', icon: Share2, defaultLength: 'SHORT' },
  { id: 'SMS', label: 'SMS / Text Broadcast', icon: Send, defaultLength: 'SHORT' },
  { id: 'MARKETING_HEADLINE', label: 'Marketing Headlines', icon: Sparkles, defaultLength: 'SHORT' },
  { id: 'PRODUCT_DESCRIPTION', label: 'Service / Scheme Description', icon: FileText, defaultLength: 'DETAILED' },
  { id: 'ADVERTISEMENT_COPY', label: 'Advertisement Copy (AIDA)', icon: Lightbulb, defaultLength: 'MEDIUM' },
  { id: 'CALL_TO_ACTION', label: 'Call-to-Action Messages', icon: CheckCircle2, defaultLength: 'SHORT' },
];

const TONES = [
  'Professional & Authoritative',
  'Urgent / Emergency Advisory',
  'Inspiring & Uplifting',
  'Friendly & Conversational',
  'Formal & Administrative',
  'Persuasive & Marketing',
  'Educational & Informative',
];

export const AIContentModal: React.FC<AIContentModalProps> = ({
  isOpen,
  onClose,
  campaignName,
  campaignObjective,
  targetAudience,
  onApplyContent,
}) => {
  // Config & templates
  const [configStatus, setConfigStatus] = useState<AIServiceConfigStatus | null>(null);
  const [templates, setTemplates] = useState<PromptTemplateItem[]>([]);

  // Generation Request Form State
  const [name, setName] = useState(campaignName || '');
  const [objective, setObjective] = useState(campaignObjective || '');
  const [audience, setAudience] = useState(targetAudience || 'General Public / Citizens');
  const [contentType, setContentType] = useState('WHATSAPP');
  const [tone, setTone] = useState(TONES[0]);
  const [contentLength, setContentLength] = useState('MEDIUM');
  const [productDetails, setProductDetails] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [variationsCount, setVariationsCount] = useState(2);

  // Results State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<ContentGenerationResponse | null>(null);
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Regeneration state
  const [showRegenDrawer, setShowRegenDrawer] = useState(false);
  const [regenTone, setRegenTone] = useState(tone);
  const [regenLength, setRegenLength] = useState(contentLength);
  const [regenInstructions, setRegenInstructions] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  // Sync props when modal opens
  useEffect(() => {
    if (isOpen) {
      if (campaignName) setName(campaignName);
      if (campaignObjective) setObjective(campaignObjective);
      if (targetAudience) setAudience(targetAudience);
    }
  }, [isOpen, campaignName, campaignObjective, targetAudience]);

  // Load templates & config on mount
  useEffect(() => {
    if (isOpen && !configStatus) {
      contentGenerationApi
        .getConfigStatus()
        .then(setConfigStatus)
        .catch((err) => console.error('Failed to load AI config', err));
      contentGenerationApi
        .getTemplates()
        .then(setTemplates)
        .catch((err) => console.error('Failed to load templates', err));
    }
  }, [isOpen, configStatus]);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a campaign name or topic');
      return;
    }
    if (!objective.trim()) {
      setError('Please provide a campaign objective');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: ContentGenerationRequest = {
      campaign_name: name,
      campaign_objective: objective,
      target_audience: audience,
      content_type: contentType,
      preferred_tone: tone,
      content_length: contentLength,
      product_or_service_details: productDetails || undefined,
      additional_instructions: additionalInstructions || undefined,
      variations_count: variationsCount,
      target_language: 'English',
    };

    try {
      const res = await contentGenerationApi.generate(payload);
      setGenerationResult(res);
      setSelectedVariationIndex(0);
      setRegenTone(res.tone);
    } catch (err: any) {
      console.error('Content generation error', err);
      setError(err?.response?.data?.detail || 'Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!generationResult) return;

    setRegenerating(true);
    setError(null);

    const activeContent = getActiveContentBody();

    const payload: ContentRegenerationRequest = {
      campaign_name: generationResult.campaign_name,
      campaign_objective: objective,
      target_audience: audience,
      content_type: generationResult.content_type,
      previous_content: activeContent,
      new_tone: regenTone,
      new_length: regenLength,
      additional_instructions: regenInstructions || undefined,
      variations_count: 1,
    };

    try {
      const res = await contentGenerationApi.regenerate(payload);
      setGenerationResult(res);
      setSelectedVariationIndex(0);
      setShowRegenDrawer(false);
      setRegenInstructions('');
    } catch (err: any) {
      console.error('Content regeneration error', err);
      setError(err?.response?.data?.detail || 'Failed to regenerate content. Please check instructions.');
    } finally {
      setRegenerating(false);
    }
  };

  const getActiveContentBody = (): string => {
    if (!generationResult) return '';
    if (selectedVariationIndex === 0) {
      return generationResult.content;
    }
    const variation = generationResult.variations[selectedVariationIndex - 1];
    return variation ? variation.content : generationResult.content;
  };

  const getActiveHeadline = (): string => {
    if (!generationResult) return '';
    if (selectedVariationIndex === 0) {
      return generationResult.headline;
    }
    const variation = generationResult.variations[selectedVariationIndex - 1];
    return variation ? variation.headline : generationResult.headline;
  };

  const getActiveCTA = (): string => {
    if (!generationResult) return '';
    if (selectedVariationIndex === 0) {
      return generationResult.call_to_action;
    }
    const variation = generationResult.variations[selectedVariationIndex - 1];
    return variation ? variation.call_to_action : generationResult.call_to_action;
  };

  const getActiveHashtags = (): string[] => {
    if (!generationResult) return [];
    if (selectedVariationIndex === 0) {
      return generationResult.suggested_hashtags || [];
    }
    const variation = generationResult.variations[selectedVariationIndex - 1];
    return variation?.hashtags || generationResult.suggested_hashtags || [];
  };

  const handleCopy = () => {
    const textToCopy = `${getActiveHeadline()}\n\n${getActiveContentBody()}\n\nAction: ${getActiveCTA()}${
      getActiveHashtags().length > 0 ? `\n\n${getActiveHashtags().join(' ')}` : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    const finalContent = `${getActiveContentBody()}${
      getActiveCTA() ? `\n\nAction: ${getActiveCTA()}` : ''
    }${getActiveHashtags().length > 0 ? `\n\n${getActiveHashtags().join(' ')}` : ''}`;
    onApplyContent(finalContent, getActiveHeadline(), getActiveCTA());
    onClose();
  };

  const totalVariationsCount = generationResult ? 1 + (generationResult.variations?.length || 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">AI Campaign Content Assistant</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {configStatus?.model_name || 'Gemini 2.5 Flash'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Generate high-impact, channel-tailored campaign copy and multi-tone variations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Two Column Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Form Controls (5 cols) */}
          <div className="lg:col-span-5 p-5 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50/50">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Campaign Name / Title *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dengue Prevention Awareness"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Objective *
              </label>
              <textarea
                rows={2}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="e.g. Educate citizens on clearing stagnant water to curb vector breeding..."
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="e.g. Families, Shop owners, Rural communities"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Content Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Channel / Content Format *
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CONTENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = contentType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => {
                        setContentType(type.id);
                        setContentLength(type.defaultLength);
                      }}
                      className={`flex items-center space-x-2 p-2 rounded-xl text-left border text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-semibold'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                      <span className="truncate">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone & Length Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tone of Voice
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Length
                </label>
                <select
                  value={contentLength}
                  onChange={(e) => setContentLength(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="SHORT">Short (Concise)</option>
                  <option value="MEDIUM">Medium (Balanced)</option>
                  <option value="DETAILED">Detailed (Comprehensive)</option>
                </select>
              </div>
            </div>

            {/* Additional constraints & variations */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Initiative / Product Details (Optional)
                </label>
                <input
                  type="text"
                  value={productDetails}
                  onChange={(e) => setProductDetails(e.target.value)}
                  placeholder="e.g. Free mosquito fogging drives scheduled across wards"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Instructions / Keywords
                  </label>
                  <input
                    type="text"
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    placeholder="e.g. Include helpline 1075, mention free treatment"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Variations
                  </label>
                  <select
                    value={variationsCount}
                    onChange={(e) => setVariationsCount(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value={1}>1 Version</option>
                    <option value={2}>2 Versions</option>
                    <option value={3}>3 Versions</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Copy with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Generate Campaign Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Output Preview & Regeneration (7 cols) */}
          <div className="lg:col-span-7 p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between bg-white">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="absolute -inset-1 rounded-2xl border-2 border-emerald-400 border-dashed animate-spin"></div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Generating Professional Campaign Copy</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Prompting Gemini models for audience alignment, persuasive hooks, and civic clarity...
                  </p>
                </div>
              </div>
            ) : generationResult ? (
              <div className="space-y-4">
                {/* Status Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-semibold text-slate-700">
                      Generated via {generationResult.model_used}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      ({generationResult.tokens_used} tokens)
                    </span>
                  </div>

                  {/* Variation Switcher Tabs */}
                  {totalVariationsCount > 1 && (
                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                      {Array.from({ length: totalVariationsCount }).map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedVariationIndex(idx)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                            selectedVariationIndex === idx
                              ? 'bg-white text-emerald-800 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Option {idx + 1} {idx === 0 && '(Primary)'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Headline Box */}
                <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    Subject / Headline
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {getActiveHeadline()}
                  </h4>
                </div>

                {/* Content Body Box */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Message Content ({contentType})
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {getActiveContentBody().length} chars | ~{getActiveContentBody().split(/\s+/).length} words
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                    {getActiveContentBody()}
                  </p>
                </div>

                {/* Call-to-Action & Hashtags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Call to Action
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg inline-block border border-emerald-200">
                      👉 {getActiveCTA()}
                    </span>
                  </div>

                  {getActiveHashtags().length > 0 && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Recommended Hashtags
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {getActiveHashtags().map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200"
                          >
                            {tag.startsWith('#') ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Regeneration Drawer (Collapsible) */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/70">
                  <button
                    type="button"
                    onClick={() => setShowRegenDrawer(!showRegenDrawer)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <span className="flex items-center space-x-2">
                      <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Regenerate or Fine-Tune Tone & Length</span>
                    </span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      {showRegenDrawer ? 'Hide Controls' : 'Adjust & Re-run'}
                    </span>
                  </button>

                  {showRegenDrawer && (
                    <div className="p-4 border-t border-slate-200 bg-white space-y-3 animate-fade-in">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Shift Tone
                          </label>
                          <select
                            value={regenTone}
                            onChange={(e) => setRegenTone(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          >
                            {TONES.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                            Adjust Length
                          </label>
                          <select
                            value={regenLength}
                            onChange={(e) => setRegenLength(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          >
                            <option value="SHORT">Shorter (Crisp)</option>
                            <option value="MEDIUM">Medium (Balanced)</option>
                            <option value="DETAILED">Longer (Comprehensive)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                          Instruction for Revision
                        </label>
                        <input
                          type="text"
                          value={regenInstructions}
                          onChange={(e) => setRegenInstructions(e.target.value)}
                          placeholder="e.g. Make it more persuasive, add urgent warning about penalties"
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleRegenerate}
                          disabled={regenerating}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold flex items-center space-x-1.5 disabled:opacity-60 shadow-sm"
                        >
                          {regenerating ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Regenerating...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Regenerate with New Tone</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-3 text-center text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-600">No Content Generated Yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Fill in your campaign objective and click "Generate Campaign Copy" to synthesize channel-optimized
                    messages.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            {generationResult && (
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Full Output</span>
                    </>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply to Campaign Form</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

