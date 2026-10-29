/**
 * SETUVANA - Full-Stack Express Server & Gemini AI Engine
 * Integrates Vite Middlewares, Telephony Simulator, and Server-Side Gemini SDK
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { INITIAL_HOMESTAYS, INITIAL_COORDINATOR_TASKS, INITIAL_CONNECTIVITY_OBSERVATIONS, INITIAL_BOOKABILITY_PASSPORTS } from './src/data/mockData.ts';
import { Booking, SmartCallNotification, CoordinatorTask, ConnectivityObservation, AuditLog, Homestay } from './src/types/index.ts';

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));

// In-Memory Platform State
let homestays: Homestay[] = [...INITIAL_HOMESTAYS];
let bookings: Booking[] = [
  {
    id: 'bk-sample-01',
    reference: '4821',
    propertyId: 'hs-rayagada-01',
    propertyName: 'Niyamgiri Foothill Dongria Eco-Stay',
    propertyVillage: 'Kurli Village, Bissamcuttack',
    propertyDistrict: 'Rayagada',
    roomId: 'room-ray-01',
    roomName: 'Mud & Thatched Dongria Cottage',
    hostId: 'host-subarna-01',
    hostName: 'Subarna Wadaka',
    hostPhone: '+91 94371 88210',
    guestId: 'guest-rahul-01',
    guestName: 'Rahul Mohapatra',
    guestPhone: '+91 98610 23456',
    guestEmail: 'rahul.mohapatra@example.com',
    checkInDate: '2026-11-14',
    checkOutDate: '2026-11-16',
    estimatedArrivalTime: '3:30 PM',
    guestsCount: 3,
    totalAmount: 2500,
    paymentMode: 'pay_at_homestay',
    status: 'awaiting_host_response',
    syncStatus: 'synced',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    idempotencyKey: 'idem-sample-01',
    pickupRequested: true,
    notificationHistory: [
      {
        id: 'notif-01',
        bookingId: 'bk-sample-01',
        bookingReference: '4821',
        hostId: 'host-subarna-01',
        hostPhone: '+91 94371 88210',
        preferredLanguage: 'or',
        channel: 'voice_call',
        provider: 'simulation',
        status: 'ringing',
        voiceScript: 'ନମସ୍କାର। ଏହା ସେତୁବନ ତରଫରୁ ଏକ ନୂତନ ହୋମଷ୍ଟେ ବୁକିଂ ଅନୁରୋଧ। ବୁକିଂ ରେଫରେନ୍ସ ନମ୍ବର ୪୮୨୧। ଆପଣଙ୍କ ଅତିଥି ୧୪ ନଭେମ୍ବର ଅପରାହ୍ନ ୩ଟା ରୁ ୪ଟା ମଧ୍ୟରେ ପହଞ୍ଚି ୧୬ ନଭେମ୍ବରରେ ପ୍ରସ୍ଥାନ କରିବେ। ମୋଟ ୩ ଜଣ ଅତିଥି। ଅନୁରୋଧ ଗ୍ରହଣ କରିବାକୁ ୧ ଦବାନ୍ତୁ, ପ୍ରତ୍ୟାଖ୍ୟାନ କରିବାକୁ ୨ ଦବାନ୍ତୁ, ଗ୍ରାମ ସଂଯୋଜକଙ୍କ ସହାୟତା ପାଇଁ ୩ ଦବାନ୍ତୁ, କିମ୍ବା ପୁନର୍ବାର ଶୁଣିବା ପାଇଁ ୪ ଦବାନ୍ତୁ।',
        smsText: 'SETUVANA: New booking ref 4821. 3 guests arriving 14 Nov 3:30PM. Stay till 16 Nov. Press 1 to accept or call coordinator Jiten: 9437299401.',
        attempts: 1,
        createdAt: new Date().toISOString(),
        lastAttemptAt: new Date().toISOString(),
      },
    ],
  },
];

let coordinatorTasks: CoordinatorTask[] = [...INITIAL_COORDINATOR_TASKS];
let connectivityObservations: ConnectivityObservation[] = [...INITIAL_CONNECTIVITY_OBSERVATIONS];
let auditLogs: AuditLog[] = [
  {
    id: 'audit-01',
    timestamp: new Date().toISOString(),
    actorId: 'system',
    actorRole: 'admin',
    actorName: 'SETUVANA System',
    action: 'PLATFORM_INITIALIZATION',
    details: 'Initial Odisha tribal homestays & coordinator desks loaded into server memory.',
  },
];

let telephonyConfig = {
  provider: 'simulation', // 'simulation' | 'exotel'
  accountSid: 'EXOTEL_SETUVANA_DEMO',
  apiKey: 'EXOTEL_API_KEY_MOCK',
  apiToken: 'EXOTEL_TOKEN_MOCK',
  registeredVirtualNumber: '+91 80471 90000',
  webhookUrl: '/api/telephony/exotel/webhook',
  liveModeEnabled: false,
};

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for auditing
function recordAudit(actorId: string, actorRole: any, actorName: string, action: string, details: string) {
  auditLogs.unshift({
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    actorId,
    actorRole,
    actorName,
    action,
    details,
  });
}

// -------------------------------------------------------------
// 1. HOMESTAYS & PASSPORTS
// -------------------------------------------------------------
app.get('/api/homestays', (req: Request, res: Response) => {
  res.json({ success: true, homestays });
});

app.get('/api/homestays/:id', (req: Request, res: Response) => {
  const item = homestays.find((h) => h.id === req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: 'Homestay not found' });
  }
  const passport = INITIAL_BOOKABILITY_PASSPORTS[item.id] || null;
  res.json({ success: true, homestay: item, passport });
});

app.post('/api/homestays', (req: Request, res: Response) => {
  const newHomestay: Homestay = {
    ...req.body,
    id: `hs-${Date.now()}`,
    bookabilityScore: 88,
    verificationStatus: 'coordinator_inspected',
    lastVerifiedDate: new Date().toISOString().split('T')[0],
  };
  homestays.unshift(newHomestay);
  recordAudit(newHomestay.hostId, 'host', newHomestay.hostName, 'HOMESTAY_CREATED', `Created homestay: ${newHomestay.name}`);
  res.json({ success: true, homestay: newHomestay });
});

// -------------------------------------------------------------
// 2. BOOKINGS & INVENTORY CONCURRENCY
// -------------------------------------------------------------
app.get('/api/bookings', (req: Request, res: Response) => {
  res.json({ success: true, bookings });
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const {
    propertyId,
    roomId,
    guestName,
    guestPhone,
    guestEmail,
    checkInDate,
    checkOutDate,
    estimatedArrivalTime,
    guestsCount,
    idempotencyKey,
    pickupRequested,
    specialRequests,
    preferredLanguage = 'or',
  } = req.body;

  // Idempotency check
  if (idempotencyKey) {
    const existing = bookings.find((b) => b.idempotencyKey === idempotencyKey);
    if (existing) {
      return res.json({ success: true, booking: existing, isDuplicate: true });
    }
  }

  const homestay = homestays.find((h) => h.id === propertyId);
  if (!homestay) {
    return res.status(404).json({ success: false, error: 'Homestay does not exist' });
  }

  const room = homestay.rooms.find((r) => r.id === roomId) || homestay.rooms[0];

  // Concurrency-safe availability check
  const conflicting = bookings.find(
    (b) =>
      b.propertyId === propertyId &&
      b.roomId === room.id &&
      b.status === 'confirmed' &&
      ((checkInDate >= b.checkInDate && checkInDate < b.checkOutDate) ||
        (checkOutDate > b.checkInDate && checkOutDate <= b.checkOutDate))
  );

  if (conflicting) {
    return res.status(409).json({
      success: false,
      error: 'Conflict: The requested room is already confirmed for these dates.',
      conflictBookingRef: conflicting.reference,
    });
  }

  // Calculate nights
  const d1 = new Date(checkInDate);
  const d2 = new Date(checkOutDate);
  const diffDays = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  const totalAmount = room.pricePerNight * diffDays;
  const reference = Math.floor(1000 + Math.random() * 9000).toString();

  // Create voice & SMS script
  let voiceScript = '';
  let smsText = '';

  if (preferredLanguage === 'or') {
    voiceScript = `ନମସ୍କାର। ଏହା ସେତୁବନ ତରଫରୁ ଏକ ନୂତନ ହୋମଷ୍ଟେ ବୁକିଂ ଅନୁରୋଧ। ବୁକିଂ ରେଫରେନ୍ସ ନମ୍ବର ${reference}। ଆପଣଙ୍କ ଅତିଥି ${checkInDate} ଅପରାହ୍ନ ${estimatedArrivalTime} ରେ ପହଞ୍ଚି ${checkOutDate} ରେ ପ୍ରସ୍ଥାନ କରିବେ। ମୋଟ ${guestsCount} ଜଣ ଅତିଥି। ଅନୁରୋଧ ଗ୍ରହଣ କରିବାକୁ ୧ ଦବାନ୍ତୁ, ପ୍ରତ୍ୟାଖ୍ୟାନ କରିବାକୁ ୨ ଦବାନ୍ତୁ, ଗ୍ରାମ ସଂଯୋଜକଙ୍କ ସହାୟତା ପାଇଁ ୩ ଦବାନ୍ତୁ, କିମ୍ବା ପୁନର୍ବାର ଶୁଣିବା ପାଇଁ ୪ ଦବାନ୍ତୁ।`;
    smsText = `SETUVANA: ନୂଆ ବୁକିଂ Ref ${reference}. ${guestsCount} ଅତିଥି ଆସିବେ ${checkInDate} ସମୟ ${estimatedArrivalTime}. ରହିବେ ${checkOutDate} ପର୍ଯ୍ୟନ୍ତ. ଗ୍ରହଣ କରିବା ପାଇଁ 1 ଡାଏଲ କରନ୍ତୁ କିମ୍ବା ସଂଯୋଜକ ${homestay.coordinatorName} ଙ୍କୁ ଫୋନ କରନ୍ତୁ.`;
  } else if (preferredLanguage === 'hi') {
    voiceScript = `नमस्ते। यह सेतुवन की ओर से एक नया होमस्टे बुकिंग अनुरोध है। संदर्भ संख्या ${reference}। आपके अतिथि ${checkInDate} शाम ${estimatedArrivalTime} को पहुँचेंगे और ${checkOutDate} को प्रस्थान करेंगे। कुल ${guestsCount} अतिथि। स्वीकार करने के लिए 1 दबाएं, अस्वीकार करने के लिए 2 दबाएं, ग्राम समन्वयक सहायता के लिए 3 दबाएं, या दोहराने के लिए 4 दबाएं।`;
    smsText = `SETUVANA: नया बुकिंग Ref ${reference}. ${guestsCount} अतिथि ${checkInDate} को आएंगे. स्वीकार करने के लिए 1 दबाएं या समन्वयक ${homestay.coordinatorName} से संपर्क करें.`;
  } else {
    voiceScript = `Namaskar. This is SETUVANA calling about a new homestay booking request. The booking reference is ${reference}. Your guest plans to arrive on ${checkInDate} at ${estimatedArrivalTime} and depart on ${checkOutDate}. Total ${guestsCount} guests. Press 1 to accept the request, press 2 to decline, press 3 to request assistance from your village coordinator, or press 4 to hear these details again.`;
    smsText = `SETUVANA: New booking ref ${reference}. ${guestsCount} guests arriving ${checkInDate} at ${estimatedArrivalTime}. Stay till ${checkOutDate}. Press 1 to accept or contact coordinator ${homestay.coordinatorName}.`;
  }

  const notification: SmartCallNotification = {
    id: `notif-${Date.now()}`,
    bookingId: `bk-${Date.now()}`,
    bookingReference: reference,
    hostId: homestay.hostId,
    hostPhone: homestay.hostPhone,
    preferredLanguage,
    channel: 'voice_call',
    provider: telephonyConfig.liveModeEnabled ? 'exotel' : 'simulation',
    status: 'ringing',
    voiceScript,
    smsText,
    attempts: 1,
    createdAt: new Date().toISOString(),
    lastAttemptAt: new Date().toISOString(),
  };

  const newBooking: Booking = {
    id: notification.bookingId,
    reference,
    propertyId: homestay.id,
    propertyName: homestay.name,
    propertyVillage: homestay.village,
    propertyDistrict: homestay.district,
    roomId: room.id,
    roomName: room.name,
    hostId: homestay.hostId,
    hostName: homestay.hostName,
    hostPhone: homestay.hostPhone,
    guestId: `guest-${Date.now()}`,
    guestName,
    guestPhone,
    guestEmail: guestEmail || 'traveler@rural.odisha',
    checkInDate,
    checkOutDate,
    estimatedArrivalTime,
    guestsCount: Number(guestsCount) || 2,
    totalAmount,
    paymentMode: 'pay_at_homestay',
    status: 'awaiting_host_response',
    syncStatus: 'synced',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    idempotencyKey: idempotencyKey || `idem-${Date.now()}`,
    pickupRequested: Boolean(pickupRequested),
    specialRequests,
    notificationHistory: [notification],
  };

  bookings.unshift(newBooking);

  recordAudit(
    newBooking.guestId,
    'traveller',
    guestName,
    'BOOKING_SUBMITTED',
    `Booking Ref ${reference} submitted for ${homestay.name}. SmartCall notification dispatched.`
  );

  res.json({ success: true, booking: newBooking, notification });
});

// Host Keypad / Coordinator DTMF Webhook & Response Handler
app.post('/api/telephony/respond', (req: Request, res: Response) => {
  const { bookingId, dtmfInput, actorRole = 'host', actorName = 'Host Keypad' } = req.body;

  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found' });
  }

  let action: 'accept' | 'decline' | 'escalate_coordinator' | 'repeat' = 'repeat';
  if (dtmfInput === '1') action = 'accept';
  else if (dtmfInput === '2') action = 'decline';
  else if (dtmfInput === '3') action = 'escalate_coordinator';
  else if (dtmfInput === '4') action = 'repeat';

  if (action === 'accept') {
    // Re-verify availability
    const conflict = bookings.find(
      (b) =>
        b.id !== booking.id &&
        b.propertyId === booking.propertyId &&
        b.roomId === booking.roomId &&
        b.status === 'confirmed' &&
        ((booking.checkInDate >= b.checkInDate && booking.checkInDate < b.checkOutDate) ||
          (booking.checkOutDate > b.checkInDate && booking.checkOutDate <= b.checkOutDate))
    );

    if (conflict) {
      booking.status = 'conflict_review';
      booking.updatedAt = new Date().toISOString();
      recordAudit(booking.hostId, actorRole, actorName, 'BOOKING_CONFLICT_DETECTED', `Conflict detected for Ref ${booking.reference}`);
      return res.json({
        success: false,
        status: 'conflict_review',
        message: 'Conflict detected with another reservation. Flagged for coordinator review.',
        booking,
      });
    }

    booking.status = 'confirmed';
    booking.updatedAt = new Date().toISOString();

    if (booking.notificationHistory.length > 0) {
      const last = booking.notificationHistory[0];
      last.status = 'completed';
      last.dtmfInput = '1';
      last.dtmfAction = 'accept';
    }

    recordAudit(booking.hostId, actorRole, actorName, 'BOOKING_CONFIRMED', `Booking Ref ${booking.reference} confirmed via SmartCall DTMF '1'`);
  } else if (action === 'decline') {
    booking.status = 'declined';
    booking.updatedAt = new Date().toISOString();

    if (booking.notificationHistory.length > 0) {
      const last = booking.notificationHistory[0];
      last.status = 'completed';
      last.dtmfInput = '2';
      last.dtmfAction = 'decline';
    }

    recordAudit(booking.hostId, actorRole, actorName, 'BOOKING_DECLINED', `Booking Ref ${booking.reference} declined via SmartCall DTMF '2'`);
  } else if (action === 'escalate_coordinator') {
    if (booking.notificationHistory.length > 0) {
      const last = booking.notificationHistory[0];
      last.status = 'escalated';
      last.dtmfInput = '3';
      last.dtmfAction = 'escalate_coordinator';
    }

    // Add task to coordinator
    coordinatorTasks.unshift({
      id: `task-${Date.now()}`,
      coordinatorId: 'coord-lead',
      bookingId: booking.id,
      homestayId: booking.propertyId,
      homestayName: booking.propertyName,
      hostName: booking.hostName,
      hostPhone: booking.hostPhone,
      taskType: 'unanswered_call_followup',
      title: `Host Requested Coordinator Assistance for Ref ${booking.reference}`,
      description: `Host ${booking.hostName} pressed 3 during SmartCall. Contact host and guest immediately.`,
      priority: 'urgent',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    recordAudit(booking.hostId, actorRole, actorName, 'COORDINATOR_ESCALATION', `Host escalated Booking Ref ${booking.reference} to village coordinator.`);
  }

  res.json({ success: true, booking, action });
});

// Coordinator Manual Booking Entry
app.post('/api/coordinator/manual-booking', (req: Request, res: Response) => {
  const { homestayId, guestName, guestPhone, checkInDate, checkOutDate, guestsCount, coordinatorName } = req.body;

  const homestay = homestays.find((h) => h.id === homestayId);
  if (!homestay) return res.status(404).json({ success: false, error: 'Homestay not found' });

  const ref = Math.floor(1000 + Math.random() * 9000).toString();
  const d1 = new Date(checkInDate);
  const d2 = new Date(checkOutDate);
  const diffDays = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
  const totalAmount = homestay.pricePerNight * diffDays;

  const booking: Booking = {
    id: `bk-coord-${Date.now()}`,
    reference: ref,
    propertyId: homestay.id,
    propertyName: homestay.name,
    propertyVillage: homestay.village,
    propertyDistrict: homestay.district,
    roomId: homestay.rooms[0].id,
    roomName: homestay.rooms[0].name,
    hostId: homestay.hostId,
    hostName: homestay.hostName,
    hostPhone: homestay.hostPhone,
    guestId: `guest-manual-${Date.now()}`,
    guestName,
    guestPhone,
    guestEmail: 'manual-walkin@setuvana.rural.odisha',
    checkInDate,
    checkOutDate,
    estimatedArrivalTime: '2:00 PM',
    guestsCount: Number(guestsCount) || 2,
    totalAmount,
    paymentMode: 'coordinator_assisted',
    status: 'confirmed', // Coordinator verified in-person
    syncStatus: 'synced',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    idempotencyKey: `idem-manual-${Date.now()}`,
    notificationHistory: [],
    notes: `Manual in-person/phone booking recorded by Coordinator: ${coordinatorName}`,
  };

  bookings.unshift(booking);
  recordAudit('coord-01', 'coordinator', coordinatorName || 'Village Coordinator', 'MANUAL_BOOKING_RECORDED', `Recorded manual stay Ref ${ref} for ${homestay.name}`);

  res.json({ success: true, booking });
});

// Coordinator Tasks
app.get('/api/coordinator/tasks', (req: Request, res: Response) => {
  res.json({ success: true, tasks: coordinatorTasks });
});

app.post('/api/coordinator/tasks/:id/resolve', (req: Request, res: Response) => {
  const task = coordinatorTasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

  task.status = 'completed';
  task.resolvedAt = new Date().toISOString();
  recordAudit('coord-01', 'coordinator', 'Village Coordinator', 'TASK_RESOLVED', `Resolved coordinator task: ${task.title}`);

  res.json({ success: true, task });
});

// -------------------------------------------------------------
// 3. CONNECTIVITY OBSERVATIONS (Crowdsourced)
// -------------------------------------------------------------
app.get('/api/connectivity/observations', (req: Request, res: Response) => {
  res.json({ success: true, observations: connectivityObservations });
});

app.post('/api/connectivity/observations', (req: Request, res: Response) => {
  const { district, village, latitude, longitude, operator, voiceAvailable, smsAvailable, dataQuality, reporterRole } = req.body;

  const observation: ConnectivityObservation = {
    id: `obs-${Date.now()}`,
    district,
    village,
    latitude: Number(latitude) || 19.5,
    longitude: Number(longitude) || 83.5,
    operator: operator || 'BSNL',
    voiceAvailable: Boolean(voiceAvailable),
    smsAvailable: Boolean(smsAvailable),
    dataQuality: dataQuality || 'none',
    reportedAt: new Date().toISOString(),
    reporterRole: reporterRole || 'Traveller',
  };

  connectivityObservations.unshift(observation);
  res.json({ success: true, observation });
});

// -------------------------------------------------------------
// 4. ADMIN & TELEPHONY CONFIGURATION
// -------------------------------------------------------------
app.get('/api/admin/metrics', (req: Request, res: Response) => {
  const totalHomestays = homestays.length;
  const activeBookings = bookings.filter((b) => b.status === 'awaiting_host_response' || b.status === 'confirmed').length;
  const confirmedStays = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalNotifications = bookings.flatMap((b) => b.notificationHistory).length;
  const respondedNotifications = bookings.flatMap((b) => b.notificationHistory).filter((n) => n.dtmfInput).length;
  const hostResponseRate = totalNotifications > 0 ? Math.round((respondedNotifications / totalNotifications) * 100) : 92;

  res.json({
    success: true,
    metrics: {
      totalHomestays,
      activeBookings,
      confirmedStays,
      totalRevenue,
      hostResponseRate,
      openCoordinatorTasks: coordinatorTasks.filter((t) => t.status === 'pending').length,
      connectivityReportsCount: connectivityObservations.length,
      telephonyConfig,
    },
    auditLogs: auditLogs.slice(0, 50),
  });
});

app.post('/api/admin/telephony-config', (req: Request, res: Response) => {
  telephonyConfig = { ...telephonyConfig, ...req.body };
  recordAudit('admin-01', 'admin', 'Administrator', 'TELEPHONY_CONFIG_UPDATED', `Telephony config updated. LiveMode: ${telephonyConfig.liveModeEnabled}`);
  res.json({ success: true, telephonyConfig });
});

app.post('/api/admin/reset-demo', (req: Request, res: Response) => {
  homestays = [...INITIAL_HOMESTAYS];
  coordinatorTasks = [...INITIAL_COORDINATOR_TASKS];
  connectivityObservations = [...INITIAL_CONNECTIVITY_OBSERVATIONS];
  bookings = bookings.slice(0, 1);
  recordAudit('admin-01', 'admin', 'Administrator', 'DEMO_DATA_RESET', 'Demonstration data reset to initial seed values.');
  res.json({ success: true, message: 'Demo environment reset successfully.' });
});

// CSV Export for Admins & Tourism Partners
app.get('/api/admin/export/:type', (req: Request, res: Response) => {
  const { type } = req.params;

  if (type === 'bookings') {
    const headers = 'Reference,Property,Village,District,Guest,Phone,CheckIn,CheckOut,Guests,Amount,Status,PaymentMode\n';
    const rows = bookings
      .map(
        (b) =>
          `"${b.reference}","${b.propertyName}","${b.propertyVillage}","${b.propertyDistrict}","${b.guestName}","${b.guestPhone}","${b.checkInDate}","${b.checkOutDate}",${b.guestsCount},${b.totalAmount},"${b.status}","${b.paymentMode}"`
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="setuvana_bookings.csv"');
    return res.send(headers + rows);
  }

  if (type === 'impact') {
    const headers = 'Homestay,District,Community,Host,Phone,ConfirmedStays,RevenueEarned\n';
    const rows = homestays
      .map((h) => {
        const stays = bookings.filter((b) => b.propertyId === h.id && (b.status === 'confirmed' || b.status === 'completed'));
        const rev = stays.reduce((sum, b) => sum + b.totalAmount, 0);
        return `"${h.name}","${h.district}","${h.tribalCommunity}","${h.hostName}","${h.hostPhone}",${stays.length},${rev}`;
      })
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="setuvana_rural_impact.csv"');
    return res.send(headers + rows);
  }

  res.status(400).send('Invalid export type');
});

// -------------------------------------------------------------
// 5. GEMINI AI SERVER ENDPOINTS
// -------------------------------------------------------------

// A. Travel Companion Assistant Grounded with Platform Data
app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
  try {
    const { message, language = 'en' } = req.body;
    const homestaySummaries = homestays
      .map(
        (h) =>
          `- ${h.name} (${h.village}, ${h.district}): ₹${h.pricePerNight}/night, tribe: ${h.tribalCommunity}, capacity: ${h.capacityGuests}, drinking water: ${h.drinkingWaterInfo}, host: ${h.hostName}`
      )
      .join('\n');

    const prompt = `You are SETUVANA's intelligent rural travel assistant for tribal and rural homestays in Odisha.
Platform verified homestays available:
${homestaySummaries}

Rules:
1. Ground answers STRICTLY in the above homestay information. Do not invent pricing, fake facilities, or nonexistent amenities.
2. If the user asks in Odia, answer in pure, respectful Odia (ଓଡ଼ିଆ). If in Hindi, answer in Hindi. If in English, answer in English.
3. Emphasize offline preparedness: advise travellers that connectivity is intermittent and they should download their Offline Arrival Pack before journeying.
4. User inquiry: "${message}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini assistant error:', error);
    res.status(500).json({ success: false, error: error.message || 'Gemini error' });
  }
});

// B. Search Grounding with gemini-3.8-flash (Real-Time Weather & Odisha Festivals)
app.post('/api/gemini/search-grounding', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const prompt = `Provide up-to-date and accurate seasonal travel advisory, road conditions, or cultural festivals for rural Odisha: ${query}. Mention relevant seasonal tribal festivals (such as Parab, Chaiti Ghoda, Dhanu Yatra, Bali Yatra, Mandia harvest) and local climate details.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Search grounding error:', error);
    res.status(500).json({ success: false, error: error.message || 'Search grounding error' });
  }
});

// C. Maps Grounding with gemini-3.8-flash (Rural Landmarks & Transit Points)
app.post('/api/gemini/maps-grounding', async (req: Request, res: Response) => {
  try {
    const { destination } = req.body;
    const prompt = `Provide geographic transit hubs, nearest railway stations, and landmark terrain guidance for visiting rural homestays in ${destination}, Odisha.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Maps grounding error:', error);
    res.status(500).json({ success: false, error: error.message || 'Maps grounding error' });
  }
});

// D. High Thinking Mode using gemini-4-argon with thinkingLevel: HIGH (no maxOutputTokens)
app.post('/api/gemini/thinking-planner', async (req: Request, res: Response) => {
  try {
    const { travelPreferences, days = 5, startLocation = 'Bhubaneswar' } = req.body;

    const homestayData = homestays.map((h) => ({
      name: h.name,
      district: h.district,
      village: h.village,
      price: h.pricePerNight,
      community: h.tribalCommunity,
      pickup: h.pickupAvailable,
    }));

    const prompt = `As a master rural tourism architect and cultural anthropologist, formulate an optimal, culturally responsible, low-impact multi-day travel itinerary connecting rural and tribal homestays in Odisha.
Available homestay network: ${JSON.stringify(homestayData)}
Trip constraints: Starting from ${startLocation}, duration: ${days} days. User preferences: "${travelPreferences}".
Analyze logistics, weak connectivity corridors, ethical interaction protocols with Dongria Kondh / Desia / Santhal communities, local train transit schedules (e.g. Hirakhand Express, Samaleswari Express), and fair community revenue distribution.`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-argon',
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });

    res.json({ success: true, plan: response.text });
  } catch (error: any) {
    console.error('High thinking planner error:', error);
    res.status(500).json({ success: false, error: error.message || 'Thinking planner error' });
  }
});

// E. Text-to-Speech using gemini-3.8-flash-tts
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore', language = 'en' } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text || 'Welcome to SETUVANA. Every village connected to opportunity.',
              speechMetadata: {
                style: 'Warm, clear, and reassuring rural voice',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ success: false, error: 'No audio returned by TTS model' });
    }

    res.json({ success: true, base64Audio, mimeType: 'audio/wav' });
  } catch (error: any) {
    console.error('TTS error:', error);
    res.status(500).json({ success: false, error: error.message || 'TTS generation error' });
  }
});

// F. High-Quality Image Generation using gemini-3-pro-image-preview (with 1K, 2K, 4K size options)
app.post('/api/gemini/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, imageSize = '1K', aspectRatio = '4:3' } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt || 'Scenic rural tribal mud cottage in Odisha with thatched roof and green paddy fields.' }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any,
        },
      },
    });

    let imageUrl = '';
    let textOutput = '';

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      } else if (part.text) {
        textOutput += part.text;
      }
    }

    res.json({ success: true, imageUrl, textOutput, imageSize });
  } catch (error: any) {
    console.error('Image generation error:', error);
    res.status(500).json({ success: false, error: error.message || 'Image generation error' });
  }
});

// G. Create & Edit Images using gemini-nano-banana-2.1
app.post('/api/gemini/edit-image', async (req: Request, res: Response) => {
  try {
    const { prompt, base64ImageData, mimeType = 'image/jpeg', aspectRatio = '1:1', imageSize = '1K' } = req.body;

    const parts: any[] = [];
    if (base64ImageData) {
      parts.push({
        inlineData: {
          data: base64ImageData,
          mimeType,
        },
      });
    }
    parts.push({ text: prompt || 'Transform into an Odisha rural heritage aesthetic with traditional Saura tribal wall motifs.' });

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any,
        },
      },
    });

    let imageUrl = '';
    const candParts = response.candidates?.[0]?.content?.parts || [];
    for (const part of candParts) {
      if (part.inlineData?.data) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    res.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Image edit error:', error);
    res.status(500).json({ success: false, error: error.message || 'Image edit error' });
  }
});

// H. Host Onboarding Description & Translation Generator
app.post('/api/gemini/host-description', async (req: Request, res: Response) => {
  try {
    const { village, district, community, highlights, houseType } = req.body;

    const prompt = `You are assisting a rural tribal homestay host in Odisha with listing creation for SETUVANA.
Host inputs:
- Village: ${village}
- District: ${district}
- Tribal Community: ${community}
- House Type: ${houseType}
- Highlights: ${highlights}

Generate a JSON object with:
1. "title": A concise, respectful English title
2. "odiaTitle": Odia translation in Oriya script
3. "hindiTitle": Hindi translation in Devanagari script
4. "description": A warm 3-sentence description in English
5. "odiaDescription": Accurate Odia translation (ପାରମ୍ପରିକ ଓଡ଼ିଆ ଭାଷା)
6. "hindiDescription": Accurate Hindi translation
7. "suggestedAmenities": Array of 4-6 realistic facilities matching rural homestay realities
Respond ONLY with raw JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Host description error:', error);
    res.status(500).json({ success: false, error: error.message || 'Generation error' });
  }
});

// -------------------------------------------------------------
// VITE MIDDLEWARE / STATIC ASSETS
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SETUVANA full-stack platform active on port ${PORT}`);
  });
}

startServer();
