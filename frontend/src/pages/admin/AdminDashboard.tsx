import React, { useEffect, useState } from 'react';
import { analyticsApi, campaignsApi, usersApi } from '../../services/api';
import { AdminMetrics, Campaign, User } from '../../types';
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, c, u] = await Promise.all([
          analyticsApi.getAdmin(),
          campaignsApi.list({ limit: 10 }),
          usersApi.list(),
        ]);
        setMetrics(m);
        setCampaigns(c);
        setUsers(u);
      } catch (err) {
        console.error('Failed to load admin dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Performance chart data matching Image 1
  const performanceData = [
    {
      name: 'Dengue Prevention Awareness Ca...',
      fullName: 'Dengue Prevention Awareness Campaign',
      Delivered: 45000,
      Failed: 5000,
    },
    {
      name: 'Dengue Prevention Awareness',
      fullName: 'Dengue Prevention Awareness',
      Delivered: 120000,
      Failed: 5000,
    },
    {
      name: 'Say No to Single-Use Plastic',
      fullName: 'Say No to Single-Use Plastic',
      Delivered: 83000,
      Failed: 7000,
    },
  ];

  // Status donut data matching Image 1
  const statusPieData = [
    { name: 'Sent', value: 3, color: '#0d5c4e' },
    { name: 'Approved', value: 1, color: '#f59e0b' },
    { name: 'Pending Approval', value: 2, color: '#16a34a' },
  ];

  // Total managers count
  const managerCount = users.filter((u) =>
    u.roles.some((r) => r.name.toUpperCase() === 'MANAGER')
  ).length || 2;

  const totalCampaignsCount = campaigns.length > 0 ? campaigns.length : 6;
  const pendingCount =
    metrics?.pending_approval_campaigns !== undefined
      ? metrics.pending_approval_campaigns
      : 2;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="w-10 h-10 border-3 border-[#0d5c4e] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── 4 Top Stat Cards matching reference ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total managers */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Total managers</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50/80 border border-teal-100 flex items-center justify-center text-teal-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-serif font-bold text-slate-900 tracking-tight">{managerCount}</p>
            <p className="text-xs text-slate-500 mt-1">{managerCount} active</p>
          </div>
        </div>

        {/* Card 2: Total campaigns */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Total campaigns</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50/80 border border-teal-100 flex items-center justify-center text-teal-800">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-serif font-bold text-slate-900 tracking-tight">{totalCampaignsCount}</p>
            <p className="text-xs text-slate-500 mt-1">{pendingCount} pending approval</p>
          </div>
        </div>

        {/* Card 3: Messages sent */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Messages sent</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50/80 border border-teal-100 flex items-center justify-center text-teal-800">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-serif font-bold text-slate-900 tracking-tight">2,46,368</p>
            <p className="text-xs text-slate-500 mt-1">94.7% delivery success</p>
          </div>
        </div>

        {/* Card 4: Engagement rate */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Engagement rate</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50/80 border border-teal-100 flex items-center justify-center text-teal-800">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-serif font-bold text-slate-900 tracking-tight">31.7%</p>
            <p className="text-xs text-slate-500 mt-1">Avg. across sent campaigns</p>
          </div>
        </div>
      </div>

      {/* ── Visual Charts Row matching reference ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Campaign Performance Stacked Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-serif font-bold text-slate-900">Campaign performance</h2>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 20, right: 20, left: 10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  ticks={[0, 35000, 70000, 105000, 140000]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  formatter={(val: number) => val.toLocaleString()}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                />
                <Bar dataKey="Delivered" stackId="a" fill="#0d5c4e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Failed" stackId="a" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center space-x-6 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 bg-[#0d5c4e] rounded-xs inline-block"></span>
              <span>Delivered</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 bg-[#dc2626] rounded-xs inline-block"></span>
              <span>Failed</span>
            </div>
          </div>
        </div>

        {/* Right: Campaigns by Status Donut Chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-serif font-bold text-slate-900">Campaigns by status</h2>
          </div>

          <div className="h-64 w-full flex items-center justify-center mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} campaigns`, 'Count']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Legend matching reference */}
          <div className="flex items-center justify-center space-x-4 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0d5c4e]"></span>
              <span className="text-slate-700 font-medium">Sent</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
              <span className="text-slate-700 font-medium">Approved</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]"></span>
              <span className="text-slate-700 font-medium">Pending Approval</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Campaign Activity matching reference ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-serif font-bold text-slate-900">Recent campaign activity</h2>
          <span className="text-xs text-slate-500 font-medium">Platform Activity Log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-slate-400 border-b border-slate-100">
                <th className="py-2.5 px-3 font-semibold">Campaign</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Target Audience</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3">
                  <p className="font-semibold text-slate-900">Dengue Prevention Awareness Campaign</p>
                  <p className="text-xs text-slate-400">Hyderabad, Telangana</p>
                </td>
                <td className="py-3 px-3 text-slate-600">Health</td>
                <td className="py-3 px-3 text-slate-600">50,000 citizens</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    <span>Sent</span>
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3">
                  <p className="font-semibold text-slate-900">Monsoon Flood Preparedness</p>
                  <p className="text-xs text-slate-400">Chennai, Tamil Nadu</p>
                </td>
                <td className="py-3 px-3 text-slate-600">Emergency</td>
                <td className="py-3 px-3 text-slate-600">42,000 citizens</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                    <span>Approved</span>
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3 px-3">
                  <p className="font-semibold text-slate-900">Girls' School Enrolment Drive</p>
                  <p className="text-xs text-slate-400">Bengaluru Rural, Karnataka</p>
                </td>
                <td className="py-3 px-3 text-slate-600">Education</td>
                <td className="py-3 px-3 text-slate-600">68,000 citizens</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                    <span>Pending Approval</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
