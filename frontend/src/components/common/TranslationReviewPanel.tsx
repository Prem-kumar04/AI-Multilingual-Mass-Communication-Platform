import React, { useState, useEffect } from 'react';
import {
  Globe2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit3,
  Check,
  Save,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { translationsApi } from '../../services/api';
import { TranslationItemResponse, SupportedLanguageItem } from '../../types';

interface TranslationReviewPanelProps {
  campaignId: string;
  originalText: string;
  originalTitle?: string;
  targetLanguages: string[];
  canReview?: boolean; // True for Communication Team / Admin
  onTranslationsUpdated?: () => void;
}

export const TranslationReviewPanel: React.FC<TranslationReviewPanelProps> = ({
  campaignId,
  originalText,
  originalTitle,
  targetLanguages,
  canReview = true,
  onTranslationsUpdated,
}) => {
  const [translations, setTranslations] = useState<TranslationItemResponse[]>([]);
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguageItem[]>([]);
  const [activeLangCode, setActiveLangCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editing state for active translation
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [savingReview, setSavingReview] = useState(false);

  const loadData = async () => {
    if (!campaignId) return;
    setLoading(true);
    try {
      const [langs, trans] = await Promise.all([
        translationsApi.getLanguages(),
        translationsApi.getCampaignTranslations(campaignId),
      ]);
      setSupportedLanguages(langs);
      setTranslations(trans);
      if (trans.length > 0 && !activeLangCode) {
        setActiveLangCode(trans[0].language_code);
      }
    } catch (err: any) {
      console.error('Failed to load translations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [campaignId]);

  const handleGenerateTranslations = async () => {
    setGenerating(true);
    setError(null);
    try {
      const results = await translationsApi.generateCampaignTranslations(campaignId, targetLanguages);
      setTranslations(results);
      if (results.length > 0) {
        setActiveLangCode(results[0].language_code);
      }
      if (onTranslationsUpdated) onTranslationsUpdated();
    } catch (err: any) {
      console.error('Translation error', err);
      setError(err?.response?.data?.detail || 'Failed to generate translations.');
    } finally {
      setGenerating(false);
    }
  };

  const activeTranslation = translations.find((t) => t.language_code === activeLangCode);

  const startEditing = () => {
    if (!activeTranslation) return;
    setEditTitle(activeTranslation.translated_title || '');
    setEditBody(activeTranslation.translated_body);
    setReviewerNotes(activeTranslation.reviewer_notes || '');
    setIsEditing(true);
  };

  const handleSaveReview = async (markVerified: boolean) => {
    if (!activeTranslation || !activeTranslation.id) return;
    setSavingReview(true);
    try {
      const updated = await translationsApi.reviewTranslation(activeTranslation.id, {
        is_verified: markVerified,
        edited_title: editTitle || undefined,
        edited_body: editBody || undefined,
        reviewer_notes: reviewerNotes || undefined,
      });

      setTranslations((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setIsEditing(false);
      if (onTranslationsUpdated) onTranslationsUpdated();
    } catch (err: any) {
      console.error('Failed to save review', err);
      setError('Failed to record translation review.');
    } finally {
      setSavingReview(false);
    }
  };

  const verifiedCount = translations.filter((t) => t.is_verified).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Globe2 className="w-5 h-5 text-emerald-600" />
              <span>Multilingual Translations & Human Clearance</span>
            </h3>
            {translations.length > 0 && (
              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                  verifiedCount === translations.length
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {verifiedCount} / {translations.length} Verified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-powered translation into Indian regional languages with dual-view and human verification
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateTranslations}
          disabled={generating}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
        >
          {generating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Translating Languages...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>{translations.length > 0 ? 'Re-Translate Target Languages' : 'Generate Regional Translations'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading multilingual translations...</div>
      ) : translations.length === 0 ? (
        <div className="py-8 text-center space-y-2 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <Globe2 className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-xs font-bold text-slate-700">No regional translations generated yet</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Target Languages: <span className="font-semibold">{targetLanguages.join(', ')}</span>. Click "Generate
            Regional Translations" to synthesize high-accuracy Indian language versions.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Language Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
            {translations.map((t) => (
              <button
                key={t.language_code}
                type="button"
                onClick={() => {
                  setActiveLangCode(t.language_code);
                  setIsEditing(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeLangCode === t.language_code
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{t.language_name}</span>
                {t.is_verified ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${activeLangCode === t.language_code ? 'text-white' : 'text-emerald-600'}`} />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>
            ))}
          </div>

          {/* Active Translation Dual View */}
          {activeTranslation && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800">
                    {activeTranslation.language_name} Translation View
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                      activeTranslation.is_verified
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {activeTranslation.is_verified ? '✓ Certified Accurate' : '⏳ Pending Review'}
                  </span>
                </div>

                {canReview && !isEditing && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-emerald-700 font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit & Verify</span>
                  </button>
                )}
              </div>

              {/* Dual View Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Original Base (English) */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Original English Source
                  </span>
                  {originalTitle && <h5 className="text-xs font-bold text-slate-800">{originalTitle}</h5>}
                  <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {activeTranslation.original_text || originalText}
                  </p>
                </div>

                {/* Right: Translated Version */}
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    {activeTranslation.language_name} Translated Content
                  </span>

                  {isEditing ? (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Translated Title
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Translated Body
                        </label>
                        <textarea
                          rows={4}
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-sans leading-relaxed"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                          Reviewer Verification Comments
                        </label>
                        <input
                          type="text"
                          value={reviewerNotes}
                          onChange={(e) => setReviewerNotes(e.target.value)}
                          placeholder="e.g. Verified technical terminology and emergency helpline accuracy"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={savingReview}
                          onClick={() => handleSaveReview(true)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Certify & Save</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {activeTranslation.translated_title && (
                        <h5 className="text-xs font-bold text-slate-900">{activeTranslation.translated_title}</h5>
                      )}
                      <p className="text-xs text-slate-900 whitespace-pre-wrap leading-relaxed font-medium">
                        {activeTranslation.translated_body}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Cultural & Reviewer Notes */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-slate-600">
                  <span className="font-semibold text-slate-800">Linguistic Note:</span>{' '}
                  {activeTranslation.cultural_notes || 'Standard regional dialect verified for civic communication.'}
                </span>

                {activeTranslation.reviewer_notes && (
                  <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                    Reviewer: {activeTranslation.reviewer_notes}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

