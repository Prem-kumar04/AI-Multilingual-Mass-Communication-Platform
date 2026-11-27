import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignsApi } from '../../services/api';
import { Campaign } from '../../types';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/Badge';
import { ComplianceAuditCard } from '../../components/common/ComplianceAuditCard';
import { TranslationReviewPanel } from '../../components/common/TranslationReviewPanel';
import { AudiencePersonalizationModal } from '../../components/common/AudiencePersonalizationModal';
import {
  Send,
  ArrowLeft,
  Clock,
  Radio,
  Globe2,
  Users,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Calendar,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Target,
  Share2,
} from 'lucide-react';

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadCampaign = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await campaignsApi.getById(id);
      setCampaign(data);
    } catch (err: any) {
      setError('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await campaignsApi.submit(id);
      toast.success('Campaign submitted for editorial approval.');
      loadCampaign();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit campaign for approval');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyContent = () => {
    if (!campaign?.raw_content) return;
    navigator.clipboard.writeText(campaign.raw_content);
    setCopied(true);
    toast.success('Message content copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
        <p className="text-base font-semibold text-slate-700 mb-2">Campaign not found</p>
        <button
          onClick={() => navigate('/manager/campaigns')}
          className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Campaigns Directory
        </button>
      </div>
    );
  }

  const latestRejection = campaign.approvals?.find((a) => a.decision === 'REJECTED');
  const latestApproval = campaign.approvals?.find((a) => a.decision === 'APPROVED');
  const wordCount = campaign.raw_content ? campaign.raw_content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = campaign.raw_content?.length || 0;

  return (
    <div className="w-full space-y-6 pb-16 animate-fade-in">
      {/* Top Navigation & Quick Link Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate('/manager/campaigns')}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to My Campaigns</span>
        </button>

        <div className="flex items-center space-x-3">
          <a
            href={`/campaigns/${campaign.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Public Citizen Portal View</span>
          </a>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{campaign.title}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>
              Category: <strong className="text-slate-700">{campaign.category}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Author: <strong className="text-slate-700">{campaign.creator_name || 'Campaign Manager'}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Created on: <strong className="text-slate-700">{new Date(campaign.created_at).toLocaleDateString()}</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center space-x-1">
              <span>ID:</span>
              <code className="font-mono text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                {campaign.id.slice(0, 8)}
              </code>
            </span>
          </div>
        </div>

        {/* Action Controls & Review State */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {(campaign.status === 'DRAFT' || campaign.status === 'REJECTED') && (
            <>
              <button
                type="button"
                onClick={() => setIsPersonalizeOpen(true)}
                className="inline-flex items-center px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition-all shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                <span>Audience Optimizer</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>{submitting ? 'Submitting...' : 'Submit for Approval'}</span>
              </button>
            </>
          )}

          {campaign.status === 'PENDING_APPROVAL' && (
            <div className="inline-flex items-center px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold space-x-2">
              <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
              <span>Awaiting Editorial Review by Admin / Comm Team</span>
            </div>
          )}

          {campaign.status === 'APPROVED' && (
            <div className="inline-flex items-center px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Approved & Cleared for Broadcast</span>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Alert Banner if returned */}
      {campaign.status === 'REJECTED' && latestRejection && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-rose-900">Campaign Returned with Revision Feedback</h3>
              <p className="text-xs text-rose-800 leading-relaxed">
                <span className="font-semibold">Reviewer ({latestRejection.reviewer_name || 'Admin'}):</span> "
                {latestRejection.comments}"
              </p>
              <p className="text-[11px] text-rose-600 font-medium pt-1">
                Make the required adjustments to your content or channels, then click "Submit for Approval" above to
                re-initiate the review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation Banner */}
      {campaign.status === 'APPROVED' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-emerald-900">Campaign Verified & Editorial Clearance Granted</h3>
              <p className="text-xs text-emerald-800">
                Approved by <strong>{latestApproval?.reviewer_name || 'Communication Team'}</strong>
                {latestApproval?.comments ? `: "${latestApproval.comments}"` : ' with full verification.'}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium pt-1">
                The campaign is now queued in the Communication Team Distribution Center.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Content Block */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Prepared Message Content</span>
              </h2>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-400">
                  {charCount} chars • {wordCount} words
                </span>
                <button
                  type="button"
                  onClick={handleCopyContent}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors p-1 rounded-lg hover:bg-slate-100"
                  title="Copy message content"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-wrap select-text">
              {campaign.raw_content || 'No content provided.'}
            </div>
          </div>

          {/* Objective & Scope Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>Communication Objective & Scope</span>
            </h2>
            <p className="text-sm text-slate-800 leading-relaxed">{campaign.objective}</p>
            {campaign.description && campaign.description !== campaign.objective && (
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">{campaign.description}</p>
            )}
          </div>

          {/* AI Quality & Policy Compliance Clearance */}
          <ComplianceAuditCard campaignId={campaign.id} />
        </div>

        {/* Right Column (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Distribution Specs Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span>Distribution Specs</span>
            </h3>

            {/* Target Channels */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Target Channels</p>
              <div className="flex flex-wrap gap-1.5">
                {campaign.target_channels && campaign.target_channels.length > 0 ? (
                  campaign.target_channels.map((ch) => (
                    <span
                      key={ch}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {ch}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">None specified</span>
                )}
              </div>
            </div>

            {/* Target Regional Languages */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Target Regional Languages ({campaign.target_languages?.length || 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {campaign.target_languages && campaign.target_languages.length > 0 ? (
                  campaign.target_languages.map((lang) => (
                    <span
                      key={lang}
                      className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {lang}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">English only</span>
                )}
              </div>
            </div>

            {/* Estimated Audience Reach */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Audience Reach</p>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-slate-900">
                  {campaign.recipient_count.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-500">citizens / contacts</span>
              </div>
            </div>

            {/* Proposed Delivery Window */}
            {campaign.proposed_delivery_date && (
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Proposed Delivery Window
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {campaign.proposed_delivery_date}
                    {campaign.proposed_delivery_time ? ` @ ${campaign.proposed_delivery_time}` : ''}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Lifecycle State Transitions Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-2">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lifecycle State Transitions</span>
            </h3>

            <div className="space-y-3.5 pt-1">
              {campaign.status_history && campaign.status_history.length > 0 ? (
                campaign.status_history.map((hist) => (
                  <div key={hist.id} className="flex items-start space-x-3 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1 flex-shrink-0 shadow-xs"></div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          {hist.from_status} &rarr; {hist.to_status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(hist.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {hist.reason && <p className="text-slate-500 text-[11px] leading-relaxed">{hist.reason}</p>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">No transition history recorded yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Multilingual Regional Translations & Review Panel (Full Width) */}
      <TranslationReviewPanel
        campaignId={campaign.id}
        originalText={campaign.raw_content || ''}
        originalTitle={campaign.title}
        targetLanguages={campaign.target_languages || []}
        canReview={false}
        onTranslationsUpdated={loadCampaign}
      />

      <AudiencePersonalizationModal
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        initialText={campaign.raw_content || ''}
        initialTitle={campaign.title}
        campaignName={campaign.title}
        campaignObjective={campaign.objective}
        onApplyPersonalized={async (content) => {
          try {
            await campaignsApi.update(campaign.id, { raw_content: content });
            loadCampaign();
          } catch (e) {
            console.error('Failed to update content', e);
          }
        }}
      />
    </div>
  );
};
