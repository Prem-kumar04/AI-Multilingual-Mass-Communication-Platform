import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../services/api';
import { ManagerMetrics } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { Layers, Users, CheckCircle, Clock } from 'lucide-react';

export const ManagerReports: React.FC = () => {
  const [metrics, setMetrics] = useState<ManagerMetrics | null>(null);

  useEffect(() => {
    analyticsApi.getManager().then(setMetrics);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Campaign Performance & Activity Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Author-level campaign throughput, approval metrics, and reach performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Authored" value={metrics?.my_total_campaigns || 0} icon={Layers} color="blue" />
        <StatCard title="Approved Rate" value={metrics?.my_approved_campaigns || 0} icon={CheckCircle} color="emerald" />
        <StatCard title="Under Review" value={metrics?.my_pending_campaigns || 0} icon={Clock} color="amber" />
        <StatCard title="Audience Potential" value={(metrics?.total_audience_reach || 0).toLocaleString()} icon={Users} color="indigo" />
      </div>
    </div>
  );
};

