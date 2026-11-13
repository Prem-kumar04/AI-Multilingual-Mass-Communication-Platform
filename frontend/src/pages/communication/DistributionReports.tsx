import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../services/api';
import { CommTeamMetrics } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { CheckCircle2, Clock, XCircle, FileCheck2 } from 'lucide-react';

export const DistributionReports: React.FC = () => {
  const [metrics, setMetrics] = useState<CommTeamMetrics | null>(null);

  useEffect(() => {
    analyticsApi.getCommTeam().then(setMetrics);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Distribution & Clearance Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Multi-channel broadcast performance, clearance volumes, and failure logs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Processed Campaigns" value={metrics?.total_submitted_campaigns || 0} icon={CheckCircle2} color="indigo" />
        <StatCard title="Approved For Broadcast" value={metrics?.approved_awaiting_distribution || 0} icon={FileCheck2} color="emerald" />
        <StatCard title="Pending Review" value={metrics?.pending_approval_campaigns || 0} icon={Clock} color="amber" />
        <StatCard title="Returned Revisions" value={metrics?.rejected_campaigns || 0} icon={XCircle} color="rose" />
      </div>
    </div>
  );
};

