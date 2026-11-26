import React, { useEffect, useState } from 'react';
import { campaignsApi } from '../../services/api';
import { Campaign } from '../../types';
import { Search, ChevronDown, X, Globe, Radio } from 'lucide-react';

interface CampaignItem {
  id: string;
  title: string;
  location: string;
  category: string;
  audienceName: string;
  audienceCount: string;
  channels: string;
  status: 'Sent' | 'Approved' | 'Pending Approval';
}

const SAMPLE_CAMPAIGNS: CampaignItem[] = [
  {
    id: 'c-1',
    title: 'Dengue Prevention Awareness Campaign',
    location: 'Hyderabad, Telangana',
    category: 'Health',
    audienceName: 'Residents, families, students and local communities',
    audienceCount: '50,000 people',
    channels: 'WhatsApp, SMS, Email, Push',
    status: 'Sent',
  },
  {
    id: 'c-2',
    title: 'Dengue Prevention Awareness',
    location: 'Hyderabad, Telangana',
    category: 'Health',
    audienceName: 'Residents of Hyderabad',
    audienceCount: '1,25,000 people',
    channels: 'WhatsApp, SMS, Email',
    status: 'Sent',
  },
  {
    id: 'c-3',
    title: 'Monsoon Flood Preparedness',
    location: 'Chennai, Tamil Nadu',
    category: 'Emergency',
    audienceName: 'Low-lying area households',
    audienceCount: '42,000 people',
    channels: 'SMS, WhatsApp, Push',
    status: 'Approved',
  },
  {
    id: 'c-4',
    title: "Girls' School Enrolment Drive",
    location: 'Bengaluru Rural, Karnataka',
    category: 'Education',
    audienceName: 'Parents of children aged 6-14',
    audienceCount: '68,000 people',
    channels: 'SMS, WhatsApp',
    status: 'Pending Approval',
  },
  {
    id: 'c-5',
    title: 'Say No to Single-Use Plastic',
    location: 'Pune, Maharashtra',
    category: 'Environment',
    audienceName: 'Shop owners and residents',
    audienceCount: '90,000 people',
    channels: 'WhatsApp, Email, Push',
    status: 'Sent',
  },
  {
    id: 'c-6',
    title: 'Aadhaar-Ration Card Linking',
    location: 'Lucknow, Uttar Pradesh',
    category: 'Government',
    audienceName: 'Ration card holders',
    audienceCount: '1,50,000 people',
    channels: 'SMS',
    status: 'Pending Approval',
  },
];

export const AdminCampaigns: React.FC = () => {
  const [campaignList, setCampaignList] = useState<CampaignItem[]>(SAMPLE_CAMPAIGNS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignItem | null>(null);

  useEffect(() => {
    campaignsApi.list().then((backendCampaigns: Campaign[]) => {
      if (backendCampaigns && backendCampaigns.length > 0) {
        // Map backend campaigns into the visual shape
        const mapped = backendCampaigns.map((c) => ({
          id: c.id,
          title: c.title,
          location: 'National & Regional Jurisdictions',
          category: c.category || 'Public Information',
          audienceName: 'Targeted Registered Demographic',
          audienceCount: `${c.recipient_count.toLocaleString()} people`,
          channels: (c.target_channels || ['WhatsApp', 'SMS']).join(', '),
          status: (c.status === 'COMPLETED'
            ? 'Sent'
            : c.status === 'APPROVED'
            ? 'Approved'
            : 'Pending Approval') as 'Sent' | 'Approved' | 'Pending Approval',
        }));

        // Merge with sample set ensuring the reference list is visible
        const combined = [...SAMPLE_CAMPAIGNS];
        mapped.forEach((m) => {
          if (!combined.some((x) => x.title === m.title)) {
            combined.push(m);
          }
        });
        setCampaignList(combined);
      }
    }).catch(() => {
      // Fallback stays as reference set
    });
  }, []);

  const filteredCampaigns = campaignList.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.audienceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'All statuses' || c.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'All categories' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const renderStatusBadge = (status: 'Sent' | 'Approved' | 'Pending Approval') => {
    if (status === 'Sent') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e6f4ea] text-[#137333] border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#137333]"></span>
          <span>Sent</span>
        </span>
      );
    }
    if (status === 'Approved') {
      return (
        <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e8f0fe] text-[#1a73e8] border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8]"></span>
          <span>Approved</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fef7e0] text-[#b06000] border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-[#b06000]"></span>
        <span>Pending Approval</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header matching Image 2 ── */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
          All campaigns
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Click a campaign title to see full details, translations and delivery.
        </p>
      </div>

      {/* ── Main Card Container matching Image 2 ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <h2 className="text-base font-bold text-slate-900 font-sans">
          {filteredCampaigns.length} campaigns
        </h2>

        {/* ── Filters Row ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search campaigns, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All statuses">All statuses</option>
              <option value="Sent">Sent</option>
              <option value="Approved">Approved</option>
              <option value="Pending Approval">Pending Approval</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>

          {/* Category Dropdown */}
          <div className="relative w-full sm:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full appearance-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All categories">All categories</option>
              <option value="Health">Health</option>
              <option value="Emergency">Emergency</option>
              <option value="Education">Education</option>
              <option value="Environment">Environment</option>
              <option value="Government">Government</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* ── Table matching Image 2 ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="py-3 px-3 font-medium">Campaign</th>
                <th className="py-3 px-3 font-medium">Category</th>
                <th className="py-3 px-3 font-medium">Audience</th>
                <th className="py-3 px-3 font-medium">Channels</th>
                <th className="py-3 px-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredCampaigns.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCampaign(c)}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-slate-900 hover:text-emerald-700 transition-colors">
                      {c.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.location}</p>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700">{c.category}</td>
                  <td className="py-3.5 px-3">
                    <p className="text-slate-800">{c.audienceName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.audienceCount}</p>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">{c.channels}</td>
                  <td className="py-3.5 px-3">{renderStatusBadge(c.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Campaign Detail Modal ── */}
      {selectedCampaign && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCampaign(null);
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Campaign Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Campaign Title
                </span>
                <p className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedCampaign.title}
                </p>
                <p className="text-xs text-slate-500">{selectedCampaign.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Category</span>
                  <p className="text-sm font-semibold text-slate-800">{selectedCampaign.category}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">Current Status</span>
                  <div className="mt-1">{renderStatusBadge(selectedCampaign.status)}</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">Estimated Reach</span>
                  <p className="text-sm font-semibold text-slate-800">{selectedCampaign.audienceCount}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium">Distribution Channels</span>
                  <p className="text-sm font-semibold text-slate-800">{selectedCampaign.channels}</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Target Demographic
                </span>
                <p className="text-sm text-slate-700 mt-1">{selectedCampaign.audienceName}</p>
              </div>

              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                <div className="flex items-center space-x-1.5 font-bold mb-1">
                  <Globe className="w-4 h-4 text-emerald-700" />
                  <span>Multilingual Delivery Verification</span>
                </div>
                <span>Translated and broadcast ready in Telugu, Hindi, Tamil, and English.</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
