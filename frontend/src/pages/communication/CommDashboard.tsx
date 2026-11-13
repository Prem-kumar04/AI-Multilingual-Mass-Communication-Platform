import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, campaignsApi } from '../../services/api';
import { CommTeamMetrics, Campaign } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import {
  CheckCircle2,
  Clock,
  Radio,
  FileCheck2,
  XCircle,
  Eye,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const CommDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<CommTeamMetrics | null>(null);
  const [pendingCampaigns, setPendingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, c] = await Promise.all([
          analyticsApi.getCommTeam(),
          campaignsApi.list({ status: 'PENDING_APPROVAL', limit: 5 }),
        ]);
        setMetrics(m);
        setPendingCampaigns(c);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Communication Team Clearance Portal</h1>
        <p className="text-sm text-slate-500 mt-1">
          Editorial verification gate, approval governance, and multi-channel public dissemination center.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Pending Verification"
          value={metrics?.pending_approval_campaigns || 0}
          subtitle="Action required for clearance"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Approved Campaigns"
          value={metrics?.approved_awaiting_distribution || 0}
          subtitle="Cleared for multi-channel dispatch"
          icon={FileCheck2}
          color="emerald"
        />
        <StatCard
          title="Returned Revisions"
          value={metrics?.rejected_campaigns || 0}
          subtitle="Returned to Manager with notes"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Total Submissions"
          value={metrics?.total_submitted_campaigns || 0}
          subtitle="All processed campaign requests"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Action Queue: Pending Approvals */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Priority Campaign Verification Queue</span>
            </h2>
            <p className="text-xs text-slate-500">
              Submitted by Managers for factual accuracy, language correctness, and policy approval.
            </p>
          </div>
          <Link
            to="/comm/approvals"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center"
          >
            <span>View All Pending ({metrics?.pending_approval_campaigns || 0})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Title</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Prepared By</th>
                <th className="py-3 px-4 font-semibold">Reach</th>
                <th className="py-3 px-4 font-semibold">Channels</th>
                <th className="py-3 px-4 font-semibold text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No campaigns awaiting verification at this time. All submissions cleared!
                  </td>
                </tr>
              ) : (
                pendingCampaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-medium text-slate-900">{c.title}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{c.category}</td>
                    <td className="py-3.5 px-4 text-slate-700 text-xs">{c.creator_name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {c.recipient_count.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.target_channels.map((ch) => (
                          <span
                            key={ch}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/comm/review/${c.id}`}
                        className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        <span>Review & Decide</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

