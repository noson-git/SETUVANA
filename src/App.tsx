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

  // Submit Booking (Online vs Offline queue vs Netlify fallback)
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

    let newBooking: Booking | null = null;
    let notification: SmartCallNotification | null = null;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking) {
          newBooking = data.booking;
          notification = data.notification || null;
        } else {
          throw new Error(data.error || 'Server error');
        }
      } else {
        throw new Error(`HTTP error ${res.status}`);
      }
    } catch (fetchErr) {
      console.warn('Backend unavailable or Netlify static host, executing local SmartCall demo simulation:', fetchErr);

      // Resilient local simulation fallback
      const homestay = homestays.find((h) => h.id === bookingData.propertyId) || homestays[0];
      const room = homestay?.rooms.find((r) => r.id === bookingData.roomId) || homestay?.rooms[0];
      const reference = Math.floor(1000 + Math.random() * 9000).toString();
      const d1 = new Date(bookingData.checkInDate);
      const d2 = new Date(bookingData.checkOutDate);
      const diffDays = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
      const totalAmount = (room?.pricePerNight || 1450) * diffDays;

      let voiceScript = '';
      let smsText = '';

      if (bookingData.preferredLanguage === 'or') {
        voiceScript = `ନମସ୍କାର। ଏହା ସେତୁବନ ତରଫରୁ ଏକ ନୂତନ ହୋମଷ୍ଟେ ବୁକିଂ ଅନୁରୋଧ। ବୁକିଂ ରେଫରେନ୍ସ ନମ୍ବର ${reference}। ଆପଣଙ୍କ ଅତିଥି ${bookingData.checkInDate} ଅପରାହ୍ନ ${bookingData.estimatedArrivalTime} ରେ ପହଞ୍ଚି ${bookingData.checkOutDate} ରେ ପ୍ରସ୍ଥାନ କରିବେ। ମୋଟ ${bookingData.guestsCount} ଜଣ ଅତିଥି। ଅନୁରୋଧ ଗ୍ରହଣ କରିବାକୁ ୧ ଦବାନ୍ତୁ, ପ୍ରତ୍ୟାଖ୍ୟାନ କରିବାକୁ ୨ ଦବାନ୍ତୁ, ଗ୍ରାମ ସଂଯୋଜକଙ୍କ ସହାୟତା ପାଇଁ ୩ ଦବାନ୍ତୁ, କିମ୍ବା ପୁନର୍ବାର ଶୁଣିବା ପାଇଁ ୪ ଦବାନ୍ତୁ।`;
        smsText = `SETUVANA: ନୂଆ ବୁକିଂ Ref ${reference}. ${bookingData.guestsCount} ଅତିଥି ଆସିବେ ${bookingData.checkInDate} ସମୟ ${bookingData.estimatedArrivalTime}. ରହିବେ ${bookingData.checkOutDate} ପର୍ଯ୍ୟନ୍ତ. ଗ୍ରହଣ କରିବା ପାଇଁ 1 ଡାଏଲ କରନ୍ତୁ କିମ୍ବା ସଂଯୋଜକ ${homestay?.coordinatorName || 'ଜିତେନ'} ଙ୍କୁ ଫୋନ କରନ୍ତୁ.`;
      } else if (bookingData.preferredLanguage === 'hi') {
        voiceScript = `नमस्ते। यह सेतुवन की ओर से एक नया होमस्टे बुकिंग अनुरोध है। संदर्भ संख्या ${reference}। आपके अतिथि ${bookingData.checkInDate} शाम ${bookingData.estimatedArrivalTime} को पहुँचेंगे और ${bookingData.checkOutDate} को प्रस्थान करेंगे। कुल ${bookingData.guestsCount} अतिथि। स्वीकार करने के लिए 1 दबाएं, अस्वीकार करने के लिए 2 दबाएं, ग्राम समन्वयक सहायता के लिए 3 दबाएं, या दोहराने के लिए 4 दबाएं।`;
        smsText = `SETUVANA: नया बुकिंग Ref ${reference}. ${bookingData.guestsCount} अतिथि ${bookingData.checkInDate} को आएंगे. स्वीकार करने के लिए 1 दबाएं या समन्वयक ${homestay?.coordinatorName || 'जितेन'} से संपर्क करें.`;
      } else {
        voiceScript = `Namaskar. This is SETUVANA calling about a new homestay booking request. The booking reference is ${reference}. Your guest plans to arrive on ${bookingData.checkInDate} at ${bookingData.estimatedArrivalTime} and depart on ${bookingData.checkOutDate}. Total ${bookingData.guestsCount} guests. Press 1 to accept the request, press 2 to decline, press 3 to request assistance from your village coordinator, or press 4 to hear these details again.`;
        smsText = `SETUVANA: New booking ref ${reference}. ${bookingData.guestsCount} guests arriving ${bookingData.checkInDate} at ${bookingData.estimatedArrivalTime}. Stay till ${bookingData.checkOutDate}. Press 1 to accept or contact coordinator ${homestay?.coordinatorName || 'Jiten'}.`;
      }

      notification = {
        id: `notif-${Date.now()}`,
        bookingId: `bk-${Date.now()}`,
        bookingReference: reference,
        hostId: homestay?.hostId || 'host-01',
        hostPhone: homestay?.hostPhone || '+91 94371 88210',
        preferredLanguage: bookingData.preferredLanguage || 'or',
        channel: 'voice_call',
        provider: 'simulation',
        status: 'ringing',
        voiceScript,
        smsText,
        attempts: 1,
        createdAt: new Date().toISOString(),
        lastAttemptAt: new Date().toISOString(),
      };

      newBooking = {
        id: notification.bookingId,
        reference,
        propertyId: homestay?.id || 'hs-01',
        propertyName: homestay?.name || 'Odisha Rural Homestay',
        propertyVillage: homestay?.village || 'Village',
        propertyDistrict: homestay?.district || 'Kandhamal',
        roomId: room?.id || 'room-01',
        roomName: room?.name || 'Eco Veranda Room',
        hostId: homestay?.hostId || 'host-01',
        hostName: homestay?.hostName || 'Host',
        hostPhone: homestay?.hostPhone || '+91 94371 88210',
        guestId: `guest-${Date.now()}`,
        guestName: bookingData.guestName,
        guestPhone: bookingData.guestPhone,
        guestEmail: bookingData.guestEmail || 'traveler@rural.odisha',
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        estimatedArrivalTime: bookingData.estimatedArrivalTime,
        guestsCount: Number(bookingData.guestsCount) || 2,
        totalAmount,
        paymentMode: 'pay_at_homestay',
        status: 'awaiting_host_response',
        syncStatus: 'synced',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        idempotencyKey: bookingData.idempotencyKey || `idem-${Date.now()}`,
        pickupRequested: Boolean(bookingData.pickupRequested),
        specialRequests: bookingData.specialRequests,
        notificationHistory: [notification],
      };
    }

    if (newBooking) {
      setBookings((prev) => [newBooking!, ...prev]);
      await idbSaveBooking(newBooking);

      if (notification) {
        setSmartCallNotification(notification);
      }
    }

    return newBooking;
  };

  // Host Keypad Response / DTMF Handler (Hybrid: Server API with seamless local simulation)
  const handleKeypadResponse = async (bookingId: string, dtmfInput: '1' | '2' | '3' | '4') => {
    let updatedBooking: Booking | null = null;
    let serverHandled = false;

    try {
      const res = await fetch('/api/telephony/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, dtmfInput, actorRole: 'host', actorName: 'Subarna Wadaka' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.booking) {
          updatedBooking = data.booking;
          serverHandled = true;

          // Refresh coordinator tasks if escalated
          if (dtmfInput === '3') {
            const tRes = await fetch('/api/coordinator/tasks').then((r) => r.json()).catch(() => ({}));
            if (tRes && tRes.success && tRes.tasks) setTasks(tRes.tasks);
          }
        }
      }
    } catch (err) {
      console.warn('Telephony API not responding directly, executing local IVR simulation fallback:', err);
    }

    // Local simulation fallback if server was unreachable
    if (!serverHandled) {
      const existing = bookings.find((b) => b.id === bookingId);
      if (existing) {
        const bCopy: Booking = { ...existing };
        const notifHistory = [...(bCopy.notificationHistory || [])];
        const lastNotif = notifHistory[0] ? { ...notifHistory[0] } : null;

        if (dtmfInput === '1') {
          bCopy.status = 'confirmed';
          if (lastNotif) {
            lastNotif.status = 'completed';
            lastNotif.dtmfInput = '1';
            lastNotif.dtmfAction = 'accept';
          }
        } else if (dtmfInput === '2') {
          bCopy.status = 'declined';
          if (lastNotif) {
            lastNotif.status = 'completed';
            lastNotif.dtmfInput = '2';
            lastNotif.dtmfAction = 'decline';
          }
        } else if (dtmfInput === '3') {
          if (lastNotif) {
            lastNotif.status = 'escalated';
            lastNotif.dtmfInput = '3';
            lastNotif.dtmfAction = 'escalate_coordinator';
          }

          // Prepend urgent coordinator task
          setTasks((prev) => [
            {
              id: `task-${Date.now()}`,
              coordinatorId: 'coord-lead',
              bookingId: bCopy.id,
              homestayId: bCopy.propertyId,
              homestayName: bCopy.propertyName,
              hostName: bCopy.hostName,
              hostPhone: bCopy.hostPhone,
              taskType: 'unanswered_call_followup',
              title: `Host Requested Coordinator Assistance for Ref ${bCopy.reference}`,
              description: `Host ${bCopy.hostName} pressed 3 during SmartCall. Contact host and guest immediately.`,
              priority: 'urgent',
              status: 'pending',
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        }

        if (lastNotif) notifHistory[0] = lastNotif;
        bCopy.notificationHistory = notifHistory;
        bCopy.updatedAt = new Date().toISOString();
        updatedBooking = bCopy;
      }
    }

    if (updatedBooking) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? updatedBooking! : b)));
      await idbSaveBooking(updatedBooking);

      if (smartCallBooking?.id === bookingId) {
        setSmartCallBooking(updatedBooking);
      }
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
