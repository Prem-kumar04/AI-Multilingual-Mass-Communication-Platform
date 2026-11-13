import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignsApi } from '../../services/api';
import { Campaign } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { PlusCircle, Search, Trash2, Eye, Filter } from 'lucide-react';

export const CampaignList: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignsApi.list({
        status: statusFilter || undefined,
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
    loadCampaigns();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCampaigns();
  };

  const handleDeleteDraft = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this draft campaign?')) return;
    try {
      await campaignsApi.delete(id);
      loadCampaigns();
    } catch (err) {
      console.error('Failed to delete draft', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Communication Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">
            Author, edit drafts, monitor approval feedback, and submit campaigns for verification.
          </p>
        </div>
        <Link
          to="/manager/campaigns/create"
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          <span>Create Campaign</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search campaign title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['', 'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === '' ? 'All Campaigns' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Title</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Channels</th>
                <th className="py-3 px-4 font-semibold">Target Languages</th>
                <th className="py-3 px-4 font-semibold">Estimated Reach</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading campaigns...
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No campaigns found in this view.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">{c.title}</td>
                    <td className="py-3 px-4 text-slate-500 text-xs">{c.category}</td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {c.target_languages.join(', ') || 'English'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      {c.recipient_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/manager/campaigns/${c.id}`}
                          className="inline-flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          <span>View</span>
                        </Link>
                        {c.status === 'DRAFT' && (
                          <button
                            onClick={(e) => handleDeleteDraft(c.id, e)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-200 transition-colors"
                            title="Delete Draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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

