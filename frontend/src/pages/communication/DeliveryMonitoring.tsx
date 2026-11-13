import React from 'react';
import { Activity, Radio, RefreshCw } from 'lucide-react';

export const DeliveryMonitoring: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Delivery Monitoring & Telemetry</h1>
        <p className="text-sm text-slate-500 mt-1">Live webhook delivery receipts, channel SLA status, and retry queues.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Channel Delivery Streams</span>
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active Listeners
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-800">WhatsApp Business</p>
            <p className="text-slate-500 mt-1">Status: Active Gateway</p>
            <p className="text-emerald-600 font-semibold mt-2">Delivery SLA: 98.4%</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-800">National SMS DLT</p>
            <p className="text-slate-500 mt-1">Status: Active Gateway</p>
            <p className="text-emerald-600 font-semibold mt-2">Delivery SLA: 99.1%</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="font-bold text-slate-800">Gov Public Email</p>
            <p className="text-slate-500 mt-1">Status: Active Gateway</p>
            <p className="text-emerald-600 font-semibold mt-2">Delivery SLA: 96.8%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

