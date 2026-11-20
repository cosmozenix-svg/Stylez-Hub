import React, { useState, useMemo } from 'react';
import { Newspaper, Copy, Check, Search } from 'lucide-react';
import { NewsItem } from '../types';
import { BRAND } from '../constants/brand';

interface NewsSectionProps {
  news: NewsItem[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredNews = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return news;
    return news.filter((item) => item.content.toLowerCase().includes(q));
  }, [news, filterText]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-28 md:pb-20 space-y-8 animate-in fade-in duration-150">
      {/* Editorial News Masthead */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-semibold text-sky-400 tracking-wide">
            Dispatches & Announcements
          </p>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {BRAND.name} News
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl break-words">
            {BRAND.description} Official bulletins, quick releases, and community notes.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="block text-[11px] text-slate-400">Total Bulletins</span>
            <span className="font-mono text-lg font-bold text-white tabular-nums">
              {news.length}
            </span>
          </div>
        </div>
      </header>

      {/* Filter Bar when >= 3 bulletins */}
      {news.length >= 3 && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Filter news bulletins..."
            className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-base sm:text-xs text-slate-100 placeholder-slate-500"
          />
        </div>
      )}

      {/* News Timeline */}
      {!news || news.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/90 bg-[#070e1d] p-10 sm:p-14 text-center space-y-3">
          <div className="w-11 h-11 rounded-xl bg-[#0b162c] border border-sky-400/20 text-sky-400 flex items-center justify-center mx-auto">
            <Newspaper className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-100 font-semibold">No bulletins posted yet</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            News updates and dispatches will appear here when published from the admin panel.
          </p>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/90 bg-[#070e1d] p-10 text-center space-y-2">
          <p className="text-sm text-slate-100 font-semibold">No matching bulletins</p>
          <p className="text-xs text-slate-400">Try clearing your filter query.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {filteredNews.map((item, idx) => {
            let dateStr = 'Recent';
            let timeStr = '';
            if (item.createdAt) {
              try {
                const date = new Date(item.createdAt);
                if (!isNaN(date.getTime())) {
                  dateStr = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  timeStr = date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                }
              } catch {
                dateStr = 'Recent';
              }
            }

            return (
              <article
                key={item.id}
                className="py-6 first:pt-2 grid grid-cols-1 md:grid-cols-[190px_1fr] gap-3 md:gap-8 items-start"
              >
                {/* Left Timestamp Column */}
                <div className="flex md:flex-col items-center md:items-start justify-between gap-1 pt-1">
                  <div className="font-mono text-xs font-semibold text-sky-400 tabular-nums">
                    {dateStr}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 tabular-nums">
                    <span>{timeStr || 'Bulletin'}</span>
                    <span aria-hidden="true">·</span>
                    <span>#{String(filteredNews.length - idx).padStart(2, '0')}</span>
                  </div>
                </div>

                {/* Right Editorial Card */}
                <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-3">
                  <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed whitespace-pre-wrap break-words font-normal">
                    {item.content}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                    <span>{item.content.length} / 1000 chars</span>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.id, item.content)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-lg glass-button text-slate-300 hover:text-white cursor-pointer font-sans text-xs font-medium"
                      aria-label="Copy bulletin text"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-sky-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
