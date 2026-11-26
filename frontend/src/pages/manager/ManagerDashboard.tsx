import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, campaignsApi } from '../../services/api';
import { ManagerMetrics, Campaign } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import {
  Layers,
  FileEdit,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  ArrowRight,
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ManagerMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, c] = await Promise.all([
          analyticsApi.getManager(),
          campaignsApi.list({ limit: 5 }),
        ]);
        setMetrics(m);
        setCampaigns(c);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campaign Preparation Studio</h1>
          <p className="text-sm text-slate-500 mt-1">
            Author public awareness notifications, segment audiences, and submit for editorial verification.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="My Total Campaigns"
          value={metrics?.my_total_campaigns || 0}
          subtitle={`${metrics?.my_draft_campaigns || 0} drafts in progress`}
          icon={Layers}
          color="emerald"
        />
        <StatCard
          title="Under Review"
          value={metrics?.my_pending_campaigns || 0}
          subtitle="Pending Comm Team approval"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Approved Campaigns"
          value={metrics?.my_approved_campaigns || 0}
          subtitle="Ready / queued for distribution"
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Subscribed Audience"
          value={(metrics?.total_audience_reach || 0).toLocaleString()}
          subtitle={`${metrics?.total_templates_available || 0} reusable templates`}
          icon={Users}
          color="emerald"
        />
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Prepared Campaigns</h2>
            <p className="text-xs text-slate-500">Track submission status and reviewer clearance.</p>
          </div>
          <Link
            to="/manager/campaigns"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-semibold">Title</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Channels</th>
                <th className="py-3 px-4 font-semibold">Estimated Reach</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No campaigns created yet. Use Create Campaign in the sidebar to begin.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-medium text-slate-900">{c.title}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{c.category}</td>
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
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {c.recipient_count.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/manager/campaigns/${c.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
                      >
                        View & Manage
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

