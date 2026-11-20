import React, { useState, useRef } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { BlogPost, BlogLink } from '../../types';
import { BRAND } from '../../constants/brand';
import { ConfirmModal } from '../ConfirmModal';

interface BlogManagerProps {
  blogs: BlogPost[];
  onSaveBlogs: (blogs: BlogPost[]) => void;
}

const compressImage = (file: File, maxWidth = 960, quality = 0.76): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const PRESET_COLORS = [
  '#2563eb',
  '#0284c7',
  '#1d4ed8',
  '#0ea5e9',
  '#0d9488',
  '#16a34a',
  '#d97706',
  '#ffffff',
];

export const BlogManager: React.FC<BlogManagerProps> = ({ blogs, onSaveBlogs }) => {
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [links, setLinks] = useState<BlogLink[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setImages([]);
    setLinks([]);
    setErrorMsg('');
    setEditingBlog(null);
    setIsCreating(false);
    setIsUploading(false);
  };

  const openCreateModal = () => {
    resetForm();
    setIsCreating(true);
  };

  const openEditModal = (blog: BlogPost) => {
    setEditingBlog(blog);
    setTitle(blog.title || '');
    setDescription(blog.description || '');
    setCategory(blog.category || '');
    setImages(blog.images ? [...blog.images] : []);

    const existingLinks: BlogLink[] =
      Array.isArray(blog.links) && blog.links.length > 0
        ? blog.links.map((l) => ({ ...l, id: l.id || `link-${Math.random()}` }))
        : blog.link && blog.link.url && blog.link.text
        ? [{ ...blog.link, id: `link-${Math.random()}` }]
        : [];

    setLinks(existingLinks);
    setErrorMsg('');
    setIsCreating(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMsg('');

    try {
      const compressedResults: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const compressed = await compressImage(file);
        compressedResults.push(compressed);
      }
      setImages((prev) => [...prev, ...compressedResults]);
    } catch {
      setErrorMsg('Failed to process one or more images. Please try a different photo.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const addLink = () => {
    setLinks((prev) => [
      ...prev,
      {
        id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        url: '',
        text: '',
        color: BRAND.primaryAccent,
      },
    ]);
  };

  const updateLink = (index: number, updates: Partial<BlogLink>) => {
    setLinks((prev) =>
      prev.map((link, idx) => (idx === index ? { ...link, ...updates } : link))
    );
  };

  const removeLink = (indexToRemove: number) => {
    setLinks((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const getContrastTextColor = (hexColor: string) => {
    const hex = hexColor.replace('#', '');
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const yiq = (r * 299 + g * 587 + b * 114) / 1000;
      return yiq >= 150 ? '#040812' : '#ffffff';
    }
    return '#ffffff';
  };

  const handleSave = () => {
    setErrorMsg('');

    if (images.length === 0) {
      setErrorMsg('Please upload at least one image (16:9 thumbnail) from your storage.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Please enter a title for the post.');
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Please write content for the post.');
      return;
    }

    // Ensure total post payload stays safely within Firestore's 1 MiB document limit
    const estimatedBytes =
      images.reduce((sum, img) => sum + img.length, 0) +
      title.length +
      description.length;
    if (estimatedBytes > 880000) {
      setErrorMsg(
        'Selected images exceed the database size limit (~880 KB per post). Please remove 1-2 images or use smaller photos.'
      );
      return;
    }

    const validatedLinks: BlogLink[] = [];
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      if (!link.url.trim() && !link.text.trim()) {
        continue;
      }
      if (!link.url.trim()) {
        setErrorMsg(`Link #${i + 1} is missing a Target Web URL.`);
        return;
      }
      if (!link.text.trim()) {
        setErrorMsg(`Link #${i + 1} is missing button label text.`);
        return;
      }

      validatedLinks.push({
        id: link.id || `link-${Date.now()}-${i}`,
        url: link.url.trim().startsWith('http') ? link.url.trim() : `https://${link.url.trim()}`,
        text: link.text.trim(),
        color: link.color || BRAND.primaryAccent,
      });
    }

    if (editingBlog) {
      const updatedList = blogs.map((b) =>
        b.id === editingBlog.id
          ? {
              ...b,
              title: title.trim(),
              description: description.trim(),
              category: category.trim() || undefined,
              images,
              links: validatedLinks,
              link: validatedLinks[0] || undefined,
            }
          : b
      );
      onSaveBlogs(updatedList);
    } else {
      const newPost: BlogPost = {
        id: `post-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || 'General',
        images,
        createdAt: new Date().toISOString(),
        links: validatedLinks,
        link: validatedLinks[0] || undefined,
        reviews: [],
      };
      onSaveBlogs([newPost, ...blogs]);
    }

    resetForm();
  };

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      onSaveBlogs(blogs.filter((b) => b.id !== deleteTargetId));
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-blue-500/15">
        <div>
          <h2 className="font-heading text-lg font-bold text-slate-100">Manage Posts</h2>
          <p className="text-xs text-slate-400 font-mono">Total {blogs.length} posts</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm shadow-blue-950/50 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* Post Items List */}
      {blogs.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center space-y-2 border border-blue-500/15">
          <p className="text-sm text-slate-200 font-semibold">No posts found</p>
          <p className="text-xs text-slate-400">
            Click "New Post" above to create and publish your first post on {BRAND.name}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {blogs.map((blog) => {
            const postLinksCount = (blog.links && blog.links.length) || (blog.link ? 1 : 0);
            const reviewsCount = blog.reviews ? blog.reviews.length : 0;

            return (
              <div
                key={blog.id}
                className="glass-card rounded-xl p-3.5 flex items-center justify-between gap-3 border border-blue-500/15"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#060d1c] border border-blue-500/20">
                    {blog.images && blog.images[0] ? (
                      <img
                        src={blog.images[0]}
                        alt={blog.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
                        No img
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                      {blog.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 mt-0.5 flex-wrap">
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{blog.images?.length || 0} img</span>
                      {postLinksCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-sky-400">
                            {postLinksCount} {postLinksCount === 1 ? 'link' : 'links'}
                          </span>
                        </>
                      )}
                      {reviewsCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-amber-400 font-medium">
                            {reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEditModal(blog)}
                    className="p-2 rounded-lg glass-button text-slate-300 hover:text-white cursor-pointer"
                    title="Edit Post"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTargetId(blog.id)}
                    className="p-2 rounded-lg glass-button text-rose-400 hover:text-rose-200 cursor-pointer"
                    title="Delete Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal Drawer */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-[#020612]/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="glass-panel rounded-2xl w-full max-w-2xl p-4 sm:p-6 border border-blue-500/25 bg-[#0a1326] max-h-[92dvh] overflow-y-auto space-y-4 my-3 sm:my-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-blue-500/15">
              <h3 className="font-heading text-sm font-bold text-slate-100">
                {editingBlog ? 'Edit Post' : 'Create New Post'}
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

            {/* STEP 1: Post Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                1. Post Title (Prominent & Bold) *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title..."
                className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
              />
            </div>

            {/* STEP 2: Category / Topic */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                2. Category / Topic (Optional)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Updates, Releases, Showcase, Gaming"
                className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
              />
            </div>

            {/* STEP 3: Post Description / Content */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-semibold text-slate-200">
                  3. Post Content / Description *
                </label>
                <span className="text-[10px] text-slate-400 shrink-0">
                  Multi-line & sequences supported
                </span>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Write your post content... Double newlines create paragraphs. Single newlines preserve line-by-line steps."
                className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500 leading-relaxed font-normal"
              />
            </div>

            {/* STEP 4: Upload Images */}
            <div className="space-y-2 pt-2 border-t border-blue-500/15">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>4. Upload Images (1st is 16:9 thumbnail) *</span>
                <span className="text-[11px] font-mono text-sky-400">{images.length} selected</span>
              </label>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-blue-500/30 hover:border-sky-400/70 rounded-xl p-4 text-center cursor-pointer bg-[#060d1c]/70 transition-colors flex flex-col items-center justify-center gap-1.5"
              >
                {isUploading ? (
                  <div className="flex items-center gap-2 text-xs text-sky-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Optimizing image...</span>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-medium text-slate-200">
                      Select images from device storage
                    </span>
                    <span className="text-[10px] text-slate-400">
                      PNG, JPG, WEBP (At least one image required)
                    </span>
                  </>
                )}
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video rounded-lg overflow-hidden border border-blue-500/20 group bg-black"
                    >
                      <img src={img} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded bg-black/80 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 text-[9px] px-1.5 rounded bg-black/75 text-sky-200 font-mono">
                        {idx === 0 ? 'Thumb' : `#${idx + 1}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STEP 5: Multiple Action Links */}
            <div className="pt-2 border-t border-blue-500/15 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block">
                    5. Action Links (Multiple links supported)
                  </label>
                  <p className="text-[10px] text-slate-400">
                    Add custom buttons linking to external URLs or resources.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addLink}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg glass-button text-xs text-sky-300 hover:text-white cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Link</span>
                </button>
              </div>

              {links.length === 0 ? (
                <div className="p-3 rounded-lg border border-dashed border-blue-500/20 text-center">
                  <span className="text-[11px] text-slate-400">
                    No action links added. Click "+ Add Link" to attach buttons to this post.
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {links.map((link, idx) => (
                    <div
                      key={link.id || idx}
                      className="glass-panel rounded-xl p-3.5 space-y-2.5 border border-blue-500/20 bg-[#060d1c]/70 relative"
                    >
                      <div className="flex items-center justify-between pb-1 border-b border-blue-500/15">
                        <span className="text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                          <LinkIcon className="w-3 h-3 text-sky-400" />
                          <span>Link #{idx + 1}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLink(idx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove this link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300">Target Web URL *</label>
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => updateLink(idx, { url: e.target.value })}
                          placeholder="https://example.com"
                          className="w-full glass-input rounded-md px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300">Button Label Text *</label>
                        <input
                          type="text"
                          value={link.text}
                          onChange={(e) => updateLink(idx, { text: e.target.value })}
                          placeholder="e.g. Visit Website, Download, Learn More"
                          className="w-full glass-input rounded-md px-2.5 py-1.5 text-xs text-slate-100"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-slate-300">Button Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={link.color || BRAND.primaryAccent}
                            onChange={(e) => updateLink(idx, { color: e.target.value })}
                            className="w-7 h-7 rounded-md cursor-pointer bg-transparent border-0"
                          />
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {PRESET_COLORS.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => updateLink(idx, { color: c })}
                                style={{ backgroundColor: c }}
                                className={`w-5 h-5 rounded-md border transition-transform cursor-pointer ${
                                  (link.color || BRAND.primaryAccent).toLowerCase() === c.toLowerCase()
                                    ? 'scale-110 border-white'
                                    : 'border-black/50'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-1">
                        <span className="text-[10px] text-slate-400 block mb-1">Button Preview:</span>
                        <div
                          style={{
                            backgroundColor: link.color || BRAND.primaryAccent,
                            color: getContrastTextColor(link.color || BRAND.primaryAccent),
                          }}
                          className="py-2.5 px-3 rounded-lg text-center text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <span>{link.text || `Link #${idx + 1} Label`}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-500/15">
              <button
                type="button"
                onClick={resetForm}
                className="px-3.5 py-2 rounded-lg glass-button text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingBlog ? 'Save Changes' : 'Publish Post'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
