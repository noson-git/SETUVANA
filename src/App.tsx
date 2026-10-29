/**
 * SETUVANA - Master Application Component
 * Smart Rural Tourism, Offline-First Homestay Booking & AI Connectivity Platform
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Language,
  UserRole,
  ConnectivityMode,
  Homestay,
  Booking,
  CoordinatorTask,
  ConnectivityObservation,
  OfflineActionQueueItem,
  SmartCallNotification,
} from './types';
import { translations } from './translations';
import { Header } from './components/Header';
import { ConnectivityPanel } from './components/ConnectivityPanel';
import { SmartCallModal } from './components/SmartCallModal';
import { GoogleCalendarModal } from './components/GoogleCalendarModal';
import { ArrivalPackModal } from './components/ArrivalPackModal';
import { BookabilityPassportModal } from './components/BookabilityPassportModal';
import { ConnectivityMapModal } from './components/ConnectivityMapModal';
import { AIStudioModal } from './components/AIStudioModal';
import { TravellerView } from './views/TravellerView';
import { HostView } from './views/HostView';
import { CoordinatorView } from './views/CoordinatorView';
import { AdminView } from './views/AdminView';
import {
  idbGetHomestays,
  idbSaveHomestays,
  idbGetBookings,
  idbSaveBooking,
  idbGetQueue,
  idbEnqueueAction,
  idbRemoveQueueItem,
} from './services/db';
import { INITIAL_HOMESTAYS } from './data/mockData';

export default function App() {
  // Localization & Role State
  const [currentLanguage, setCurrentLanguage] = useState<Language>('or');
  const [currentRole, setCurrentRole] = useState<UserRole>('traveller');
  const [activeTab, setActiveTab] = useState<string>('explore');

  // Connectivity & Low Data State
  const [connectivityMode, setConnectivityMode] = useState<ConnectivityMode>('good');
  const [lowDataMode, setLowDataMode] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [queue, setQueue] = useState<OfflineActionQueueItem[]>([]);

  // Domain Data State
  const [homestays, setHomestays] = useState<Homestay[]>(INITIAL_HOMESTAYS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tasks, setTasks] = useState<CoordinatorTask[]>([]);
  const [observations, setObservations] = useState<ConnectivityObservation[]>([]);

  // Modals Visibility
  const [isConnectivityPanelOpen, setIsConnectivityPanelOpen] = useState(false);
  const [isAIStudioOpen, setIsAIStudioOpen] = useState(false);
  const [isSignalMapOpen, setIsSignalMapOpen] = useState(false);
  const [isBookingsDrawerOpen, setIsBookingsDrawerOpen] = useState(false);

  // Active Item for Modals
  const [smartCallBooking, setSmartCallBooking] = useState<Booking | null>(null);
  const [smartCallNotification, setSmartCallNotification] = useState<SmartCallNotification | null>(null);

  const [arrivalPackBooking, setArrivalPackBooking] = useState<Booking | null>(null);
  const [arrivalPackHomestay, setArrivalPackHomestay] = useState<Homestay | null>(null);

  const [calendarBooking, setCalendarBooking] = useState<Booking | null>(null);
  const [passportHomestay, setPassportHomestay] = useState<Homestay | null>(null);

  // Monitor physical online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setConnectivityMode('good');
      handleManualSync();
    };
    const handleOffline = () => {
      setConnectivityMode('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initial Load from Server & IndexedDB
  useEffect(() => {
    async function loadData() {
      // 1. Load cached homestays & bookings from IndexedDB first for instant UI
      try {
        const cachedH = await idbGetHomestays();
        if (cachedH && cachedH.length > 0) {
          setHomestays(cachedH);
        } else {
          await idbSaveHomestays(INITIAL_HOMESTAYS);
        }

        const cachedB = await idbGetBookings();
        if (cachedB && cachedB.length > 0) {
          setBookings(cachedB);
        }

        const q = await idbGetQueue();
        setQueue(q || []);
      } catch (err) {
        console.warn('Local DB load warning:', err);
      }

      // 2. Fetch fresh state from Server if online
      if (connectivityMode !== 'offline') {
        try {
          const [resH, resB, resT, resO] = await Promise.all([
            fetch('/api/homestays').then((r) => r.json()),
            fetch('/api/bookings').then((r) => r.json()),
            fetch('/api/coordinator/tasks').then((r) => r.json()),
            fetch('/api/connectivity/observations').then((r) => r.json()),
          ]);

          if (resH.success && resH.homestays) {
            setHomestays(resH.homestays);
            await idbSaveHomestays(resH.homestays);
          }
          if (resB.success && resB.bookings) {
            setBookings(resB.bookings);
            for (const b of resB.bookings) {
              await idbSaveBooking(b);
            }
          }
          if (resT.success && resT.tasks) setTasks(resT.tasks);
          if (resO.success && resO.observations) setObservations(resO.observations);

          setLastSyncTime(new Date().toISOString());
        } catch (err) {
          console.warn('Server sync failed, falling back to cached local records:', err);
        }
      }
    }

    loadData();
  }, [connectivityMode]);

  // Synchronization Routine
  const handleManualSync = useCallback(async () => {
    setIsSyncing(true);

    try {
      // 1. Drain pending offline queue items
      const currentQueue = await idbGetQueue();
      for (const item of currentQueue) {
        if (item.actionType === 'create_booking') {
          const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload),
          });
          const data = await res.json();
          if (data.success) {
            await idbRemoveQueueItem(item.id);
          }
        }
      }

      // 2. Fetch updated records
      const [resH, resB, resT, resO] = await Promise.all([
        fetch('/api/homestays').then((r) => r.json()),
        fetch('/api/bookings').then((r) => r.json()),
        fetch('/api/coordinator/tasks').then((r) => r.json()),
        fetch('/api/connectivity/observations').then((r) => r.json()),
      ]);

      if (resH.success && resH.homestays) {
        setHomestays(resH.homestays);
        await idbSaveHomestays(resH.homestays);
      }
      if (resB.success && resB.bookings) {
        setBookings(resB.bookings);
        for (const b of resB.bookings) {
          await idbSaveBooking(b);
        }
      }
      if (resT.success && resT.tasks) setTasks(resT.tasks);
      if (resO.success && resO.observations) setObservations(resO.observations);

      const refreshedQueue = await idbGetQueue();
      setQueue(refreshedQueue || []);
      setLastSyncTime(new Date().toISOString());
    } catch (err) {
      console.error('Manual sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Submit Booking (Online vs Offline queue)
  const handleSubmitBookingRequest = async (bookingData: any): Promise<Booking | null> => {
    if (connectivityMode === 'offline') {
      const qItem: OfflineActionQueueItem = {
        id: `q-${Date.now()}`,
        actionType: 'create_booking',
        payload: bookingData,
        createdAt: new Date().toISOString(),
        attempts: 0,
      };
      await idbEnqueueAction(qItem);
      const q = await idbGetQueue();
      setQueue(q);
      return null;
    }

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Booking submission failed');
    }

    const newBooking: Booking = data.booking;
    setBookings((prev) => [newBooking, ...prev]);
    await idbSaveBooking(newBooking);

    if (data.notification) {
      setSmartCallNotification(data.notification);
    }

    return newBooking;
  };

  // Host Keypad Response / DTMF Handler
  const handleKeypadResponse = async (bookingId: string, dtmfInput: '1' | '2' | '3' | '4') => {
    try {
      const res = await fetch('/api/telephony/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, dtmfInput, actorRole: 'host', actorName: 'Subarna Wadaka' }),
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? data.booking : b)));
        await idbSaveBooking(data.booking);

        // Refresh coordinator tasks if escalated
        if (dtmfInput === '3') {
          const tRes = await fetch('/api/coordinator/tasks').then((r) => r.json());
          if (tRes.success) setTasks(tRes.tasks);
        }
      }
    } catch (err) {
      console.error('Keypad response error:', err);
    }
  };

  // Coordinator Task Resolver
  const handleResolveTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/coordinator/tasks/${taskId}/resolve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
      }
    } catch (err) {
      console.error('Resolve task error:', err);
    }
  };

  // Coordinator Manual In-Person Booking Entry
  const handleRecordManualBooking = async (bookingData: any) => {
    try {
      const res = await fetch('/api/coordinator/manual-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setBookings((prev) => [data.booking, ...prev]);
        await idbSaveBooking(data.booking);
      }
    } catch (err) {
      console.error('Manual booking error:', err);
    }
  };

  // Add Host Homestay
  const handleAddNewHomestay = async (homestayData: any) => {
    try {
      const res = await fetch('/api/homestays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homestayData),
      });
      const data = await res.json();
      if (data.success && data.homestay) {
        setHomestays((prev) => [data.homestay, ...prev]);
        await idbSaveHomestays([data.homestay, ...homestays]);
      }
    } catch (err) {
      console.error('Add homestay error:', err);
    }
  };

  // Add Volunteer Signal Report
  const handleAddConnectivityObservation = async (obsData: any) => {
    try {
      const res = await fetch('/api/connectivity/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obsData),
      });
      const data = await res.json();
      if (data.success && data.observation) {
        setObservations((prev) => [data.observation, ...prev]);
      }
    } catch (err) {
      console.error('Observation error:', err);
    }
  };

  // Reset Demo
  const handleResetDemo = async () => {
    if (confirm('Reset demonstration data to default seed state?')) {
      await fetch('/api/admin/reset-demo', { method: 'POST' });
      setHomestays(INITIAL_HOMESTAYS);
      await idbSaveHomestays(INITIAL_HOMESTAYS);
      const resB = await fetch('/api/bookings').then((r) => r.json());
      if (resB.success) setBookings(resB.bookings);
    }
  };

  // Simulation Triggers for Test Lab
  const handleSimulateConflict = () => {
    if (bookings[0]) {
      setBookings((prev) =>
        prev.map((b, idx) => (idx === 0 ? { ...b, status: 'conflict_review' } : b))
      );
    }
  };

  const handleSimulateMissedCall = () => {
    if (bookings[0]?.notificationHistory[0]) {
      setBookings((prev) =>
        prev.map((b, idx) =>
          idx === 0
            ? {
                ...b,
                notificationHistory: [
                  {
                    ...b.notificationHistory[0],
                    status: 'no_answer',
                    attempts: 2,
                    lastAttemptAt: new Date().toISOString(),
                  },
                ],
              }
            : b
        )
      );
    }
  };

  const handleSimulateDelayedSMS = () => {
    alert('Simulated cellular SMS delay: Plain-text SMS delivery receipt queued.');
  };

  const handleSimulateCoordinatorEscalation = () => {
    setTasks((prev) => [
      {
        id: `task-sim-${Date.now()}`,
        coordinatorId: 'coord-jiten-01',
        homestayId: homestays[0].id,
        homestayName: homestays[0].name,
        hostName: homestays[0].hostName,
        hostPhone: homestays[0].hostPhone,
        taskType: 'unanswered_call_followup',
        title: 'Escalated: SmartCall Unanswered Twice for Ref 4821',
        description: 'Automated 2-call retry threshold reached with host keypad phone. Visit host in person.',
        priority: 'urgent',
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-900 font-sans flex flex-col selection:bg-emerald-900 selection:text-white">
      {/* Global Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        connectivityMode={connectivityMode}
        isSyncing={isSyncing}
        unsyncedCount={queue.length}
        onOpenConnectivityPanel={() => setIsConnectivityPanelOpen(true)}
        onOpenAIStudio={() => setIsAIStudioOpen(true)}
        onOpenSignalMap={() => setIsSignalMapOpen(true)}
        onOpenBookings={() => setIsBookingsDrawerOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Role-Specific Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'explore' && (
          <TravellerView
            currentLanguage={currentLanguage}
            homestays={homestays}
            bookings={bookings}
            connectivityMode={connectivityMode}
            lowDataMode={lowDataMode}
            onOpenBookingDetails={(b) => {
              setSmartCallBooking(b);
              setSmartCallNotification(b.notificationHistory[0] || null);
            }}
            onOpenArrivalPack={(b, h) => {
              setArrivalPackBooking(b);
              setArrivalPackHomestay(h);
            }}
            onOpenGoogleCalendar={(b) => {
              setCalendarBooking(b);
            }}
            onOpenSmartCall={(b) => {
              setSmartCallBooking(b);
              setSmartCallNotification(b.notificationHistory[0] || null);
            }}
            onOpenBookabilityPassport={(h) => setPassportHomestay(h)}
            onSubmitBookingRequest={handleSubmitBookingRequest}
            isBookingsDrawerOpen={isBookingsDrawerOpen}
            setIsBookingsDrawerOpen={setIsBookingsDrawerOpen}
          />
        )}

        {activeTab === 'host' && (
          <HostView
            currentLanguage={currentLanguage}
            homestays={homestays}
            bookings={bookings}
            onOpenSmartCall={(b) => {
              setSmartCallBooking(b);
              setSmartCallNotification(b.notificationHistory[0] || null);
            }}
            onAddNewHomestay={handleAddNewHomestay}
          />
        )}

        {activeTab === 'coordinator' && (
          <CoordinatorView
            currentLanguage={currentLanguage}
            tasks={tasks}
            homestays={homestays}
            bookings={bookings}
            onResolveTask={handleResolveTask}
            onRecordManualBooking={handleRecordManualBooking}
            onOpenSmartCall={(b) => {
              setSmartCallBooking(b);
              setSmartCallNotification(b.notificationHistory[0] || null);
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            currentLanguage={currentLanguage}
            homestays={homestays}
            bookings={bookings}
            onOpenBookabilityPassport={(h) => setPassportHomestay(h)}
            onResetDemo={handleResetDemo}
          />
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="bg-[#133926] text-emerald-100/80 border-t border-emerald-950 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-white font-serif font-bold text-base">
                SETUVANA (ସେତୁବନ)
              </span>
              <p className="text-[11px] text-emerald-300">
                Every Village Connected to Opportunity • Odisha Rural & Tribal Homestay Network
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button
                onClick={() => setIsAIStudioOpen(true)}
                className="hover:text-white underline"
              >
                Gemini AI Studio
              </button>
              <button
                onClick={() => setIsSignalMapOpen(true)}
                className="hover:text-white underline"
              >
                Telecom Signal Map
              </button>
              <button
                onClick={() => setIsConnectivityPanelOpen(true)}
                className="hover:text-white underline"
              >
                Connectivity Test Lab
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-900/60 text-[10px] text-emerald-400/80 flex flex-wrap justify-between items-center gap-2">
            <p>
              Designed for the OSFIC Tribal Homestay Challenge. Operating in full compliance with telecommunications and ethical tribal interaction guidelines.
            </p>
            <p>© 2026 SETUVANA. Odisha, India.</p>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <ConnectivityPanel
        currentLanguage={currentLanguage}
        isOpen={isConnectivityPanelOpen}
        onClose={() => setIsConnectivityPanelOpen(false)}
        connectivityMode={connectivityMode}
        setConnectivityMode={setConnectivityMode}
        lowDataMode={lowDataMode}
        setLowDataMode={setLowDataMode}
        queue={queue}
        onManualSync={handleManualSync}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        cachedHomestaysCount={homestays.length}
        onSimulateConflict={handleSimulateConflict}
        onSimulateMissedCall={handleSimulateMissedCall}
        onSimulateDelayedSMS={handleSimulateDelayedSMS}
        onSimulateCoordinatorEscalation={handleSimulateCoordinatorEscalation}
      />

      <SmartCallModal
        currentLanguage={currentLanguage}
        isOpen={Boolean(smartCallBooking)}
        onClose={() => {
          setSmartCallBooking(null);
          setSmartCallNotification(null);
        }}
        booking={smartCallBooking}
        notification={smartCallNotification}
        onKeypadResponse={handleKeypadResponse}
      />

      <ArrivalPackModal
        currentLanguage={currentLanguage}
        isOpen={Boolean(arrivalPackBooking && arrivalPackHomestay)}
        onClose={() => {
          setArrivalPackBooking(null);
          setArrivalPackHomestay(null);
        }}
        booking={arrivalPackBooking}
        homestay={arrivalPackHomestay}
      />

      <GoogleCalendarModal
        currentLanguage={currentLanguage}
        isOpen={Boolean(calendarBooking)}
        onClose={() => setCalendarBooking(null)}
        booking={calendarBooking}
      />

      <BookabilityPassportModal
        currentLanguage={currentLanguage}
        isOpen={Boolean(passportHomestay)}
        onClose={() => setPassportHomestay(null)}
        homestay={passportHomestay}
        passport={null}
      />

      <ConnectivityMapModal
        currentLanguage={currentLanguage}
        isOpen={isSignalMapOpen}
        onClose={() => setIsSignalMapOpen(false)}
        observations={observations}
        onAddObservation={handleAddConnectivityObservation}
      />

      <AIStudioModal
        currentLanguage={currentLanguage}
        isOpen={isAIStudioOpen}
        onClose={() => setIsAIStudioOpen(false)}
      />
    </div>
  );
}
