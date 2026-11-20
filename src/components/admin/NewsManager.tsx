import React, { useState } from 'react';
import { Plus, Trash2, Edit3, X, Check, AlertCircle, Newspaper } from 'lucide-react';
import { NewsItem } from '../../types';
import { ConfirmModal } from '../ConfirmModal';

interface NewsManagerProps {
  news: NewsItem[];
  onSaveNews: (news: NewsItem[]) => void;
}

export const NewsManager: React.FC<NewsManagerProps> = ({ news, onSaveNews }) => {
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const MAX_CHARS = 1000;

  const resetForm = () => {
    setContent('');
    setErrorMsg('');
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: NewsItem) => {
    setEditingItem(item);
    setContent(item.content);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setErrorMsg('');
    const trimmed = content.trim();

    if (!trimmed) {
      setErrorMsg('News content cannot be empty.');
      return;
    }

    if (trimmed.length > MAX_CHARS) {
      setErrorMsg(`Content exceeds maximum limit of ${MAX_CHARS} characters.`);
      return;
    }

    if (editingItem) {
      const updated = news.map((n) =>
        n.id === editingItem.id ? { ...n, content: trimmed } : n
      );
      onSaveNews(updated);
    } else {
      const newItem: NewsItem = {
        id: `news-${Date.now()}`,
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      onSaveNews([newItem, ...news]);
    }

    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      onSaveNews(news.filter((n) => n.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-blue-500/15">
        <div>
          <h2 className="font-heading text-lg font-bold text-slate-100">Manage News & Bulletins</h2>
          <p className="text-xs text-slate-400 font-mono">Total {news.length} bulletins (1,000 char max each)</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm shadow-blue-950/50 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Dispatch</span>
        </button>
      </div>

      {news.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center space-y-2 border border-blue-500/15">
          <p className="text-sm text-slate-200 font-semibold">No bulletins found</p>
          <p className="text-xs text-slate-400">Post quick text updates for your audience.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-xl p-4 space-y-2 border border-blue-500/15"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                  {item.content}
                </p>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-lg glass-button text-slate-300 hover:text-white cursor-pointer"
                    title="Edit Bulletin"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(item.id)}
                    className="p-2 rounded-lg glass-button text-rose-400 hover:text-rose-200 cursor-pointer"
                    title="Delete Bulletin"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-blue-500/15">
                <span>{new Date(item.createdAt).toLocaleString()}</span>
                <span className="text-sky-400">{item.content.length} / 1000</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#020612]/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-3.5 sm:p-4 overflow-y-auto">
          <div className="glass-panel rounded-2xl w-full max-w-lg p-4 sm:p-5 border border-blue-500/25 bg-[#0a1326] space-y-4 my-4 sm:my-auto max-h-[92dvh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-blue-500/15">
              <h3 className="font-heading text-sm font-bold text-slate-100 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-sky-400" />
                <span>{editingItem ? 'Edit News Bulletin' : 'Add New Bulletin'}</span>
              </h3>
              <button
                onClick={resetForm}
                className="p-2 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  Bulletin Text (Max 1,000 characters) *
                </label>
                <span
                  className={`text-[11px] font-mono ${
                    content.length > MAX_CHARS ? 'text-rose-400 font-bold' : 'text-sky-400'
                  }`}
                >
                  {content.length} / {MAX_CHARS}
                </span>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={MAX_CHARS}
                rows={6}
                placeholder="Write your news or bulletin dispatch here (up to 1,000 characters)..."
                className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500 leading-relaxed"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-500/15">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 min-h-[40px] rounded-lg glass-button text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2.5 min-h-[40px] rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingItem ? 'Update Bulletin' : 'Post Bulletin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Bulletin"
        message="Are you sure you want to delete this bulletin? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
