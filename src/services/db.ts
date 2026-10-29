/**
 * SETUVANA - IndexedDB Offline Storage & Synchronization Engine
 * Guarantees zero data loss in remote tribal areas without network coverage.
 */

import { Homestay, Booking, OfflineActionQueueItem, ConnectivityObservation } from '../types';

const DB_NAME = 'setuvana_offline_db';
const DB_VERSION = 1;

interface SetuvanaDB {
  homestays: Homestay;
  bookings: Booking;
  offline_queue: OfflineActionQueueItem;
  connectivity_logs: ConnectivityObservation;
  arrival_packs: any;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('homestays')) {
        db.createObjectStore('homestays', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('bookings')) {
        const bookingStore = db.createObjectStore('bookings', { keyPath: 'id' });
        bookingStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        bookingStore.createIndex('status', 'status', { unique: false });
      }
      if (!db.objectStoreNames.contains('offline_queue')) {
        db.createObjectStore('offline_queue', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('connectivity_logs')) {
        db.createObjectStore('connectivity_logs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('arrival_packs')) {
        db.createObjectStore('arrival_packs', { keyPath: 'bookingId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Homestays
export async function idbSaveHomestays(homestays: Homestay[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('homestays', 'readwrite');
    const store = tx.objectStore('homestays');
    homestays.forEach((h) => store.put(h));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetHomestays(): Promise<Homestay[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('homestays', 'readonly');
    const store = tx.objectStore('homestays');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGetHomestayById(id: string): Promise<Homestay | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('homestays', 'readonly');
    const store = tx.objectStore('homestays');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Bookings
export async function idbSaveBooking(booking: Booking): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bookings', 'readwrite');
    const store = tx.objectStore('bookings');
    store.put(booking);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetBookings(): Promise<Booking[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bookings', 'readonly');
    const store = tx.objectStore('bookings');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGetBookingById(id: string): Promise<Booking | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('bookings', 'readonly');
    const store = tx.objectStore('bookings');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Offline Queue
export async function idbEnqueueAction(item: OfflineActionQueueItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_queue', 'readwrite');
    const store = tx.objectStore('offline_queue');
    store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetQueue(): Promise<OfflineActionQueueItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_queue', 'readonly');
    const store = tx.objectStore('offline_queue');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function idbRemoveQueueItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_queue', 'readwrite');
    const store = tx.objectStore('offline_queue');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Arrival Packs
export async function idbSaveArrivalPack(bookingId: string, packData: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('arrival_packs', 'readwrite');
    const store = tx.objectStore('arrival_packs');
    store.put({ bookingId, packData, savedAt: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGetArrivalPack(bookingId: string): Promise<any | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('arrival_packs', 'readonly');
    const store = tx.objectStore('arrival_packs');
    const req = store.get(bookingId);
    req.onsuccess = () => resolve(req.result ? req.result.packData : undefined);
    req.onerror = () => reject(req.error);
  });
}

// Clear all local caches safely
export async function idbClearLocalCache(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['homestays', 'offline_queue', 'arrival_packs'], 'readwrite');
    tx.objectStore('homestays').clear();
    tx.objectStore('offline_queue').clear();
    tx.objectStore('arrival_packs').clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
