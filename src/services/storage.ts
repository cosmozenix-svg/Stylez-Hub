import { BlogPost, NewsItem, SocialAccount, AdminCredentials } from '../types';

const STORAGE_KEY_BLOGS = 'stylezhub_blogs_v1';
const STORAGE_KEY_NEWS = 'stylezhub_news_v1';
const STORAGE_KEY_SOCIALS = 'stylezhub_socials_v1';
const STORAGE_KEY_CREDENTIALS = 'stylezhub_admin_credentials_v1';

const INITIAL_BLOGS: BlogPost[] = [];
const INITIAL_NEWS: NewsItem[] = [];

const INITIAL_SOCIALS: SocialAccount[] = [
  {
    id: 'social-1',
    platform: 'X (Twitter)',
    logoUrl: '',
    color: '#38bdf8',
    url: 'https://x.com',
  },
  {
    id: 'social-2',
    platform: 'Instagram',
    logoUrl: '',
    color: '#3b82f6',
    url: 'https://instagram.com',
  },
  {
    id: 'social-3',
    platform: 'Telegram',
    logoUrl: '',
    color: '#0ea5e9',
    url: 'https://telegram.org',
  },
  {
    id: 'social-4',
    platform: 'GitHub',
    logoUrl: '',
    color: '#94a3b8',
    url: 'https://github.com',
  },
];

const DEFAULT_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  password: 'admin123',
};

// In-memory fallback in case localStorage is disabled or restricted in sandboxed iframes
const memoryStore: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // fallback to memoryStore
  }
  return memoryStore[key] || null;
}

function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return true;
    }
  } catch {
    // quota exceeded or security error, save to memoryStore
  }
  memoryStore[key] = value;
  return true;
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
  delete memoryStore[key];
}

export const storageService = {
  getBlogs(): BlogPost[] {
    try {
      const data = safeGetItem(STORAGE_KEY_BLOGS);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.filter((b) => b && typeof b === 'object' && typeof b.id === 'string');
        }
      }
    } catch {
      // storage or JSON parse error
    }
    this.saveBlogs(INITIAL_BLOGS);
    return INITIAL_BLOGS;
  },

  saveBlogs(blogs: BlogPost[]): boolean {
    if (!Array.isArray(blogs)) return false;
    return safeSetItem(STORAGE_KEY_BLOGS, JSON.stringify(blogs));
  },

  getNews(): NewsItem[] {
    try {
      const data = safeGetItem(STORAGE_KEY_NEWS);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.filter((n) => n && typeof n === 'object' && typeof n.id === 'string');
        }
      }
    } catch {
      // storage or JSON parse error
    }
    this.saveNews(INITIAL_NEWS);
    return INITIAL_NEWS;
  },

  saveNews(news: NewsItem[]): boolean {
    if (!Array.isArray(news)) return false;
    return safeSetItem(STORAGE_KEY_NEWS, JSON.stringify(news));
  },

  getSocials(): SocialAccount[] {
    try {
      const data = safeGetItem(STORAGE_KEY_SOCIALS);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter((s) => s && typeof s === 'object' && typeof s.id === 'string');
        }
      }
    } catch {
      // storage or JSON parse error
    }
    this.saveSocials(INITIAL_SOCIALS);
    return INITIAL_SOCIALS;
  },

  saveSocials(socials: SocialAccount[]): boolean {
    if (!Array.isArray(socials)) return false;
    return safeSetItem(STORAGE_KEY_SOCIALS, JSON.stringify(socials));
  },

  getCredentials(): AdminCredentials {
    try {
      const data = safeGetItem(STORAGE_KEY_CREDENTIALS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && typeof parsed.username === 'string' && typeof parsed.password === 'string') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    this.saveCredentials(DEFAULT_CREDENTIALS);
    return DEFAULT_CREDENTIALS;
  },

  saveCredentials(credentials: AdminCredentials): boolean {
    if (!credentials || !credentials.username || !credentials.password) return false;
    return safeSetItem(STORAGE_KEY_CREDENTIALS, JSON.stringify(credentials));
  },

  resetAll(): void {
    safeRemoveItem('alokpat_blogs_v2');
    safeRemoveItem('alokpat_news_v2');
    safeRemoveItem('alokpat_socials_v2');
    safeRemoveItem('alokpat_admin_credentials_v2');
    safeRemoveItem(STORAGE_KEY_BLOGS);
    safeRemoveItem(STORAGE_KEY_NEWS);
    safeRemoveItem(STORAGE_KEY_SOCIALS);
    safeRemoveItem(STORAGE_KEY_CREDENTIALS);
    this.saveBlogs(INITIAL_BLOGS);
    this.saveNews(INITIAL_NEWS);
    this.saveSocials(INITIAL_SOCIALS);
    this.saveCredentials(DEFAULT_CREDENTIALS);
  },
};
