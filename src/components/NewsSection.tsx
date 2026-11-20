import React, { useState } from 'react';
import { Newspaper, Clock, Copy, Check } from 'lucide-react';
import { NewsItem } from '../types';
import { BRAND } from '../constants/brand';

interface NewsSectionProps {
  news: NewsItem[];
}

export const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-6 pb-28 md:pb-16 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-blue-500/15">
        <div className="min-w-0">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            {BRAND.name} News
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 break-words">
            {BRAND.description} Quick announcements & bulletins.
          </p>
        </div>
        <div className="p-2.5 rounded-xl glass-panel border border-blue-500/20 text-sky-400 shrink-0">
          <Newspaper className="w-5 h-5" />
        </div>
      </div>

      {/* News List */}
      {!news || news.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 sm:p-10 text-center space-y-2.5 mt-4 border border-blue-500/15">
          <div className="w-11 h-11 rounded-xl bg-[#0b162c] border border-blue-500/20 text-sky-400 flex items-center justify-center mx-auto">
            <Newspaper className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-100 font-semibold">No bulletins posted yet</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            News updates and dispatches will appear here when published from the admin panel.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {news.map((item) => {
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
              <div
                key={item.id}
                className="glass-card rounded-2xl p-4 sm:p-5 space-y-3 relative group border border-blue-500/15"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-sky-300/90 font-mono text-[11px] min-w-0">
                    <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">
                      {dateStr}
                      {timeStr ? ` · ${timeStr}` : ''}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(item.id, item.content)}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg glass-button text-slate-400 hover:text-white cursor-pointer shrink-0"
                    title="Copy dispatch text"
                    aria-label="Copy bulletin text"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap break-words font-normal">
                  {item.content}
                </p>

                <div className="flex justify-end pt-1">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {item.content.length} / 1000
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
