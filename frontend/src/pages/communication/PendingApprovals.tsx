import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignsApi } from '../../services/api';
import { Campaign } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Clock, Eye, AlertCircle, Search } from 'lucide-react';

export const PendingApprovals: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadPending = async () => {
    try {
      setLoading(true);
      const data = await campaignsApi.list({
        status: 'PENDING_APPROVAL',
        search: search || undefined,
      });
      setCampaigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPending();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pending Campaign Approvals</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review prepared campaigns submitted by Managers before public communication distribution.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search pending submissions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>
        <span className="text-xs font-semibold text-slate-500">
          {campaigns.length} Waiting Verification
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Title</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Prepared By</th>
                <th className="py-3 px-4 font-semibold">Estimated Reach</th>
                <th className="py-3 px-4 font-semibold">Proposed Window</th>
                <th className="py-3 px-4 font-semibold text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading queue...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No campaigns awaiting verification.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-medium text-slate-900">{c.title}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">{c.category}</td>
                    <td className="py-3.5 px-4 text-slate-700 text-xs">{c.creator_name}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {c.recipient_count.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {c.proposed_delivery_date || 'Immediate Upon Approval'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/comm/review/${c.id}`}
                        className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        <span>Inspect & Decide</span>
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

