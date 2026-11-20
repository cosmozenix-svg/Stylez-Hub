import React from 'react';
import {
  ExternalLink,
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

export const SocialSection: React.FC<SocialSectionProps> = ({ socials }) => {
  const renderFallbackIcon = (platform: string) => {
    const p = (platform || '').toLowerCase().trim();
    if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-4 h-4" />;
    if (p.includes('instagram')) return <Instagram className="w-4 h-4" />;
    if (p.includes('youtube')) return <Youtube className="w-4 h-4" />;
    if (p.includes('github')) return <Github className="w-4 h-4" />;
    if (p.includes('telegram')) return <Send className="w-4 h-4" />;
    if (p.includes('discord')) return <MessageSquare className="w-4 h-4" />;
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (p.includes('facebook')) return <Facebook className="w-4 h-4" />;
    if (p.includes('tiktok')) return <TikTokIcon className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  const formatDisplayUrl = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
      return parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
    } catch {
      return (urlStr || '').replace(/^https?:\/\/(www\.)?/, '');
    }
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-6 pb-28 md:pb-16 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-blue-500/15">
        <div className="min-w-0">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            {BRAND.name} Socials
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 break-words">
            {BRAND.description} Official profiles & channels.
          </p>
        </div>
        <div className="p-2.5 rounded-xl glass-panel border border-blue-500/20 text-sky-400 shrink-0">
          <Globe className="w-5 h-5" />
        </div>
      </div>

      {/* Social Links Grid */}
      {!socials || socials.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 sm:p-10 text-center space-y-2.5 mt-4 border border-blue-500/15">
          <div className="w-11 h-11 rounded-xl bg-[#0b162c] border border-blue-500/20 text-sky-400 flex items-center justify-center mx-auto">
            <Globe className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-100 font-semibold">No social links added</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Social profiles can be configured and added from the admin panel.
          </p>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 ${
            socials.length >= 3 ? 'lg:grid-cols-3' : ''
          }`}
        >
          {socials.map((item) => {
            const hasCustomLogo = Boolean(item.logoUrl && item.logoUrl.trim().length > 0);
            const brandColor = item.color || '#38bdf8';
            const displayUrl = formatDisplayUrl(item.url);

            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                role="button"
                className="glass-card rounded-2xl p-4 flex items-center justify-between gap-3 group cursor-pointer border border-blue-500/15 hover:border-sky-400/40 transition-all min-w-0"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 bg-[#060d1c] border border-blue-500/20"
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
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      renderFallbackIcon(item.platform)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="font-heading text-sm sm:text-base font-semibold text-slate-100 group-hover:text-sky-300 transition-colors truncate">
                      {item.platform}
                    </h2>
                    <p className="text-xs text-slate-400 truncate">
                      {displayUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-sky-400 font-medium group-hover:text-sky-300 transition-colors shrink-0">
                  <span className="hidden sm:inline">Visit</span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};
