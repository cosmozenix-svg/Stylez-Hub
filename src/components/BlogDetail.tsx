import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Star,
  MessageSquarePlus,
  User,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { BlogPost, BlogLink, PostReview } from '../types';
import { BRAND } from '../constants/brand';

interface BlogDetailProps {
  post: BlogPost;
  onBack: () => void;
  onAddReview?: (postId: string, review: PostReview) => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ post, onBack, onAddReview }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const images = post.images && Array.isArray(post.images) ? post.images : [];

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setActiveImageIndex((idx) => Math.max(0, idx - 1));
      } else if (e.key === 'ArrowRight') {
        setActiveImageIndex((idx) => Math.min(images.length - 1, idx + 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, images.length]);

  const links: BlogLink[] =
    Array.isArray(post.links) && post.links.length > 0
      ? post.links
      : post.link && post.link.url && post.link.text
      ? [post.link]
      : [];

  const reviews: PostReview[] = Array.isArray(post.reviews) ? post.reviews : [];

  let dateFormatted = 'Recently';
  let timeFormatted = '';
  if (post.createdAt) {
    try {
      const d = new Date(post.createdAt);
      if (!isNaN(d.getTime())) {
        dateFormatted = d.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
        timeFormatted = d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch {
      dateFormatted = 'Recently';
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `${post.title} — ${BRAND.name}`,
          url: window.location.href,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const scrollToImage = (index: number) => {
    setActiveImageIndex(index);
    if (carouselRef.current && carouselRef.current.children[index]) {
      const targetElement = carouselRef.current.children[index] as HTMLElement;
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const getContrastTextColor = (hexColor?: string) => {
    if (!hexColor) return '#ffffff';
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

  const paragraphs = (post.description || '')
    .split(/\r?\n\r?\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const handleOpenReviewModal = () => {
    setReviewError('');
    setReviewSuccess(false);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewError('');
    setReviewSuccess(false);
  };

  const handleRatingClick = (rating: number) => {
    setReviewRating(rating);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');

    if (!reviewerName.trim()) {
      setReviewError('Please enter your name.');
      return;
    }

    if (!reviewerEmail.trim()) {
      setReviewError('Please enter your email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reviewerEmail.trim())) {
      setReviewError('Please enter a valid email address.');
      return;
    }

    if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
      setReviewError('Please select a star rating between 1 and 5.');
      return;
    }

    if (!reviewText.trim()) {
      setReviewError('Please write your review.');
      return;
    }

    const newReview: PostReview = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: reviewerName.trim(),
      email: reviewerEmail.trim(),
      rating: reviewRating,
      review: reviewText.trim(),
      createdAt: new Date().toISOString(),
    };

    if (onAddReview) {
      onAddReview(post.id, newReview);
    }

    setReviewSuccess(true);
    setTimeout(() => {
      setReviewerName('');
      setReviewerEmail('');
      setReviewText('');
      setReviewRating(5);
      setIsReviewModalOpen(false);
      setReviewSuccess(false);
    }, 700);
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  return (
    <article className="min-h-screen pb-28 md:pb-16 max-w-3xl mx-auto px-4 sm:px-6 pt-5 animate-in fade-in duration-150">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between py-2 mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-button text-xs font-semibold text-slate-200 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-sky-400" />
          <span>Back to Feed</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-button text-xs font-semibold text-slate-200 hover:text-white cursor-pointer transition-colors"
          title="Share this post"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-xs">Link Copied</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Post Header */}
      <header className="mb-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
          {post.category && (
            <>
              <span className="font-semibold text-sky-400">{post.category}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
            </>
          )}
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{dateFormatted}</span>
          </div>
          {timeFormatted && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono text-[11px]">{timeFormatted}</span>
            </>
          )}
          {reviews.length > 0 && avgRating && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <div className="flex items-center gap-1 text-amber-400 font-semibold font-mono text-[11px]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{avgRating} ({reviews.length})</span>
              </div>
            </>
          )}
        </div>

        <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight break-words">
          {post.title}
        </h1>
      </header>

      <div className="w-full h-px bg-blue-500/15 my-5" />

      {/* 2. Post Description */}
      <section className="mb-7 space-y-4 text-slate-200 text-sm sm:text-base leading-relaxed break-words">
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, index) => (
            <p
              key={index}
              className="whitespace-pre-line font-normal text-slate-200 leading-relaxed break-words"
            >
              {paragraph}
            </p>
          ))
        ) : (
          <p className="whitespace-pre-line font-normal text-slate-200 leading-relaxed break-words">
            {post.description}
          </p>
        )}
      </section>

      {/* 3. Attached Media Carousel Section */}
      {images.length > 0 && (
        <div className="relative mb-7 rounded-2xl overflow-hidden glass-panel border border-blue-500/20 bg-[#050a16]">
          <div
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar aspect-video w-full"
            onScroll={(e) => {
              const target = e.currentTarget;
              const index = Math.round(target.scrollLeft / target.clientWidth);
              if (index !== activeImageIndex && index >= 0 && index < images.length) {
                setActiveImageIndex(index);
              }
            }}
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                className="w-full flex-shrink-0 snap-center relative aspect-video cursor-zoom-in group bg-[#050a16]"
                onClick={() => {
                  setActiveImageIndex(idx);
                  setLightboxOpen(true);
                }}
              >
                <img
                  src={img}
                  alt={`${post.title} - view ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover select-none"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={() => scrollToImage(Math.max(0, activeImageIndex - 1))}
                disabled={activeImageIndex === 0}
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center bg-[#040812]/80 text-white backdrop-blur-sm border border-blue-500/25 transition-opacity cursor-pointer ${
                  activeImageIndex === 0 ? 'opacity-20 pointer-events-none' : 'opacity-85 hover:opacity-100'
                }`}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollToImage(Math.min(images.length - 1, activeImageIndex + 1))}
                disabled={activeImageIndex === images.length - 1}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center bg-[#040812]/80 text-white backdrop-blur-sm border border-blue-500/25 transition-opacity cursor-pointer ${
                  activeImageIndex === images.length - 1 ? 'opacity-20 pointer-events-none' : 'opacity-85 hover:opacity-100'
                }`}
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#040812]/80 text-slate-200 border border-blue-500/25 backdrop-blur-sm">
                <span>
                  {activeImageIndex + 1}/{images.length}
                </span>
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="hover:text-sky-300 ml-0.5 cursor-pointer"
                  title="Expand image"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. Multiple Action Links Section */}
      {links.length > 0 && (
        <div className="mt-6 pt-5 border-t border-blue-500/15 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {links.map((linkItem, idx) => (
            <a
              key={linkItem.id || idx}
              href={linkItem.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: linkItem.color || BRAND.primaryAccent,
                color: getContrastTextColor(linkItem.color || BRAND.primaryAccent),
              }}
              className="w-full py-3.5 px-5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
            >
              <span>{linkItem.text}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* REVIEW SECTION (At the very end of the post page)        */}
      {/* ======================================================== */}
      <section className="mt-10 pt-7 border-t border-blue-500/15 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Reviews</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ({reviews.length})
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Community ratings & feedback on {BRAND.name}
            </p>
          </div>

          {reviews.length > 0 && avgRating && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel border border-blue-500/20 text-xs">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(Number(avgRating))
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold font-mono text-slate-100 text-xs">{avgRating}</span>
            </div>
          )}
        </div>

        {/* "Add Review" Button */}
        <div>
          <button
            onClick={handleOpenReviewModal}
            className="w-full py-3.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-blue-950/60"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Add Review</span>
          </button>
        </div>

        {/* Reviews List Below the "Add Review" Button */}
        <div className="space-y-3 pt-1">
          {reviews.length === 0 ? (
            <div className="glass-card rounded-xl p-7 text-center space-y-1.5 border border-blue-500/15">
              <p className="text-xs font-semibold text-slate-200">No reviews yet</p>
              <p className="text-xs text-slate-400">
                Be the first to share your thoughts by clicking "Add Review" above.
              </p>
            </div>
          ) : (
            reviews.map((rev) => {
              let revDate = 'Recently';
              if (rev.createdAt) {
                try {
                  const rd = new Date(rev.createdAt);
                  if (!isNaN(rd.getTime())) {
                    revDate = rd.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                  }
                } catch {
                  revDate = 'Recently';
                }
              }

              return (
                <div
                  key={rev.id}
                  className="glass-card rounded-xl p-4 space-y-2 border border-blue-500/15 bg-[#081124]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-100 truncate">
                          {rev.name}
                        </span>
                        <span className="text-slate-600 text-[10px]">·</span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {rev.email}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                        {revDate}
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-0.5 flex-shrink-0"
                      title={`${rev.rating} of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal whitespace-pre-line break-words pt-0.5">
                    {rev.review}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* POPUP MODAL FOR ADDING REVIEW */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#020612]/85 backdrop-blur-sm flex items-start sm:items-center justify-center p-3.5 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="glass-panel rounded-2xl w-full max-w-md p-4 sm:p-5 border border-blue-500/25 bg-[#0a1326] space-y-4 my-4 sm:my-auto max-h-[92dvh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-blue-500/15">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-950/70 border border-blue-500/30 flex items-center justify-center text-sky-400">
                  <MessageSquarePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-slate-100">
                    Add Review
                  </h3>
                  <p className="text-[11px] text-slate-400">Share your rating and thoughts</p>
                </div>
              </div>
              <button
                onClick={handleCloseReviewModal}
                className="p-2 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                aria-label="Close review dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewError && (
              <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            {reviewSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Review posted successfully!</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  <span>Name *</span>
                </label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Your full name or display name"
                  className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>Email *</span>
                </label>
                <input
                  type="email"
                  required
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rating *</span>
                  </label>
                  <span className="text-[11px] font-mono text-amber-300 font-semibold">
                    {reviewRating} of 5 stars
                  </span>
                </div>

                <div
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#050a16] border border-blue-500/20"
                  onMouseLeave={() => setHoverRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (hoverRating || reviewRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer focus:outline-none"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600 hover:text-slate-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">
                  Review *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review or feedback regarding this post..."
                  className="w-full glass-input rounded-lg px-3 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-blue-500/15">
                <button
                  type="button"
                  onClick={handleCloseReviewModal}
                  className="px-4 py-2.5 min-h-[40px] rounded-lg glass-button text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewSuccess}
                  className="px-4 py-2.5 min-h-[40px] rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Post Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-[#020612]/95 flex flex-col items-center justify-center p-3 sm:p-6">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#0a1326] border border-blue-500/30 text-white hover:bg-blue-900/60 cursor-pointer z-10"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={() => scrollToImage(Math.max(0, activeImageIndex - 1))}
                disabled={activeImageIndex === 0}
                className={`absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center bg-[#0a1326]/90 text-white border border-blue-500/30 cursor-pointer z-10 ${
                  activeImageIndex === 0 ? 'opacity-25 pointer-events-none' : 'hover:bg-blue-900/60'
                }`}
                aria-label="Previous lightbox image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollToImage(Math.min(images.length - 1, activeImageIndex + 1))}
                disabled={activeImageIndex === images.length - 1}
                className={`absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center bg-[#0a1326]/90 text-white border border-blue-500/30 cursor-pointer z-10 ${
                  activeImageIndex === images.length - 1 ? 'opacity-25 pointer-events-none' : 'hover:bg-blue-900/60'
                }`}
                aria-label="Next lightbox image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="relative max-w-5xl w-full flex flex-col items-center justify-center gap-3">
            <img
              src={images[activeImageIndex]}
              alt={post.title}
              className="max-h-[82vh] w-auto max-w-full rounded-xl object-contain"
            />
            {images.length > 1 && (
              <span className="text-xs font-mono text-slate-300 bg-[#0a1326]/80 px-3 py-1 rounded-lg border border-blue-500/20">
                {activeImageIndex + 1} / {images.length}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
