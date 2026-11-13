import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { audienceApi } from '../../services/api';

interface SegmentItem {
  id: string;
  name: string;
  region: string;
  size: string;
  languages: string;
  preferredChannel: string;
  optIn: string;
  campaignsCount: number;
}

const SAMPLE_SEGMENTS: SegmentItem[] = [
  {
    id: 's-1',
    name: 'Residents of Hyderabad',
    region: 'Telangana',
    size: '1,25,000',
    languages: 'Telugu, Hindi, English',
    preferredChannel: 'WhatsApp',
    optIn: '82%',
    campaignsCount: 1,
  },
  {
    id: 's-2',
    name: 'Low-lying area households',
    region: 'Tamil Nadu',
    size: '42,000',
    languages: 'Tamil',
    preferredChannel: 'SMS',
    optIn: '76%',
    campaignsCount: 1,
  },
  {
    id: 's-3',
    name: 'Parents of children aged 6-14',
    region: 'Karnataka',
    size: '68,000',
    languages: 'Kannada',
    preferredChannel: 'SMS',
    optIn: '69%',
    campaignsCount: 1,
  },
  {
    id: 's-4',
    name: 'Shop owners and residents',
    region: 'Maharashtra',
    size: '90,000',
    languages: 'Hindi, English',
    preferredChannel: 'WhatsApp',
    optIn: '71%',
    campaignsCount: 1,
  },
  {
    id: 's-5',
    name: 'Ration card holders',
    region: 'Uttar Pradesh',
    size: '1,50,000',
    languages: 'Hindi',
    preferredChannel: 'SMS',
    optIn: '64%',
    campaignsCount: 1,
  },
  {
    id: 's-6',
    name: 'Senior citizens (60+)',
    region: 'Andhra Pradesh',
    size: '54,000',
    languages: 'Telugu',
    preferredChannel: 'SMS',
    optIn: '58%',
    campaignsCount: 0,
  },
  {
    id: 's-7',
    name: 'College students',
    region: 'Karnataka',
    size: '38,000',
    languages: 'Kannada, English',
    preferredChannel: 'Push',
    optIn: '88%',
    campaignsCount: 0,
  },
];

export const AdminAudiences: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [segments, setSegments] = useState<SegmentItem[]>(SAMPLE_SEGMENTS);
  const [totalReach, setTotalReach] = useState('5,67,000');

  useEffect(() => {
    audienceApi.getSegments().then((liveSegments) => {
      if (liveSegments && liveSegments.length > 0) {
        const mapped: SegmentItem[] = liveSegments.map((s, idx) => ({
          id: s.id,
          name: s.name,
          region: s.filter_criteria?.states?.[0] || 'National',
          size: s.estimated_reach ? s.estimated_reach.toLocaleString() : '50,000',
          languages: (s.filter_criteria?.languages || ['Hindi', 'English']).join(', '),
          preferredChannel: 'WhatsApp',
          optIn: `${75 + (idx % 15)}%`,
          campaignsCount: 1,
        }));

        const combined = [...SAMPLE_SEGMENTS];
        mapped.forEach((m) => {
          if (!combined.some((x) => x.name.toLowerCase() === m.name.toLowerCase())) {
            combined.push(m);
          }
        });
        setSegments(combined);

        const total = combined.reduce((acc, curr) => {
          const num = parseInt(curr.size.replace(/,/g, ''), 10) || 0;
          return acc + num;
        }, 0);
        if (total > 0) {
          setTotalReach(total.toLocaleString('en-IN'));
        }
      }
    }).catch(() => {});
  }, []);

  const filtered = segments.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.languages.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.preferredChannel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header matching Image 3 ── */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
          Audience
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Sample audience segments (demo data).
        </p>
      </div>

      {/* ── Main Card Container matching Image 3 ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-lg font-serif font-bold text-slate-900">
            {totalReach} reachable citizens
          </h2>
        </div>

        {/* ── Search Bar ── */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search segments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* ── Table matching Image 3 ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-500">
                <th className="py-3 px-3 font-medium">Segment</th>
                <th className="py-3 px-3 font-medium">Region</th>
                <th className="py-3 px-3 font-medium">Size</th>
                <th className="py-3 px-3 font-medium">Languages</th>
                <th className="py-3 px-3 font-medium">Preferred channel</th>
                <th className="py-3 px-3 font-medium">Opt-in</th>
                <th className="py-3 px-3 font-medium">Campaigns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-slate-900">{s.name}</td>
                  <td className="py-3.5 px-3 text-slate-700">{s.region}</td>
                  <td className="py-3.5 px-3 font-medium text-slate-800">{s.size}</td>
                  <td className="py-3.5 px-3 text-slate-600">{s.languages}</td>
                  <td className="py-3.5 px-3 text-slate-700">{s.preferredChannel}</td>
                  <td className="py-3.5 px-3 font-medium text-slate-800">{s.optIn}</td>
                  <td className="py-3.5 px-3 text-slate-700">{s.campaignsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
