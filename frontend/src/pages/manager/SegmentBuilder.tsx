import React, { useEffect, useState } from 'react';
import { audienceApi } from '../../services/api';
import { AudienceSegment } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Filter, Plus, Users, Globe2, MapPin } from 'lucide-react';

const STATES = [
  'Telangana',
  'Andhra Pradesh',
  'Tamil Nadu',
  'Karnataka',
  'Maharashtra',
  'West Bengal',
  'Kerala',
  'Delhi',
  'Uttar Pradesh',
  'Gujarat',
];

const LANGUAGES = [
  'Telugu',
  'Hindi',
  'Tamil',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Bengali',
  'English',
];

export const SegmentBuilder: React.FC = () => {
  const toast = useToast();
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadSegments = async () => {
    try {
      setLoading(true);
      const data = await audienceApi.getSegments();
      setSegments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSegments();
  }, []);

  const toggleState = (st: string) => {
    if (selectedStates.includes(st)) {
      setSelectedStates(selectedStates.filter((s) => s !== st));
    } else {
      setSelectedStates([...selectedStates, st]);
    }
  };

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== lang));
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  const handleCreateSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await audienceApi.createSegment({
        name,
        description: description || undefined,
        filter_criteria: {
          states: selectedStates.length > 0 ? selectedStates : undefined,
          languages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
        },
      });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setSelectedStates([]);
      setSelectedLanguages([]);
      toast.success('Audience segment created successfully.');
      loadSegments();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create segment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audience Segments</h1>
          <p className="text-sm text-slate-500 mt-1">
            Build dynamic targeting rules based on linguistic demographics and geographic regions.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Segment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading segments...</div>
        ) : segments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No audience segments created yet.
          </div>
        ) : (
          segments.map((seg) => (
            <div
              key={seg.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-base">{seg.name}</h3>
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                    {seg.estimated_reach} reach
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{seg.description || 'Targeting criteria group'}</p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  {seg.filter_criteria?.states && (
                    <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{seg.filter_criteria.states.join(', ')}</span>
                    </div>
                  )}
                  {seg.filter_criteria?.languages && (
                    <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                      <Globe2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{seg.filter_criteria.languages.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                Created on {new Date(seg.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Segment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Audience Segment" maxWidth="xl">
        <form onSubmit={handleCreateSegment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Segment Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Telangana Telugu Rural Advisory"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Farmers and rural residents in Telangana preferring Telugu"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Filter by State(s)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {STATES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => toggleState(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    selectedStates.includes(st)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Filter by Preferred Language(s)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    selectedLanguages.includes(lang)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Segment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

