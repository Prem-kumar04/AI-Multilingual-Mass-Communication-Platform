import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicApi } from '../../services/api';
import { PublicCampaignDetailData, PublicTranslation } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  ShieldCheck,
  Globe,
  Share2,
  Printer,
  Copy,
  CheckCircle2,
  Calendar,
  Radio,
  Send,
  AlertTriangle,
  Building,
  Heart,
  HelpCircle,
  ThumbsUp,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const PublicCampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [campaign, setCampaign] = useState<PublicCampaignDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active translation tab
  const [activeLang, setActiveLang] = useState<string>('English');

  // Copy Link State
  const [copied, setCopied] = useState(false);

  // Citizen Feedback Form State
  const [feedbackRating, setFeedbackRating] = useState<'HELPFUL' | 'NEUTRAL' | 'NEEDS_IMPROVEMENT'>('HELPFUL');
  const [feedbackText, setFeedbackText] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenContact, setCitizenContact] = useState('');
  const [channelReceived, setChannelReceived] = useState('WhatsApp');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await publicApi.getCampaignById(id);
        setCampaign(data);
        if (data.primary_language) {
          setActiveLang(data.primary_language);
        }
      } catch (err: any) {
        console.error('Failed to load campaign:', err);
        setError(err.response?.data?.detail || 'Campaign not found');
      } finally {
        setLoading(false);
      }
    };
    fetchCampaign();
  }, [id]);

  // Current translation content
  const currentTranslation: PublicTranslation | undefined = campaign?.translations?.find(
    (t) => t.language_name.toLowerCase() === activeLang.toLowerCase()
  );

  const displayTitle = currentTranslation?.translated_title || campaign?.title;
  const displayBody = currentTranslation?.translated_body || campaign?.raw_content || campaign?.description || campaign?.objective;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*Official Public Advisory: ${displayTitle}*\nRead full verified details and translations here: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !feedbackText.trim()) return;

    try {
      setSubmittingFeedback(true);
      await publicApi.submitFeedback(id, {
        feedback_text: feedbackText.trim(),
        channel_type: channelReceived,
        citizen_name: citizenName.trim() || undefined,
        citizen_contact: citizenContact.trim() || undefined,
        sentiment_rating: feedbackRating,
      });
      setFeedbackSuccess(true);
      setFeedbackText('');
      toast.success('Thank you! Your feedback has been submitted.');
    } catch (err) {
      console.error(err);
      toast.error('Unable to submit feedback at this moment.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400">Loading verified advisory notice...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold font-serif text-slate-800">Notice Not Found</h2>
        <p className="text-xs text-slate-500">
          The public announcement you are attempting to view may have been archived or the link contains an invalid identifier.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Advisories</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in">
      {/* ── Top Navigation & Back Button ── */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Public Advisories</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share on WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
            title="Print Advisory Notice"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ── Official Notice Header & Verification Seal ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Verification Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-xs font-bold text-slate-900">
                  Official Public Advisory Notice
                </p>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Verified Authentic
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Issuing Authority: {campaign.issuing_authority}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span className="px-2.5 py-1 rounded-full font-bold uppercase text-[10px] bg-slate-100 text-slate-700">
              {campaign.category}
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{campaign.proposed_delivery_date || 'Current Active Period'}</span>
            </span>
          </div>
        </div>

        {/* Advisory Title */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 leading-tight">
            {displayTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Objective: <span className="text-slate-800 font-medium">{campaign.objective}</span>
          </p>
        </div>

        {/* ── Regional Language Switcher Tabs ── */}
        <div className="pt-2">
          <div className="flex items-center justify-between pb-2">
            <p className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Globe className="w-4 h-4 text-emerald-700" />
              <span>Read in Your Regional Language:</span>
            </p>
            <span className="text-[11px] text-slate-400">
              {campaign.languages_available.length} Indian Languages Available
            </span>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {campaign.languages_available.map((lang) => {
              const isActive = activeLang.toLowerCase() === lang.toLowerCase();
              return (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{lang}</span>
                  {isActive && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Message Body ── */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-200">
            <span className="font-semibold text-slate-700">Official Release Content ({activeLang})</span>
            <span className="inline-flex items-center space-x-1 text-emerald-700 font-medium">
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcasted via {campaign.target_channels.join(', ')}</span>
            </span>
          </div>

          <div className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {displayBody}
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
            <span>
              Target Audience Reach: <strong className="text-slate-900">{campaign.recipient_count.toLocaleString()} Citizens</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              Language translation certified for civic clarity.
            </span>
          </div>
        </div>
      </div>

      {/* ── Key Citizen Action Guidelines & Checklist ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Action Checklist */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Recommended Citizen Actions</span>
          </h3>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
              <span>Follow guidelines provided in the notice and share with family and neighbors.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
              <span>In case of health symptoms or emergency weather situations, contact the toll-free helplines immediately.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0"></span>
              <span>Report any unverified or conflicting rumors to local administrative authorities.</span>
            </li>
          </ul>
        </div>

        {/* Emergency Helplines for this Campaign */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Assistance & Helplines</span>
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">General Emergency</span>
              <strong className="text-lg font-serif text-slate-900">112</strong>
              <p className="text-[10px] text-slate-500 mt-0.5">National Response</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Health Advisory</span>
              <strong className="text-lg font-serif text-slate-900">1075</strong>
              <p className="text-[10px] text-slate-500 mt-0.5">National Health Line</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Citizen Feedback & Reaction Form ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
            <span>Voice of the Citizen & Community Feedback</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Did you find this public announcement helpful?
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Your feedback directly informs our communication teams and helps improve public announcements.
          </p>
        </div>

        {feedbackSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fade-in">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-emerald-950">Thank you for your response!</h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              Your feedback has been recorded by the Public Communication Department and routed into our sentiment analytics system.
            </p>
            <button
              onClick={() => setFeedbackSuccess(false)}
              className="text-xs font-bold text-emerald-700 underline mt-2"
            >
              Submit another question or note
            </button>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-5">
            {/* Rating Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Overall Clarity & Helpfulness:
              </label>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setFeedbackRating('HELPFUL')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    feedbackRating === 'HELPFUL'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>👍 Helpful & Clear</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackRating('NEUTRAL')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    feedbackRating === 'NEUTRAL'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>😐 Neutral</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackRating('NEEDS_IMPROVEMENT')}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    feedbackRating === 'NEEDS_IMPROVEMENT'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>⚠️ Needs More Details</span>
                </button>
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Feedback or Questions for Authorities:
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Share your thoughts, ask for clarification, or report any local situation..."
                required
              />
            </div>

            {/* Optional Contact Inputs in 3-column row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Channel You Received This (Optional):
                </label>
                <select
                  value={channelReceived}
                  onChange={(e) => setChannelReceived(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS Notice</option>
                  <option value="Email">Official Email</option>
                  <option value="Web Portal">Web Portal / Social Media</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Your Name (Optional):
                </label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="Citizen name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile / Email (Optional):
                </label>
                <input
                  type="text"
                  value={citizenContact}
                  onChange={(e) => setCitizenContact(e.target.value)}
                  placeholder="For official replies"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submittingFeedback}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                {submittingFeedback ? (
                  <span>Recording Feedback...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Feedback to Communications Team</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

