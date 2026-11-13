import React, { useEffect, useState, useRef } from 'react';
import { audienceApi } from '../../services/api';
import { AudienceContact } from '../../types';
import { Modal } from '../../components/common/Modal';
import {
  Users2,
  UserPlus,
  Upload,
  Search,
  Filter,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const AudienceManagement: React.FC = () => {
  const [contacts, setContacts] = useState<AudienceContact[]>([]);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Add Contact Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('English');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [gender, setGender] = useState('Male');
  const [ageGroup, setAgeGroup] = useState('26-40');
  const [occupation, setOccupation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // CSV Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvSummary, setCsvSummary] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await audienceApi.getContacts({
        search: search || undefined,
        language: languageFilter || undefined,
        state: stateFilter || undefined,
      });
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [languageFilter, stateFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadContacts();
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await audienceApi.createContact({
        first_name: firstName,
        last_name: lastName || undefined,
        phone_number: phoneNumber,
        email: email || undefined,
        preferred_language: language,
        location_state: state || undefined,
        location_district: district || undefined,
        gender,
        age_group: ageGroup,
        occupation: occupation || undefined,
      });
      setIsAddModalOpen(false);
      setFirstName('');
      setLastName('');
      setPhoneNumber('');
      setEmail('');
      loadContacts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    setUploading(true);
    try {
      const summary = await audienceApi.importCsv(csvFile);
      setCsvSummary(summary);
      loadContacts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audience Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage recipient profiles, regional language preferences, and demographic classifications.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setCsvSummary(null);
              setIsCsvModalOpen(true);
            }}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone (+91...), or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Languages</option>
            <option value="Telugu">Telugu</option>
            <option value="Hindi">Hindi</option>
            <option value="Tamil">Tamil</option>
            <option value="Kannada">Kannada</option>
            <option value="Malayalam">Malayalam</option>
            <option value="Marathi">Marathi</option>
            <option value="Bengali">Bengali</option>
            <option value="English">English</option>
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All States</option>
            <option value="Telangana">Telangana</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Kerala">Kerala</option>
            <option value="Delhi">Delhi</option>
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Name</th>
                <th className="py-3 px-4 font-semibold">Phone Number</th>
                <th className="py-3 px-4 font-semibold">Preferred Language</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Demographics</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading contacts...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No contacts matching search filters.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {c.first_name} {c.last_name || ''}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-700">{c.phone_number}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {c.preferred_language}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {c.location_state || '-'} {c.location_district ? `(${c.location_district})` : ''}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {c.gender || ''} {c.age_group ? `• ${c.age_group}` : ''} {c.occupation ? `• ${c.occupation}` : ''}
                    </td>
                    <td className="py-3 px-4">
                      {c.is_subscribed ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Subscribed
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Opted Out
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Contact Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Audience Contact">
        <form onSubmit={handleAddContact} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Ramesh"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Rao"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 00000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Preferred Language *
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Marathi">Marathi</option>
                <option value="Bengali">Bengali</option>
                <option value="English">English</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Telangana"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                District
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Hyderabad"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Contact'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal isOpen={isCsvModalOpen} onClose={() => setIsCsvModalOpen(false)} title="Bulk Import Contacts (CSV)">
        <form onSubmit={handleCsvUpload} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload a CSV containing columns: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">first_name</code>,{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">phone_number</code>,{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">preferred_language</code>,{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">location_state</code>.
          </p>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {csvSummary && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
              <p className="font-bold">Import Completed Successfully!</p>
              <p>Imported: {csvSummary.imported_count} contacts (Total: {csvSummary.total_rows})</p>
            </div>
          )}

          <div className="pt-3 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCsvModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={!csvFile || uploading}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
            >
              {uploading ? 'Importing...' : 'Upload & Ingest'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

