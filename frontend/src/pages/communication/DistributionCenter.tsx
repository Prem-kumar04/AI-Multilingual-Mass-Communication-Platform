import React, { useEffect, useState } from 'react';
import { campaignsApi } from '../../services/api';
import { Campaign } from '../../types';
import {
  Radio,
  Send,
  CheckCircle2,
  ExternalLink,
  Copy,
  Globe,
  Share2,
  Smartphone,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { StatusBadge } from '../../components/common/Badge';

export const DistributionCenter: React.FC = () => {
  const [approvedCampaigns, setApprovedCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    campaignsApi.list({ status: 'APPROVED' }).then((c) => {
      setApprovedCampaigns(c || []);
      setLoading(false);
    });
  }, []);

  const handleCopyLink = (campaignId: string) => {
    const url = `${window.location.origin}/campaigns/${campaignId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(campaignId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleDispatch = (c: Campaign) => {
    const publicUrl = `${window.location.origin}/campaigns/${c.id}`;
    setDispatchStatus((prev) => ({
      ...prev,
      [c.id]: `Dissemination in progress: Transmitting notice and public info link (${publicUrl}) to ${c.recipient_count.toLocaleString()} recipients via ${c.target_channels.join(', ')}.`,
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Multi-Channel Distribution Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          Authorized dispatch portal: Disseminate verified civic announcements with embedded public information website links across WhatsApp, SMS, and Email.
        </p>
      </div>

      {/* Concept Notice */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-3">
        <Globe className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="block text-emerald-950 font-bold mb-0.5">
            Public Information Website Integration
          </strong>
          <span>
            Every campaign dispatched through SMS, WhatsApp, or Email automatically embeds a dedicated public website URL (e.g.{' '}
            <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[11px]">/campaigns/:id</code>). Recipients can click the link to read full guidelines, helpline contacts, and translated versions in 8 regional languages.
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-600" />
            <span>Cleared Campaigns Ready for Dissemination</span>
          </h2>
          <span className="text-xs text-slate-400">
            {approvedCampaigns.length} Approved Campaign(s)
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading cleared queue...</p>
          </div>
        ) : approvedCampaigns.length === 0 ? (
          <div className="p-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            No approved campaigns currently waiting for dispatch. Approved campaigns appear here automatically once cleared by reviewers.
          </div>
        ) : (
          <div className="space-y-4">
            {approvedCampaigns.map((c) => {
              const publicLink = `${window.location.origin}/campaigns/${c.id}`;
              const isCopied = copiedId === c.id;
              const currentStatus = dispatchStatus[c.id];

              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">{c.title}</h3>
                        <StatusBadge status={c.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500">
                        Category: <strong className="text-slate-700">{c.category}</strong> &bull; Reach:{' '}
                        <strong className="text-slate-800">{c.recipient_count.toLocaleString()}</strong> citizens &bull; Primary:{' '}
                        <strong className="text-slate-700">{c.primary_language}</strong>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <a
                        href={publicLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview Public Website</span>
                      </a>

                      <button
                        onClick={() => handleDispatch(c)}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Execute Multi-Channel Dispatch</span>
                      </button>
                    </div>
                  </div>

                  {/* Public Link Box & Channel Preview */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2 overflow-hidden truncate">
                      <Globe className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-500 whitespace-nowrap">Recipients Public Website Link:</span>
                      <code className="text-slate-800 font-mono text-[11px] truncate bg-white px-2 py-0.5 rounded border border-slate-200">
                        {publicLink}
                      </code>
                    </div>

                    <button
                      onClick={() => handleCopyLink(c.id)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 flex-shrink-0"
                    >
                      {isCopied ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Dispatched Live Banner */}
                  {currentStatus && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2 animate-fade-in font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{currentStatus}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
