import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, testConnection } from '../lib/firebase';
import { BlogPost, NewsItem, SocialAccount, AdminCredentials, PostReview } from '../types';
import { storageService } from './storage';

// Test connection on module load
testConnection().catch(() => {
  // connection fallback handled
});

export const databaseService = {
  // ==========================================
  // POSTS (Live Cloud Sync)
  // ==========================================
  subscribePosts(callback: (posts: BlogPost[]) => void): Unsubscribe {
    const postsCollectionPath = 'posts';
    try {
      const q = collection(db, postsCollectionPath);
      return onSnapshot(
        q,
        (snapshot) => {
          const items: BlogPost[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as BlogPost;
            items.push({
              ...data,
              id: docSnap.id,
            });
          });

          // Sort by newest first
          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          // Cache in local storage for instant offline access
          storageService.saveBlogs(items);
          callback(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, postsCollectionPath);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, postsCollectionPath);
      return () => {};
    }
  },

  async savePost(post: BlogPost): Promise<void> {
    const path = `posts/${post.id}`;
    try {
      // Clean and sanitize payload to match schema and Firestore limits
      const payload: Record<string, unknown> = {
        id: post.id,
        title: (post.title || 'Untitled Post').slice(0, 250),
        description: (post.description || '').slice(0, 50000),
        createdAt: post.createdAt || new Date().toISOString(),
        images: Array.isArray(post.images) ? post.images.slice(0, 20) : [],
      };

      if (post.category) {
        payload.category = post.category.slice(0, 100);
      }
      if (Array.isArray(post.links)) {
        payload.links = post.links.slice(0, 20);
      }
      if (Array.isArray(post.reviews)) {
        payload.reviews = post.reviews.slice(0, 500);
      }

      await setDoc(doc(db, 'posts', post.id), payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deletePost(postId: string): Promise<void> {
    const path = `posts/${postId}`;
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async addReviewToPost(postId: string, review: PostReview, existingReviews: PostReview[]): Promise<void> {
    const path = `posts/${postId}`;
    try {
      const updatedReviews = [review, ...existingReviews].slice(0, 500);
      await setDoc(doc(db, 'posts', postId), { reviews: updatedReviews }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // ==========================================
  // NEWS (Live Cloud Sync)
  // ==========================================
  subscribeNews(callback: (news: NewsItem[]) => void): Unsubscribe {
    const newsCollectionPath = 'news';
    try {
      const q = collection(db, newsCollectionPath);
      return onSnapshot(
        q,
        (snapshot) => {
          const items: NewsItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as NewsItem;
            items.push({
              ...data,
              id: docSnap.id,
            });
          });

          items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          storageService.saveNews(items);
          callback(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, newsCollectionPath);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, newsCollectionPath);
      return () => {};
    }
  },

  async saveNewsItem(item: NewsItem): Promise<void> {
    const path = `news/${item.id}`;
    try {
      await setDoc(doc(db, 'news', item.id), item, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteNewsItem(itemId: string): Promise<void> {
    const path = `news/${itemId}`;
    try {
      await deleteDoc(doc(db, 'news', itemId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // ==========================================
  // SOCIALS (Live Cloud Sync)
  // ==========================================
  subscribeSocials(callback: (socials: SocialAccount[]) => void): Unsubscribe {
    const socialsCollectionPath = 'socials';
    try {
      const q = collection(db, socialsCollectionPath);
      return onSnapshot(
        q,
        (snapshot) => {
          const items: SocialAccount[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as SocialAccount;
            items.push({
              ...data,
              id: docSnap.id,
            });
          });

          // Deterministic sort: extract numeric timestamp/index from `social-<num>` when available
          items.sort((a, b) => {
            const aMatch = /^social-(\d+)/.exec(a.id);
            const bMatch = /^social-(\d+)/.exec(b.id);
            if (aMatch && bMatch) {
              return Number(aMatch[1]) - Number(bMatch[1]);
            }
            return a.id.localeCompare(b.id);
          });

          storageService.saveSocials(items);
          callback(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, socialsCollectionPath);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, socialsCollectionPath);
      return () => {};
    }
  },

  async saveSocialAccount(item: SocialAccount): Promise<void> {
    const cleanId = (item.id || `social-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
    const path = `socials/${cleanId}`;
    try {
      const cleanLogo = typeof item.logoUrl === 'string' && item.logoUrl.length <= 200000 ? item.logoUrl : '';
      const payload: SocialAccount = {
        id: cleanId,
        platform: (item.platform || 'Social').trim().slice(0, 100) || 'Social',
        url: (item.url || 'https://example.com').trim().slice(0, 1000) || 'https://example.com',
        logoUrl: cleanLogo,
        color: (item.color || '#38bdf8').trim().slice(0, 32) || '#38bdf8',
      };
      await setDoc(doc(db, 'socials', cleanId), payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteSocialAccount(itemId: string): Promise<void> {
    const path = `socials/${itemId}`;
    try {
      await deleteDoc(doc(db, 'socials', itemId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // ==========================================
  // ADMIN CREDENTIALS & SETTINGS
  // ==========================================
  subscribeCredentials(callback: (creds: AdminCredentials) => void): Unsubscribe {
    const settingPath = 'settings';
    try {
      const q = collection(db, settingPath);
      return onSnapshot(
        q,
        (snapshot) => {
          let found: AdminCredentials | null = null;
          snapshot.forEach((docSnap) => {
            if (docSnap.id === 'admin_credentials') {
              found = docSnap.data() as AdminCredentials;
            }
          });

          if (found) {
            storageService.saveCredentials(found);
            callback(found);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, settingPath);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, settingPath);
      return () => {};
    }
  },

  async saveCredentials(creds: AdminCredentials): Promise<void> {
    const path = 'settings/admin_credentials';
    try {
      await setDoc(doc(db, 'settings', 'admin_credentials'), creds, { merge: true });
      storageService.saveCredentials(creds);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Sync entire array helper for admin management
  async syncAllBlogs(blogs: BlogPost[]): Promise<void> {
    storageService.saveBlogs(blogs);
    // Write all updated posts to Firestore
    for (const blog of blogs) {
      await this.savePost(blog).catch(() => {});
    }
  },

  async syncAllNews(news: NewsItem[]): Promise<void> {
    storageService.saveNews(news);
    for (const item of news) {
      await this.saveNewsItem(item).catch(() => {});
    }
  },

  async syncAllSocials(socials: SocialAccount[]): Promise<void> {
    storageService.saveSocials(socials);
    for (const social of socials) {
      await this.saveSocialAccount(social).catch(() => {});
    }
  },

  // Wipe database documents on reset
  async resetDatabase(): Promise<void> {
    storageService.resetAll();
    try {
      const posts = await getDocs(collection(db, 'posts'));
      for (const p of posts.docs) {
        await deleteDoc(doc(db, 'posts', p.id)).catch(() => {});
      }
      const news = await getDocs(collection(db, 'news'));
      for (const n of news.docs) {
        await deleteDoc(doc(db, 'news', n.id)).catch(() => {});
      }
      const socials = await getDocs(collection(db, 'socials'));
      for (const s of socials.docs) {
        await deleteDoc(doc(db, 'socials', s.id)).catch(() => {});
      }
    } catch {
      // ignore
    }
  },
};
