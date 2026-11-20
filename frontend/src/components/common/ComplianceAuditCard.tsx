import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Info,
  Check,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { complianceApi } from '../../services/api';
import { ContentQualityReportResponse, ComplianceFlag } from '../../types';

interface ComplianceAuditCardProps {
  campaignId?: string;
  text?: string;
  title?: string;
  category?: string;
  isEmergency?: boolean;
  onAuditCompleted?: (report: ContentQualityReportResponse) => void;
}

export const ComplianceAuditCard: React.FC<ComplianceAuditCardProps> = ({
  campaignId,
  text,
  title,
  category = 'Public Awareness',
  isEmergency = false,
  onAuditCompleted,
}) => {
  const [report, setReport] = useState<ContentQualityReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaignId) {
      complianceApi
        .getCampaignReport(campaignId)
        .then(setReport)
        .catch(() => {
          // No report yet, will run on click
        });
    }
  }, [campaignId]);

  const handleRunAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      let res: ContentQualityReportResponse;
      if (campaignId) {
        res = await complianceApi.validateCampaign(campaignId);
      } else if (text) {
        res = await complianceApi.checkQuality({
          text,
          title,
          category,
          is_emergency: isEmergency,
        });
      } else {
        setError('No content available to audit.');
        setLoading(false);
        return;
      }
      setReport(res);
      if (onAuditCompleted) onAuditCompleted(res);
    } catch (err: any) {
      console.error('Compliance check failed', err);
      setError(err?.response?.data?.detail || 'Failed to complete compliance audit.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-800',
          badge: 'bg-emerald-600 text-white',
          icon: CheckCircle2,
        };
      case 'NEEDS_REVIEW':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-800',
          badge: 'bg-amber-600 text-white',
          icon: AlertTriangle,
        };
      case 'NON_COMPLIANT':
      default:
        return {
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-800',
          badge: 'bg-rose-600 text-white',
          icon: XCircle,
        };
    }
  };

  const statusConfig = report ? getStatusColor(report.compliance_status) : null;
  const StatusIcon = statusConfig ? statusConfig.icon : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">AI Quality & Policy Compliance Clearance</h3>
              {report && (
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${statusConfig?.badge}`}>
                  {report.compliance_status.replace('_', ' ')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Evaluates clarity, reading ease, non-partisan neutrality, PII exposure, and mandatory emergency disclaimers
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunAudit}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Auditing Content...</span>
            </>
          ) : (
            <>
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{report ? 'Re-Run Compliance Check' : 'Run Quality & Compliance Audit'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {report ? (
        <div className="space-y-4">
          {/* Key Metric Score Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Clarity Index
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-bold text-slate-900">{report.clarity_score}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-1">High Citizen Comprehension</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Readability Ease
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-bold text-slate-900">{report.readability_score}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <span className="text-[10px] text-slate-600 font-semibold block mt-1">
                Grade: {report.readability_grade}
              </span>
            </div>

            <div className={`p-3 rounded-xl border ${statusConfig?.bg} ${statusConfig?.border}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Civic Compliance
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-bold text-slate-900">{report.compliance_score}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <span className={`text-[10px] font-bold block mt-1 ${statusConfig?.text}`}>
                {report.compliance_status === 'COMPLIANT'
                  ? 'All Policy Guardrails Passed'
                  : `${report.flags.length} Flag(s) Requiring Attention`}
              </span>
            </div>
          </div>

          {/* Compliance Flags / Policy Violations */}
          {report.flags.length > 0 ? (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Identified Policy Flags</span>
              {report.flags.map((flag, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                    flag.severity === 'CRITICAL'
                      ? 'bg-rose-50 border-rose-200 text-rose-900'
                      : flag.severity === 'WARNING'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  <AlertTriangle
                    className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                      flag.severity === 'CRITICAL'
                        ? 'text-rose-600'
                        : flag.severity === 'WARNING'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{flag.title}</span>
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          flag.severity === 'CRITICAL'
                            ? 'bg-rose-200 text-rose-800'
                            : flag.severity === 'WARNING'
                            ? 'bg-amber-200 text-amber-800'
                            : 'bg-blue-200 text-blue-800'
                        }`}
                      >
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-xs opacity-90">{flag.description}</p>
                    {flag.snippet && (
                      <p className="text-[11px] font-mono bg-white/70 px-2 py-1 rounded border border-black/10 inline-block">
                        Detected: "{flag.snippet}"
                      </p>
                    )}
                    <p className="text-xs font-semibold pt-0.5">
                      💡 Fix: {flag.suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Zero policy violations detected. Content is verified free of exposed PII, non-partisan, and aligned
                with official public dissemination standards.
              </span>
            </div>
          )}

          {/* Suggestions */}
          {report.suggestions.length > 0 && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Editorial Recommendations
              </span>
              <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                {report.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
          Click "Run Quality & Compliance Audit" to evaluate this broadcast for clarity, PII leaks, and official policy compliance.
        </div>
      )}
    </div>
  );
};

