export interface BlogLink {
  id?: string;
  url: string;
  text: string;
  color: string;
}

export interface PostReview {
  id: string;
  name: string;
  email: string;
  review: string;
  rating: number; // 1 to 5
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  images: string[]; // First image is 16:9 thumbnail, additional images show in gallery
  createdAt: string; // ISO string
  category?: string;
  links?: BlogLink[]; // Multiple links
  link?: BlogLink; // Legacy single link fallback
  reviews?: PostReview[]; // Customer reviews
}

export interface NewsItem {
  id: string;
  content: string; // max 1000 characters
  createdAt: string;
}

export interface SocialAccount {
  id: string;
  platform: string;
  logoUrl: string; // Data URL or web URL or preset identifier
  color: string;
  url: string;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export type MainNavTab = 'home' | 'search' | 'news' | 'social';
export type AdminTab = 'posts' | 'news' | 'social' | 'settings';
export type SortOption = 'newest' | 'oldest' | 'title';

