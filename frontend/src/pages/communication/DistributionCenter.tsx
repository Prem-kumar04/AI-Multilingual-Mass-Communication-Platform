import React, { useEffect, useState } from 'react';
import { campaignsApi } from '../../services/api';
import { Campaign } from '../../types';
import { Radio, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../../components/common/Badge';

export const DistributionCenter: React.FC = () => {
  const [approvedCampaigns, setApprovedCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    campaignsApi.list({ status: 'APPROVED' }).then((c) => {
      setApprovedCampaigns(c);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Multi-Channel Distribution Center</h1>
        <p className="text-sm text-slate-500 mt-1">
          Authorized dispatch portal: only campaigns cleared with cryptographic verification can be disseminated.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Radio className="w-4 h-4 text-emerald-600" />
          <span>Cleared Campaigns Awaiting Transmission</span>
        </h2>

        {loading ? (
          <p className="text-xs text-slate-400">Loading queue...</p>
        ) : approvedCampaigns.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            No approved campaigns currently waiting for dispatch. Approved campaigns appear here automatically.
          </div>
        ) : (
          <div className="space-y-4">
            {approvedCampaigns.map((c) => (
              <div key={c.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-sm">{c.title}</h3>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500">
                    Reach: <span className="font-semibold text-slate-800">{c.recipient_count.toLocaleString()}</span> recipients across{' '}
                    <span className="font-semibold text-slate-800">{c.target_channels.join(', ')}</span>
                  </p>
                </div>
                <button
                  onClick={() => alert(`Milestone 3 Dissemination Engine: Initiating live async transmission across ${c.target_channels.join(', ')} for ${c.recipient_count} recipients.`)}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Execute Multi-Channel Dispatch</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

