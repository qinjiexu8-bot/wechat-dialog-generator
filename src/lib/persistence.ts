import type { ChatMode, ChatWorkspace } from '@/types';

const DATABASE_NAME = 'wechat-dialog-generator';
const DATABASE_VERSION = 1;
const STORE_NAME = 'app-state';
const STATE_KEY = 'current';

export interface PersistedAppState {
  version: 1;
  chatMode: ChatMode;
  workspaces: Record<ChatMode, ChatWorkspace>;
  updatedAt: number;
}

let saveQueue: Promise<void> = Promise.resolve();

function openDatabase(): Promise<IDBDatabase> {
  if (!window.indexedDB) return Promise.reject(new Error('当前浏览器不支持 IndexedDB'));
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('无法打开本地数据库'));
    request.onblocked = () => reject(new Error('本地数据库正在被其他页面占用'));
  });
}

export async function loadPersistedState(): Promise<PersistedAppState | null> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(STATE_KEY);
    request.onsuccess = () => resolve((request.result as PersistedAppState | undefined) ?? null);
    request.onerror = () => reject(request.error || new Error('读取本地数据失败'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('读取本地数据失败'));
    };
  });
}

function writePersistedState(state: PersistedAppState): Promise<void> {
  return openDatabase().then(database => new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(state, STATE_KEY);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error || new Error('保存本地数据失败'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('保存本地数据失败'));
    };
  }));
}

export function savePersistedState(state: PersistedAppState): Promise<void> {
  saveQueue = saveQueue.catch(() => undefined).then(() => writePersistedState(state));
  return saveQueue;
}
