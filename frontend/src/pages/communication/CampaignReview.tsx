import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignsApi } from '../../services/api';
import { Campaign } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Radio,
  Users,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export const CampaignReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  // Approval Modal State
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('Editorial clearance passed. Approved for multi-channel broadcast.');
  const [approving, setApproving] = useState(false);

  // Rejection Modal State
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const loadCampaign = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await campaignsApi.getById(id);
      setCampaign(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const handleApprove = async () => {
    if (!id) return;
    setApproving(true);
    try {
      await campaignsApi.approve(id, approvalNotes);
      setIsApproveOpen(false);
      navigate('/comm/approved');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve campaign');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      setRejectionError('A clear rejection reason of at least 5 characters is mandatory.');
      return;
    }
    setRejecting(true);
    setRejectionError(null);
    try {
      await campaignsApi.reject(id, rejectionReason);
      setIsRejectOpen(false);
      navigate('/comm/dashboard');
    } catch (err: any) {
      setRejectionError(err.response?.data?.detail || 'Failed to reject campaign');
    } finally {
      setRejecting(false);
    }
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
      <div className="p-8 text-center text-slate-500">
        Campaign not found.{' '}
        <button onClick={() => navigate('/comm/approvals')} className="text-emerald-600 underline">
          Back to Queue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => navigate('/comm/approvals')}
        className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>Back to Approvals Queue</span>
      </button>

      {/* Review Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{campaign.title}</h1>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-xs text-slate-500">
            Category: <span className="font-semibold text-slate-700">{campaign.category}</span> | Submitted by{' '}
            <span className="font-semibold text-slate-700">{campaign.creator_name}</span>
          </p>
        </div>

        {campaign.status === 'PENDING_APPROVAL' ? (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setRejectionReason('');
                setRejectionError(null);
                setIsRejectOpen(true);
              }}
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
            >
              <XCircle className="w-4 h-4 mr-1.5 text-rose-600" />
              <span>Reject & Return</span>
            </button>

            <button
              onClick={() => setIsApproveOpen(true)}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-1.5" />
              <span>Approve Campaign</span>
            </button>
          </div>
        ) : (
          <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            Decision Recorded: {campaign.status}
          </div>
        )}
      </div>

      {/* Editorial Content Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Message Content for Public Dissemination</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {campaign.raw_content?.length || 0} characters
          </span>
        </div>

        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 font-sans leading-relaxed whitespace-pre-wrap">
          {campaign.raw_content || 'No text provided.'}
        </div>
      </div>

      {/* Objectives & Audience Reach Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Campaign Objective
          </h3>
          <p className="text-sm text-slate-800 leading-relaxed">{campaign.objective}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Distribution Footprint
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Target Audience Count:</span>
              <span className="font-bold text-slate-900 text-sm">
                {campaign.recipient_count.toLocaleString()} recipients
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Authorized Channels:</span>
              <span className="font-semibold text-slate-800">
                {campaign.target_channels.join(', ')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Regional Languages:</span>
              <span className="font-semibold text-slate-800">
                {campaign.target_languages.join(', ') || 'English only'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal isOpen={isApproveOpen} onClose={() => setIsApproveOpen(false)} title="Approve Campaign for Distribution">
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Approving this campaign creates an immutable SHA-256 cryptographic snapshot of the content and authorizes dispatch across{' '}
            <span className="font-semibold">{campaign.target_channels.join(', ')}</span> to{' '}
            <span className="font-semibold">{campaign.recipient_count.toLocaleString()}</span> recipients.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Clearance & Editorial Comments
            </label>
            <textarea
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsApproveOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={approving}
              onClick={handleApprove}
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
            >
              {approving ? 'Recording Clearance...' : 'Confirm Approval'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)} title="Reject Campaign (Return to Manager)">
        <form onSubmit={handleReject} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            A detailed rejection explanation is mandatory so the Manager understands what editorial, factual, or compliance adjustments are required.
          </div>

          {rejectionError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {rejectionError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Mandatory Feedback / Correction Instructions *
            </label>
            <textarea
              rows={4}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Please clarify the emergency helpline hours and ensure medical terminology is translated for rural understanding..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsRejectOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rejecting}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
            >
              {rejecting ? 'Returning...' : 'Reject Campaign'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

