import React, { useEffect, useState } from 'react';
import { analyticsApi, campaignsApi } from '../../services/api';
import { AdminMetrics, Campaign } from '../../types';
import {
  Megaphone,
  ClipboardCheck,
  MessageSquare,
  Send,
  ShieldCheck,
  Sparkles,
  Radio,
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<'WhatsApp' | 'SMS' | 'Email'>('WhatsApp');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, c] = await Promise.all([
          analyticsApi.getAdmin(),
          campaignsApi.list(),
        ]);
        setMetrics(m);
        setCampaigns(c || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalCampaigns = campaigns.length > 0 ? campaigns.length : metrics?.total_campaigns || 3;
  const pendingCount = metrics?.pending_approval_campaigns || 0;
  const feedbackTotal = metrics?.feedback_count || 0;
  const positiveCount = metrics?.positive_sentiment_count || 0;
  const neutralCount = metrics?.neutral_sentiment_count || 0;
  const negativeCount = metrics?.negative_sentiment_count || 0;
  const sentimentTotal = positiveCount + neutralCount + negativeCount;
  const posPercent = sentimentTotal > 0 ? Math.round((positiveCount / sentimentTotal) * 100) : 0;
  const neuPercent = sentimentTotal > 0 ? Math.round((neutralCount / sentimentTotal) * 100) : 0;
  const negPercent = sentimentTotal > 0 ? Math.round((negativeCount / sentimentTotal) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      {/* ── Header matching reference Image 2 ── */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          Measure What Matters
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
          Insights & feedback
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          See campaign workflow activity and learn from feedback people actually submit.
        </p>
      </div>

      {/* ── Top 3 Stat Cards matching reference Image 2 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Card 1: Campaigns in workspace */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Campaigns in workspace</p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-1">{totalCampaigns}</p>
            <p className="text-[11px] text-slate-400 mt-1">Across all workflow stages</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 flex-shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Awaiting review */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Awaiting review</p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-1">{pendingCount}</p>
            <p className="text-[11px] text-slate-400 mt-1">Needs a human decision</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800 flex-shrink-0">
            <ClipboardCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Feedback received */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Feedback received</p>
            <p className="text-3xl font-serif font-bold text-slate-900 mt-1">{feedbackTotal}</p>
            <p className="text-[11px] text-slate-400 mt-1">{sentimentTotal} classified by a provider</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-800 flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Bottom 2 Cards matching reference Image 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Card: Delivery Performance */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Provider-Reported Only
                </p>
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  Delivery performance
                </h2>
              </div>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <span>Live reports</span>
              </span>
            </div>

            {/* Empty provider report state matching Image 2 */}
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Send className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No provider reports connected
              </h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                Delivered, failed, and response totals will appear here only after a connected channel returns its actual report or webhook.
              </p>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>No simulated delivery counts</span>
              </div>
            </div>
          </div>

          {/* Bottom channel pills matching Image 2 */}
          <div className="flex items-center space-x-3 pt-4 border-t border-slate-100 text-xs">
            {(['WhatsApp', 'SMS', 'Email'] as const).map((channel) => (
              <button
                key={channel}
                onClick={() => setSelectedChannel(channel)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
                  selectedChannel === channel
                    ? 'bg-slate-100 text-slate-900 border-slate-300 font-semibold'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>{channel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Card: Feedback Sentiment */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Voice of the Community
                </p>
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  Feedback sentiment
                </h2>
              </div>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Provider needed</span>
              </span>
            </div>

            {/* Sentiment Progress Bars matching Image 2 */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-medium text-slate-700">Positive</span>
                  </div>
                  <span className="font-bold text-slate-900">{positiveCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${posPercent}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-medium text-slate-700">Neutral</span>
                  </div>
                  <span className="font-bold text-slate-900">{neutralCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${neuPercent}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="font-medium text-slate-700">Negative</span>
                  </div>
                  <span className="font-bold text-slate-900">{negativeCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${negPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Footnote matching Image 2 */}
          <div className="pt-6 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Only English and Hindi feedback is auto-classified by this configured model. Other languages stay unclassified for human review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

