/**
 * SETUVANA - Village Coordination Desk
 * Operational control center for community coordinators managing multiple tribal hosts,
 * callback queues, failed call follow-ups, manual in-person booking entries, and daily printable registers.
 */

import React, { useState } from 'react';
import { CoordinatorTask, Homestay, Booking, Language } from '../types';
import { translations } from '../translations';
import {
  UserCheck,
  PhoneCall,
  Clock,
  Printer,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  FileText,
  Send,
} from 'lucide-react';

interface CoordinatorViewProps {
  currentLanguage: Language;
  tasks: CoordinatorTask[];
  homestays: Homestay[];
  bookings: Booking[];
  onResolveTask: (taskId: string) => Promise<void>;
  onRecordManualBooking: (bookingData: any) => Promise<void>;
  onOpenSmartCall: (booking: Booking) => void;
}

export const CoordinatorView: React.FC<CoordinatorViewProps> = ({
  currentLanguage,
  tasks,
  homestays,
  bookings,
  onResolveTask,
  onRecordManualBooking,
  onOpenSmartCall,
}) => {
  const t = translations[currentLanguage];

  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedHomestayId, setSelectedHomestayId] = useState(homestays[0]?.id || '');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkInDate, setCheckInDate] = useState('2026-11-15');
  const [checkOutDate, setCheckOutDate] = useState('2026-11-17');
  const [guestCount, setGuestCount] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter tasks
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;

    setIsSubmitting(true);
    await onRecordManualBooking({
      homestayId: selectedHomestayId,
      guestName,
      guestPhone,
      checkInDate,
      checkOutDate,
      guestsCount: guestCount,
      coordinatorName: 'Jiten Nayak (District Coordinator)',
    });

    setIsSubmitting(false);
    setShowManualModal(false);
    setGuestName('');
    setGuestPhone('');
  };

  const handlePrintDailyRegister = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header bar */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#133926] text-amber-300 flex items-center justify-center font-serif text-2xl font-bold shadow-inner">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif text-stone-900">
                {t.coordinatorDeskTitle}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold uppercase">
                Bissamcuttack / Rayagada Cluster
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Coordinator: Jiten Nayak (+91 94372 99401) • 6 Assigned Tribal Homestays
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowManualModal(true)}
            className="py-2 px-3.5 rounded-xl bg-[#133926] hover:bg-[#0e2a1c] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>{t.manualEntryBooking}</span>
          </button>

          <button
            onClick={handlePrintDailyRegister}
            className="py-2 px-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4 text-amber-300" />
            <span>{t.dailyRegister}</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-50 text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-stone-400 text-xs block">Callback Tasks</span>
            <span className="text-xl font-black text-stone-900 font-mono">
              {pendingTasks.length} Urgent Tasks
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-stone-400 text-xs block">{t.assignedHosts}</span>
            <span className="text-xl font-black text-stone-900 font-mono">
              {homestays.length} Homestays
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-stone-400 text-xs block">Active Reservations</span>
            <span className="text-xl font-black text-stone-900 font-mono">
              {bookings.length} Bookings
            </span>
          </div>
        </div>
      </div>

      {/* Main Coordinator Task Queue */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-900 font-serif">
              {t.callbackQueue} & Escalated Inquiries
            </h3>
            <p className="text-xs text-stone-500">
              Action items triggered when a host misses a SmartCall or presses 3 for assistance
            </p>
          </div>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {pendingTasks.length === 0 ? (
            <div className="p-8 text-center text-stone-400">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <span>All callback tasks and SmartCall follow-ups are resolved.</span>
            </div>
          ) : (
            pendingTasks.map((task) => (
              <div key={task.id} className="p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-stone-50 transition">
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        task.priority === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    <strong className="text-stone-900 text-sm font-serif">{task.title}</strong>
                  </div>
                  <p className="text-stone-600 text-xs">{task.description}</p>
                  <div className="text-[11px] text-stone-500 flex items-center gap-2">
                    <span>Host: {task.hostName} ({task.hostPhone})</span>
                    <span>•</span>
                    <span>Homestay: {task.homestayName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const relatedBooking = bookings.find((b) => b.id === task.bookingId) || bookings[0];
                      if (relatedBooking) onOpenSmartCall(relatedBooking);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs flex items-center gap-1 shadow-xs transition"
                    title="Open SmartCall Keypad Simulator for this host"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-black" />
                    <span>Simulate Call</span>
                  </button>
                  <button
                    onClick={() => onResolveTask(task.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.markResolved}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Daily Arrival Register (Printable) */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs print:border-none print:shadow-none" id="printable-register">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-900 font-serif">
              Daily Homestay Guest Arrivals Register
            </h3>
            <p className="text-xs text-stone-500">
              Printable daily register for offline village coordinators to check off arrivals
            </p>
          </div>
          <span className="text-xs font-mono text-stone-400">Date: {new Date().toLocaleDateString()}</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200">
                <th className="p-3 font-bold">Ref</th>
                <th className="p-3 font-bold">Guest Name</th>
                <th className="p-3 font-bold">Homestay</th>
                <th className="p-3 font-bold">Check-In</th>
                <th className="p-3 font-bold">Arrival Time</th>
                <th className="p-3 font-bold">Pickup Service</th>
                <th className="p-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="p-3 font-mono font-bold">#{b.reference}</td>
                  <td className="p-3 font-semibold text-stone-900">{b.guestName}</td>
                  <td className="p-3 text-stone-700">{b.propertyName}</td>
                  <td className="p-3 text-stone-600">{b.checkInDate}</td>
                  <td className="p-3 text-stone-600">{b.estimatedArrivalTime}</td>
                  <td className="p-3">
                    {b.pickupRequested ? (
                      <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Requested
                      </span>
                    ) : (
                      <span className="text-stone-400">None</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual In-Person Booking Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf8f5] text-stone-900 rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
            <div className="bg-[#133926] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold font-serif">{t.manualEntryBooking}</h3>
              </div>
              <button onClick={() => setShowManualModal(false)} className="p-1 text-stone-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualBooking} className="p-5 space-y-3.5 text-xs">
              <p className="text-stone-600">
                Record walk-in guests or phone reservations taken in person by the village coordinator. These records are marked coordinator-verified and sync safely to the ledger.
              </p>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Select Homestay</label>
                <select
                  value={selectedHomestayId}
                  onChange={(e) => setSelectedHomestayId(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-lg bg-white"
                >
                  {homestays.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.village}, {h.district})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Ananya Dash"
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Guest Phone</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 94370 00000"
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Check-In</label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Check-Out</label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Number of Guests</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#133926] hover:bg-[#0e2a1c] text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>Confirm & Log Manual Stay</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
