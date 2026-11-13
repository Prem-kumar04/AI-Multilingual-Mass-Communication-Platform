import React, { useEffect, useState } from 'react';
import { campaignsApi } from '../../services/api';
import { Campaign } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

export const AdminApprovals: React.FC = () => {
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadPending = async () => {
    try {
      setLoading(true);
      const data = await campaignsApi.list({ status: 'PENDING_APPROVAL' });
      setPendingCampaigns(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await campaignsApi.approve(id);
      setActionSuccess('Campaign approved successfully.');
      setSelectedCampaign(null);
      loadPending();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Approval failed');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please enter revision notes for the manager:');
    if (!reason) return;
    try {
      await campaignsApi.reject(id, reason);
      setActionSuccess('Campaign returned to Manager with revision notes.');
      setSelectedCampaign(null);
      loadPending();
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Rejection failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* ── Header matching reference Image 1 ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Communication Operations
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
          Review queue
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Check every message for accuracy, tone, and channel readiness before approving the next step.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── Top Notice Card matching Image 1 ── */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-start space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-tight">
              Human review is part of the process.
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              AI drafts and translations should be reviewed by a qualified person before they are shared publicly.
            </p>
          </div>
        </div>

        {/* Count Waiting pill */}
        <div className="flex-shrink-0 ml-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
            {pendingCampaigns.length} waiting
          </span>
        </div>
      </div>

      {/* ── Main Review Queue Area matching Image 1 ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-8 sm:p-14 min-h-[360px] flex flex-col items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading review queue…</p>
          </div>
        ) : pendingCampaigns.length === 0 ? (
          /* Empty State matching Image 1 exactly */
          <div className="flex flex-col items-center text-center max-w-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Nothing waiting for review
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Campaigns submitted by Managers will appear here.
            </p>
          </div>
        ) : (
          /* Active Review Items */
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Pending Submissions ({pendingCampaigns.length})
              </h3>
              <span className="text-xs text-slate-400">Requires Administrative Verification</span>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingCampaigns.map((c) => (
                <div
                  key={c.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-sm text-slate-900">{c.title}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Category: <span className="text-slate-700 font-medium">{c.category}</span> · Reach:{' '}
                      <span className="text-slate-700 font-medium">
                        {c.recipient_count.toLocaleString()} citizens
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Author: {c.creator_name || 'Campaign Manager'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedCampaign(c)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => handleReject(c.id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(c.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom Notice matching Image 1 ── */}
      <div className="flex items-center space-x-2 text-xs text-slate-400 pt-2">
        <User className="w-3.5 h-3.5 flex-shrink-0" />
        <span>You're viewing the Communication workflow as Admin. Role access is in preview mode.</span>
      </div>

      {/* ── Inspection Modal ── */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="text-base font-bold text-slate-900">Campaign Verification Detail</h3>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Campaign Title</p>
                <p className="text-lg font-bold text-slate-900">{selectedCampaign.title}</p>
                <p className="text-xs text-slate-500 mt-1">{selectedCampaign.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Category</span>
                  <p className="font-semibold text-slate-800">{selectedCampaign.category}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Recipient Reach</span>
                  <p className="font-semibold text-slate-800">
                    {selectedCampaign.recipient_count.toLocaleString()} citizens
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Channels</span>
                  <p className="font-semibold text-slate-800">
                    {(selectedCampaign.target_channels || ['SMS', 'WhatsApp']).join(', ')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Author</span>
                  <p className="font-semibold text-slate-800">{selectedCampaign.creator_name || 'Campaign Manager'}</p>
                </div>
              </div>

              {(selectedCampaign.raw_content || selectedCampaign.description) && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Message Body Content
                  </p>
                  <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {selectedCampaign.raw_content || selectedCampaign.description}
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedCampaign.id)}
                className="px-4 py-2 rounded-xl border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50"
              >
                Reject
              </button>
              <button
                onClick={() => handleApprove(selectedCampaign.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white"
              >
                Approve Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

