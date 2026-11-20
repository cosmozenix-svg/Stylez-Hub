import React, { useState } from 'react';
import {
  ArrowUpRight,
  Globe,
  Twitter,
  Instagram,
  Youtube,
  Github,
  Send,
  MessageSquare,
  Linkedin,
  Facebook,
  Disc as TikTokIcon,
} from 'lucide-react';
import { SocialAccount } from '../types';
import { BRAND } from '../constants/brand';

interface SocialSectionProps {
  socials: SocialAccount[];
}

const renderFallbackIcon = (platform: string) => {
  const p = (platform || '').toLowerCase().trim();
  if (p === 'x' || /\bx\b/.test(p) || p.includes('twitter')) return <Twitter className="w-5 h-5" />;
  if (p.includes('instagram')) return <Instagram className="w-5 h-5" />;
  if (p.includes('youtube')) return <Youtube className="w-5 h-5" />;
  if (p.includes('github')) return <Github className="w-5 h-5" />;
  if (p.includes('telegram')) return <Send className="w-5 h-5" />;
  if (p.includes('discord')) return <MessageSquare className="w-5 h-5" />;
  if (p.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
  if (p.includes('facebook')) return <Facebook className="w-5 h-5" />;
  if (p.includes('tiktok')) return <TikTokIcon className="w-5 h-5" />;
  return <Globe className="w-5 h-5" />;
};

const safeHref = (urlStr: string): string => {
  const trimmed = (urlStr || '').trim();
  if (!trimmed || /^(javascript|data|vbscript):/i.test(trimmed)) return '#';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const formatDisplayUrl = (urlStr: string): string => {
  try {
    const parsed = new URL(safeHref(urlStr));
    const host = parsed.hostname.replace(/^www\./i, '');
    return host + (parsed.pathname !== '/' ? parsed.pathname : '');
  } catch {
    return (urlStr || '').replace(/^https?:\/\/(www\.)?/i, '');
  }
};

export const SocialSection: React.FC<SocialSectionProps> = ({ socials }) => {
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-28 md:pb-20 space-y-8 animate-in fade-in duration-150">
      {/* Studio Channels Masthead */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-semibold text-sky-400 tracking-wide">
            Official Channels & Links
          </p>
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {BRAND.name} Socials
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl break-words">
            {BRAND.description} Connect directly on verified social platforms and community channels.
          </p>
        </div>

        <div className="shrink-0 sm:text-right">
          <span className="block text-[11px] text-slate-400">Active Channels</span>
          <span className="font-mono text-lg font-bold text-white tabular-nums">
            {socials.length}
          </span>
        </div>
      </header>

      {/* Social Channels Directory */}
      {!socials || socials.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/90 bg-[#070e1d] p-10 sm:p-14 text-center space-y-3">
          <div className="w-11 h-11 rounded-xl bg-[#0b162c] border border-sky-400/20 text-sky-400 flex items-center justify-center mx-auto">
            <Globe className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-100 font-semibold">No social links added</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Social profiles can be configured and added from the admin panel.
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
            socials.length >= 3 ? 'lg:grid-cols-3' : ''
          }`}
        >
          {socials.map((item) => {
            const hasCustomLogo =
              Boolean(item.logoUrl && item.logoUrl.trim().length > 0) && !failedLogos[item.id];
            const brandColor = item.color || '#38bdf8';
            const displayUrl = formatDisplayUrl(item.url);
            const targetHref = safeHref(item.url);

            return (
              <a
                key={item.id}
                href={targetHref}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-2xl p-5 flex flex-col justify-between gap-5 group cursor-pointer min-w-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-[#050b18] border border-slate-800 group-hover:border-sky-400/40 transition-colors"
                    style={{
                      color: brandColor,
                    }}
                  >
                    {hasCustomLogo ? (
                      <img
                        src={item.logoUrl}
                        alt={`${item.platform} logo`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setFailedLogos((prev) => ({ ...prev, [item.id]: true }));
                        }}
                      />
                    ) : (
                      renderFallbackIcon(item.platform)
                    )}
                  </div>

                  <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>

                <div className="space-y-1 min-w-0">
                  <h2 className="font-heading text-base sm:text-lg font-bold text-slate-100 group-hover:text-white transition-colors truncate">
                    {item.platform}
                  </h2>
                  <p className="text-xs text-slate-400 font-mono truncate">
                    {displayUrl}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Official link</span>
                  <span className="font-semibold text-sky-400 group-hover:text-sky-300">
                    Open Channel
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
