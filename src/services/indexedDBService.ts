import { Progress, DailyStudyRecord } from '@/types';
import { Backup } from './dataService';

const DB_NAME = 'interview-prep-db';
const DB_VERSION = 1;

interface ProgressRecord {
  questionId: string;
  data: Progress;
}

interface BackupRecord {
  id: string;
  date: string;
  data: Backup['data'];
}

interface SettingRecord {
  key: string;
  value: any;
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.db) {
      return Promise.resolve(this.db);
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB打开失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'questionId' });
        }

        if (!db.objectStoreNames.contains('backups')) {
          db.createObjectStore('backups', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }

        if (!db.objectStoreNames.contains('dailyRecords')) {
          const dailyStore = db.createObjectStore('dailyRecords', { keyPath: 'date' });
          dailyStore.createIndex('date', 'date', { unique: true });
        }
      };
    });

    return this.dbPromise;
  }

  async saveProgress(progress: Progress): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['progress'], 'readwrite');
      const store = transaction.objectStore('progress');
      const request = store.put({ questionId: progress.questionId, data: progress });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getProgress(questionId: string): Promise<Progress | null> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['progress'], 'readonly');
      const store = transaction.objectStore('progress');
      const request = store.get(questionId);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllProgress(): Promise<Record<string, Progress>> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['progress'], 'readonly');
      const store = transaction.objectStore('progress');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const results = request.result as ProgressRecord[];
        const progressMap: Record<string, Progress> = {};
        results.forEach(record => {
          progressMap[record.questionId] = record.data;
        });
        resolve(progressMap);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveAllProgress(progressMap: Record<string, Progress>): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['progress'], 'readwrite');
      const store = transaction.objectStore('progress');
      
      const promises = Object.entries(progressMap).map(([questionId, progress]) => {
        return new Promise<void>((res, rej) => {
          const request = store.put({ questionId, data: progress });
          request.onsuccess = () => res();
          request.onerror = () => rej(request.error);
        });
      });
      
      Promise.all(promises)
        .then(() => resolve())
        .catch(err => reject(err));
    });
  }

  async clearProgress(): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['progress'], 'readwrite');
      const store = transaction.objectStore('progress');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async saveDailyRecord(record: DailyStudyRecord): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['dailyRecords'], 'readwrite');
      const store = transaction.objectStore('dailyRecords');
      const request = store.put(record);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDailyRecords(): Promise<DailyStudyRecord[]> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['dailyRecords'], 'readonly');
      const store = transaction.objectStore('dailyRecords');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveSetting(key: string, value: any): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting<T>(key: string): Promise<T | null> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result as SettingRecord | undefined;
        resolve(result ? result.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveBackup(backup: Backup): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['backups'], 'readwrite');
      const store = transaction.objectStore('backups');
      const request = store.put({ id: backup.id, date: backup.date, data: backup.data });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllBackups(): Promise<Backup[]> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['backups'], 'readonly');
      const store = transaction.objectStore('backups');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const results = request.result as BackupRecord[];
        const backups: Backup[] = results.map(r => ({
          id: r.id,
          date: r.date,
          size: new Blob([JSON.stringify(r.data)]).size,
          data: r.data
        }));
        resolve(backups);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteBackup(id: string): Promise<void> {
    const db = await this.openDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['backups'], 'readwrite');
      const store = transaction.objectStore('backups');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData(): Promise<void> {
    const db = await this.openDB();
    
    const stores = ['progress', 'dailyRecords', 'settings', 'backups'];
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(stores, 'readwrite');
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      
      stores.forEach(storeName => {
        transaction.objectStore(storeName).clear();
      });
    });
  }

  async exportToJSON(): Promise<Blob> {
    const progress = await this.getAllProgress();
    const dailyRecords = await this.getAllDailyRecords();
    const backups = await this.getAllBackups();
    
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      source: 'indexeddb',
      progress,
      dailyRecords,
      backupCount: backups.length
    };
    
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  }

  async getStorageUsage(): Promise<{ used: number; quota: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    return { used: 0, quota: 0 };
  }
}

export const indexedDBService = new IndexedDBService();
export default indexedDBService;
