import React, { useEffect, useState } from 'react';
import { templatesApi } from '../../services/api';
import { MessageTemplate } from '../../types';
import { Modal } from '../../components/common/Modal';
import { FileText, Plus, Trash2, Copy } from 'lucide-react';

export const TemplateLibrary: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Public Awareness');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templatesApi.list();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await templatesApi.create({ title, category, content });
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      loadTemplates();
    } catch (err) {
      console.error('Failed to create template', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await templatesApi.delete(id);
      loadTemplates();
    } catch (err) {
      console.error('Failed to delete template', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Message Template Library</h1>
          <p className="text-sm text-slate-500 mt-1">
            Standardized, pre-approved public messaging frameworks for rapid response authoring.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No templates found. Click "New Template" to add one.
          </div>
        ) : (
          templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                    {tmpl.category}
                  </span>
                  <button
                    onClick={() => handleDelete(tmpl.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{tmpl.title}</h3>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">
                  {tmpl.content}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{tmpl.content.length} characters</span>
                <span>{new Date(tmpl.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Message Template">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Template Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Flood Warning & Relief Distribution"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Public Awareness">Public Awareness</option>
              <option value="Emergency Alerts">Emergency Alerts</option>
              <option value="Healthcare Announcements">Healthcare Announcements</option>
              <option value="Educational Notifications">Educational Notifications</option>
              <option value="Government Policy Updates">Government Policy Updates</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Template Body Content *
            </label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the standard announcement text. Use placeholders like {{location}} if desired..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              {submitting ? 'Creating...' : 'Save Template'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

