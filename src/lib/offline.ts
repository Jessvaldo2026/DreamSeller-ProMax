// Offline functionality and service worker management
export class OfflineManager {
  private static dbName = 'DreamSellerProDB';
  private static dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    // Register service worker (skip in StackBlitz/WebContainer)
    if ('serviceWorker' in navigator && !window.location.hostname.includes('webcontainer')) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered');
      } catch (error) {
        if (error instanceof Error) {
          console.warn('Service Worker not supported in this environment:', error.message);
        } else {
          console.warn('Service Worker registration failed with unknown error:', String(error));
        }
      }
    } else {
      console.log('Service Worker skipped - running in development environment');
    }

    // Initialize IndexedDB
    await this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(OfflineManager.dbName, OfflineManager.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create stores for offline data
        if (!db.objectStoreNames.contains('businesses')) {
          db.createObjectStore('businesses', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('revenue')) {
          db.createObjectStore('revenue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id' });
        }
      };
    });
  }

  async saveOfflineData(store: string, data: any): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([store], 'readwrite');
    const objectStore = transaction.objectStore(store);
    await objectStore.put(data);
  }

  async getOfflineData(store: string, key?: string): Promise<any> {
    if (!this.db) return null;

    const transaction = this.db.transaction([store], 'readonly');
    const objectStore = transaction.objectStore(store);

    if (key) {
      return await objectStore.get(key);
    } else {
      return await objectStore.getAll();
    }
  }

  async syncWhenOnline(): Promise<void> {
    if (!navigator.onLine) return;

    // Sync offline data when connection is restored
    const businesses = await this.getOfflineData('businesses');
    const revenue = await this.getOfflineData('revenue');

    // Send to server
    if (businesses?.length) {
      await fetch('/api/sync/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(businesses)
      });
    }

    if (revenue?.length) {
      await fetch('/api/sync/revenue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(revenue)
      });
    }
  }
}

export const offlineManager = new OfflineManager();
