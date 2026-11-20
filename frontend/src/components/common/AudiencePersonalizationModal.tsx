import React, { useState, useEffect } from 'react';
import {
  Users,
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Smile,
  ShieldAlert,
  Sliders,
  RefreshCw,
  Copy,
  Check,
  TrendingUp,
} from 'lucide-react';
import { optimizationApi } from '../../services/api';
import {
  AudienceSegmentProfile,
  PersonalizationComparisonResponse,
  SentimentAnalysisResponse,
} from '../../types';

interface AudiencePersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  initialTitle?: string;
  campaignName?: string;
  campaignObjective?: string;
  onApplyPersonalized: (content: string, title?: string) => void;
}

export const AudiencePersonalizationModal: React.FC<AudiencePersonalizationModalProps> = ({
  isOpen,
  onClose,
  initialText,
  initialTitle,
  campaignName,
  campaignObjective,
  onApplyPersonalized,
}) => {
  const [segments, setSegments] = useState<AudienceSegmentProfile[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<string>('RURAL_CITIZENS');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<PersonalizationComparisonResponse | null>(null);
  const [sentiment, setSentiment] = useState<SentimentAnalysisResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      optimizationApi
        .getSegments()
        .then((segs) => {
          setSegments(segs);
          if (segs.length > 0 && !selectedSegment) {
            setSelectedSegment(segs[0].key);
          }
        })
        .catch((err) => console.error('Failed to load segments', err));

      if (initialText && initialText.trim().length > 3) {
        optimizationApi
          .analyzeSentiment(initialText, campaignName || initialTitle)
          .then(setSentiment)
          .catch((err) => console.error('Failed to analyze sentiment', err));
      }
    }
  }, [isOpen, initialText, campaignName, initialTitle]);

  if (!isOpen) return null;

  const handlePersonalize = async () => {
    if (!initialText || initialText.trim().length < 5) {
      setError('Please provide at least 5 characters of base message content to personalize.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await optimizationApi.personalize({
        text: initialText,
        title: initialTitle,
        target_audience: selectedSegment,
        campaign_name: campaignName,
        campaign_objective: campaignObjective,
      });
      setComparison(res);
      setSentiment(res.sentiment_after);
    } catch (err: any) {
      console.error('Personalization error', err);
      setError(err?.response?.data?.detail || 'Failed to optimize for audience. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!comparison) return;
    const text = `${comparison.optimized_title ? comparison.optimized_title + '\n\n' : ''}${comparison.optimized_content}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (!comparison) return;
    onApplyPersonalized(comparison.optimized_content, comparison.optimized_title || undefined);
    onClose();
  };

  const activeSegmentProfile = segments.find((s) => s.key === selectedSegment);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shadow-md shadow-teal-600/20 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Audience-Specific Personalization & Tone Optimizer
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  Sentiment Aware
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tailor clarity, reading ease, empathy, and vocabulary for specific citizen demographics
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

        {/* Body Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Segment Selector & Sentiment Health (4 cols) */}
          <div className="lg:col-span-4 p-5 overflow-y-auto custom-scrollbar space-y-4 bg-slate-50/50">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Target Demographic Segment
              </label>
              <div className="space-y-1.5">
                {segments.map((seg) => (
                  <button
                    key={seg.key}
                    type="button"
                    onClick={() => setSelectedSegment(seg.key)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                      selectedSegment === seg.key
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{seg.name}</span>
                      {selectedSegment === seg.key && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {activeSegmentProfile && (
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                  Profile Recommendation
                </span>
                <p className="text-xs text-slate-600">{activeSegmentProfile.description}</p>
                <div className="pt-1">
                  <span className="text-[10px] font-semibold text-slate-500 block mb-1">Recommended Tone:</span>
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 inline-block">
                    {activeSegmentProfile.recommended_tone}
                  </span>
                </div>
              </div>
            )}

            {/* Sentiment Meter Card */}
            {sentiment && (
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Content Sentiment Profile
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {sentiment.polarity}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Empathy</span>
                    <span className="text-sm font-bold text-slate-800">{sentiment.empathy_score}%</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Clarity</span>
                    <span className="text-sm font-bold text-slate-800">{sentiment.clarity_score}%</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Friendliness</span>
                    <span className="text-sm font-bold text-slate-800">{sentiment.civic_friendliness_score}%</span>
                  </div>
                </div>

                {sentiment.tone_improvement_suggestions.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">Tone Suggestions:</span>
                    <ul className="text-[11px] text-slate-600 space-y-1 list-disc list-inside">
                      {sentiment.tone_improvement_suggestions.slice(0, 2).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handlePersonalize}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Personalizing Content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  <span>Personalize for {activeSegmentProfile?.name || 'Segment'}</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Side-by-Side Comparison (8 cols) */}
          <div className="lg:col-span-8 p-6 overflow-y-auto custom-scrollbar flex flex-col justify-between bg-white space-y-4">
            {comparison ? (
              <div className="space-y-4">
                {/* Metric Summary Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-teal-50/70 border border-teal-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-bold text-teal-900">
                      Reading Ease Improvement: {comparison.reading_ease_delta}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-lg">
                    Applied Tone: {comparison.tone_applied}
                  </span>
                </div>

                {/* Side-by-Side Comparison Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Original Message */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Original Base Content
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {comparison.original_content.length} chars
                      </span>
                    </div>
                    {comparison.original_title && (
                      <h5 className="text-xs font-bold text-slate-800">{comparison.original_title}</h5>
                    )}
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {comparison.original_content}
                    </p>
                  </div>

                  {/* Right: Optimized Personalized Message */}
                  <div className="border-2 border-teal-400 rounded-xl p-4 bg-teal-50/20 shadow-sm space-y-2 relative">
                    <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-teal-600" />
                        <span>Optimized for {comparison.target_audience_label}</span>
                      </span>
                      <span className="text-[10px] text-teal-600 font-mono font-semibold">
                        {comparison.optimized_content.length} chars
                      </span>
                    </div>
                    {comparison.optimized_title && (
                      <h5 className="text-xs font-bold text-slate-900">{comparison.optimized_title}</h5>
                    )}
                    <p className="text-xs text-slate-900 whitespace-pre-wrap leading-relaxed font-medium">
                      {comparison.optimized_content}
                    </p>
                  </div>
                </div>

                {/* Changes Made Breakdown */}
                {comparison.changes_made.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                      Enhancements & Vocabulary Adjustments
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {comparison.changes_made.map((change, i) => (
                        <div key={i} className="flex items-start space-x-1.5 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span>{change}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 space-y-3 text-center text-slate-400">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-600">No Demographic Variation Generated Yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">
                    Select a target demographic from the left panel and click "Personalize" to view side-by-side
                    optimizations and reading improvements.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            {comparison && (
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Personalized Text</span>
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
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-teal-600/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Optimized Message</span>
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

