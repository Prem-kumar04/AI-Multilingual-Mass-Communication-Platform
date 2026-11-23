import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignsApi } from '../../services/api';
import { Campaign } from '../../types';
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
} from 'lucide-react';

export const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);

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
      loadCampaign();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to submit campaign for approval');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center text-slate-500">
        Campaign not found.{' '}
        <button onClick={() => navigate('/manager/campaigns')} className="text-blue-600 underline">
          Back to Campaigns
        </button>
      </div>
    );
  }

  const latestRejection = campaign.approvals?.find((a) => a.decision === 'REJECTED');
  const latestApproval = campaign.approvals?.find((a) => a.decision === 'APPROVED');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => navigate('/manager/campaigns')}
        className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>Back to My Campaigns</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{campaign.title}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-xs text-slate-500">
            Category: <span className="font-semibold text-slate-700">{campaign.category}</span> | Created by{' '}
            <span className="font-semibold text-slate-700">{campaign.creator_name}</span> on{' '}
            {new Date(campaign.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {(campaign.status === 'DRAFT' || campaign.status === 'REJECTED') && (
            <>
              <button
                type="button"
                onClick={() => setIsPersonalizeOpen(true)}
                className="inline-flex items-center px-3.5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition-all shadow-sm"
              >
                <Users className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                <span>Audience Optimizer</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex items-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                <span>{submitting ? 'Submitting...' : 'Submit for Approval'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rejection Alert Banner if returned */}
      {campaign.status === 'REJECTED' && latestRejection && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-900">
                Campaign Returned with Revision Feedback
              </h3>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                <span className="font-semibold">Reviewer ({latestRejection.reviewer_name}):</span>{' '}
                "{latestRejection.comments}"
              </p>
              <p className="text-[11px] text-rose-600 mt-2 font-medium">
                Make the required adjustments to your content or channels, then click "Submit for Approval" above to re-initiate the review.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation Banner */}
      {campaign.status === 'APPROVED' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-emerald-900">Campaign Verified & Approved</h3>
              <p className="text-xs text-emerald-800 mt-1">
                Approved by {latestApproval?.reviewer_name || 'Communication Team'} with notes:{' '}
                "{latestApproval?.comments || 'Passed all verification checks.'}"
              </p>
              <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                The campaign is now queued in the Communication Team Distribution Center.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Content Block */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Prepared Message Content</span>
            </h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-wrap">
              {campaign.raw_content || 'No content provided.'}
            </div>
          </div>

          {/* Objective */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Communication Objective
            </h2>
            <p className="text-sm text-slate-800">{campaign.objective}</p>
          </div>

          {/* Status History Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Lifecycle State Transitions</span>
            </h2>

            <div className="space-y-3">
              {campaign.status_history?.map((hist) => (
                <div key={hist.id} className="flex items-start space-x-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {hist.from_status} &rarr; {hist.to_status}
                      </span>
                      <span className="text-slate-400">
                        {new Date(hist.created_at).toLocaleString()}
                      </span>
                    </div>
                    {hist.reason && <p className="text-slate-500 mt-0.5">{hist.reason}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Distribution Specs
            </h3>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">Target Channels</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {campaign.target_channels?.map((ch) => (
                  <span
                    key={ch}
                    className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">
                Target Regional Languages
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {campaign.target_languages?.map((lang) => (
                  <span
                    key={lang}
                    className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase">
                Estimated Audience Reach
              </p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {campaign.recipient_count.toLocaleString()} contacts
              </p>
            </div>

            {campaign.proposed_delivery_date && (
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase">
                  Proposed Delivery Window
                </p>
                <p className="text-xs text-slate-800 mt-0.5">
                  {campaign.proposed_delivery_date}{' '}
                  {campaign.proposed_delivery_time ? `@ ${campaign.proposed_delivery_time}` : ''}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live AI Quality & Policy Compliance Clearance */}
      <ComplianceAuditCard campaignId={campaign.id} />

      {/* Multilingual Regional Translations & Review Panel */}
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

