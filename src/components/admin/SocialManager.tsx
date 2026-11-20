import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit3, X, Check, AlertCircle, Globe, Upload } from 'lucide-react';
import { SocialAccount } from '../../types';
import { BRAND } from '../../constants/brand';
import { ConfirmModal } from '../ConfirmModal';

interface SocialManagerProps {
  socials: SocialAccount[];
  onSaveSocials: (socials: SocialAccount[]) => Promise<void> | void;
}

const normalizeHexColor = (value: string): string => {
  const trimmed = (value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(trimmed) ? trimmed : BRAND.primaryAccent;
};

const compressLogo = (file: File, maxDim = 160): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawData = (e.target?.result as string) || '';
      const img = new Image();
      img.onload = () => {
        const tryCompress = (dim: number): string => {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > dim) {
              height = Math.max(1, Math.round((height * dim) / width));
              width = dim;
            }
          } else if (height > dim) {
            width = Math.max(1, Math.round((width * dim) / height));
            height = dim;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return '';

          ctx.drawImage(img, 0, 0, width, height);
          const pngUrl = canvas.toDataURL('image/png');
          if (pngUrl.length <= 150000) return pngUrl;

          for (const q of [0.82, 0.65, 0.45]) {
            const jpgUrl = canvas.toDataURL('image/jpeg', q);
            if (jpgUrl.length <= 180000) return jpgUrl;
          }
          return '';
        };

        const result = tryCompress(maxDim) || tryCompress(96);
        if (result) {
          resolve(result);
        } else if (rawData.length <= 180000) {
          resolve(rawData);
        } else {
          reject(new Error('Image is too large even after compression.'));
        }
      };
      img.onerror = () => reject(new Error('Invalid or unsupported image file.'));
      img.src = rawData;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};

export const SocialManager: React.FC<SocialManagerProps> = ({ socials, onSaveSocials }) => {
  const [editingItem, setEditingItem] = useState<SocialAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [platform, setPlatform] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [color, setColor] = useState<string>(BRAND.primaryAccent);
  const [url, setUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setPlatform('');
    setLogoUrl('');
    setColor(BRAND.primaryAccent);
    setUrl('');
    setErrorMsg('');
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    resetForm();
    setActionError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: SocialAccount) => {
    setEditingItem(item);
    setPlatform(item.platform || '');
    setLogoUrl(item.logoUrl || '');
    setColor(normalizeHexColor(item.color));
    setUrl(item.url || '');
    setErrorMsg('');
    setActionError('');
    setIsModalOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file for the logo.');
      e.target.value = '';
      return;
    }

    setErrorMsg('');
    try {
      const compressed = await compressLogo(file);
      setLogoUrl(compressed);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to process logo image.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setErrorMsg('');
    const cleanPlatform = platform.trim();
    const rawUrl = url.trim();

    if (!cleanPlatform) {
      setErrorMsg('Please enter the name of the social platform.');
      return;
    }
    if (cleanPlatform.length > 100) {
      setErrorMsg('Platform name must be 100 characters or fewer.');
      return;
    }
    if (!rawUrl) {
      setErrorMsg('Please enter the URL for this platform.');
      return;
    }
    if (/^(javascript|data|vbscript):/i.test(rawUrl)) {
      setErrorMsg('Please enter a valid web link starting with http:// or https://.');
      return;
    }

    const formattedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    try {
      const parsed = new URL(formattedUrl);
      if (!parsed.hostname || !parsed.hostname.includes('.')) {
        setErrorMsg('Please enter a valid domain URL (e.g. https://x.com/yourhandle).');
        return;
      }
    } catch {
      setErrorMsg('Please enter a valid URL (e.g. https://x.com/yourhandle).');
      return;
    }

    if (formattedUrl.length > 1000) {
      setErrorMsg('Profile URL must be 1000 characters or fewer.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        const updated = socials.map((s) =>
          s.id === editingItem.id
            ? {
                ...s,
                platform: cleanPlatform,
                logoUrl,
                color,
                url: formattedUrl,
              }
            : s
        );
        await onSaveSocials(updated);
      } else {
        const newItem: SocialAccount = {
          id: `social-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          platform: cleanPlatform,
          logoUrl,
          color,
          url: formattedUrl,
        };
        await onSaveSocials([...socials, newItem]);
      }

      resetForm();
    } catch {
      setErrorMsg('Failed to save social link to database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId || isSaving) return;
    const targetId = deleteTargetId;
    setDeleteTargetId(null);
    setActionError('');
    setIsSaving(true);
    try {
      await onSaveSocials(socials.filter((s) => s.id !== targetId));
    } catch {
      setActionError('Failed to remove social link from database. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const presetColors = [
    '#2563eb', // Cobalt Blue
    '#38bdf8', // Sky Azure
    '#0ea5e9', // Telegram Blue
    '#1d4ed8', // Royal Blue
    '#6366f1', // Indigo/Discord
    '#ef4444', // Red/YouTube
    '#ec4899', // Pink/Instagram
    '#94a3b8', // Slate/GitHub
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-blue-500/15">
        <div>
          <h2 className="font-heading text-lg font-bold text-slate-100">Manage Socials</h2>
          <p className="text-xs text-slate-400 font-mono">Total {socials.length} links</p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3.5 py-2.5 min-h-[40px] rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm shadow-blue-950/50 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Social</span>
        </button>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError('')}
            className="p-1 text-rose-300 hover:text-white cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {socials.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center space-y-2 border border-blue-500/15">
          <p className="text-sm text-slate-200 font-semibold">No social media profiles added</p>
          <p className="text-xs text-slate-400">Connect your channels to display on the public page.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {socials.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-xl p-3.5 flex items-center justify-between gap-3 border border-blue-500/15 min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 bg-[#060d1c] border border-blue-500/20"
                  style={{
                    color: item.color || '#94a3b8',
                  }}
                >
                  {item.logoUrl ? (
                    <img src={item.logoUrl} alt={item.platform} className="w-full h-full object-cover" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">{item.platform}</h3>
                  <p className="text-[11px] text-slate-400 truncate">{item.url}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEditModal(item)}
                  disabled={isSaving}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg glass-button text-slate-300 hover:text-white disabled:opacity-50 cursor-pointer"
                  title="Edit Social"
                  aria-label={`Edit ${item.platform}`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTargetId(item.id)}
                  disabled={isSaving}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg glass-button text-rose-400 hover:text-rose-200 disabled:opacity-50 cursor-pointer"
                  title="Delete Social"
                  aria-label={`Delete ${item.platform}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#020612]/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-3.5 sm:p-4 overflow-y-auto">
          <div className="glass-panel rounded-2xl w-full max-w-md p-4 sm:p-5 border border-blue-500/25 bg-[#0a1326] space-y-4 my-4 sm:my-auto max-h-[92dvh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-blue-500/15">
              <h3 className="font-heading text-sm font-bold text-slate-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>{editingItem ? 'Edit Social Profile' : 'Add Social Profile'}</span>
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                1. Platform Name *
              </label>
              <input
                type="text"
                maxLength={100}
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="e.g. X, Instagram, Telegram, YouTube"
                className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>2. Upload App Logo</span>
                {logoUrl && <span className="text-[10px] text-emerald-400">Logo loaded</span>}
              </label>

              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden border border-blue-500/20 bg-[#060d1c] flex-shrink-0"
                  style={{ color }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Globe className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex-1 py-2 px-3 min-h-[40px] rounded-lg glass-button text-xs font-medium text-slate-200 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>Choose File</span>
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg glass-button text-slate-400 hover:text-rose-300 cursor-pointer"
                      title="Clear logo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                3. Choose Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded-md cursor-pointer bg-transparent border-0"
                />
                <div className="flex items-center gap-1.5 flex-wrap">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-md transition-transform cursor-pointer border ${
                        color.toLowerCase() === c.toLowerCase() ? 'scale-115 border-white' : 'border-black/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                4. Profile / Channel URL *
              </label>
              <input
                type="url"
                maxLength={1000}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://x.com/yourhandle"
                className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-500/15">
              <button
                type="button"
                onClick={resetForm}
                disabled={isSaving}
                className="px-4 py-2.5 min-h-[40px] rounded-lg glass-button text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2.5 min-h-[40px] rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Social Profile"
        message="Are you sure you want to remove this social link?"
        confirmLabel="Remove"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
