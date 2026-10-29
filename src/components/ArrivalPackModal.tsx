/**
 * SETUVANA - Offline Arrival Pack Generator & Printable Slip
 * Fully cached in IndexedDB for complete offline utility in remote Odisha villages.
 */

import React, { useState } from 'react';
import { Booking, Homestay, Language } from '../types';
import { translations } from '../translations';
import { idbSaveArrivalPack } from '../services/db';
import {
  Printer,
  Download,
  Share2,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle,
  X,
  FileCheck,
} from 'lucide-react';

interface ArrivalPackModalProps {
  currentLanguage: Language;
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  homestay: Homestay | null;
}

export const ArrivalPackModal: React.FC<ArrivalPackModalProps> = ({
  currentLanguage,
  isOpen,
  onClose,
  booking,
  homestay,
}) => {
  const t = translations[currentLanguage];
  const [savedOfflineSuccess, setSavedOfflineSuccess] = useState(false);

  if (!isOpen || !booking || !homestay) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToDevice = async () => {
    await idbSaveArrivalPack(booking.id, {
      booking,
      homestay,
      savedAt: new Date().toISOString(),
    });
    setSavedOfflineSuccess(true);
    setTimeout(() => setSavedOfflineSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#faf8f5] text-stone-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-[#133926] text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold font-serif">{t.downloadArrivalPack}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToDevice}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>{savedOfflineSuccess ? 'Saved in IndexedDB!' : 'Save Offline'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-emerald-900 text-stone-300 ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Arrival Pack Content Sheet */}
        <div className="p-6 overflow-y-auto space-y-5 print:p-8 print:m-0 text-stone-800" id="printable-arrival-pack">
          {/* Header & Verification Stamp */}
          <div className="border-b-2 border-emerald-900 pb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-serif tracking-tight text-[#133926]">
                  SETUVANA
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                  OFFICIAL ARRIVAL PACK
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Smart Rural Tourism & Offline Homestay Infrastructure | Odisha, India
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-400 block font-mono">BOOKING REFERENCE</span>
              <span className="text-2xl font-mono font-black text-[#c25e3e] tracking-wider">
                #{booking.reference}
              </span>
            </div>
          </div>

          {/* Stay Specifics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                Homestay & Community
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-0.5 font-serif">
                {homestay.name}
              </h3>
              <p className="text-xs text-stone-600">
                {homestay.village}, {homestay.district} District
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Community: {homestay.tribalCommunity}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-50 p-2 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px]">Check-In</span>
                <span className="font-bold text-stone-900">{booking.checkInDate}</span>
                <span className="text-[10px] text-stone-500 block">By {booking.estimatedArrivalTime}</span>
              </div>
              <div className="bg-stone-50 p-2 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px]">Check-Out</span>
                <span className="font-bold text-stone-900">{booking.checkOutDate}</span>
                <span className="text-[10px] text-stone-500 block">By 11:00 AM</span>
              </div>
              <div className="bg-stone-50 p-2 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px]">Total Guests</span>
                <span className="font-bold text-stone-900">{booking.guestsCount} Persons</span>
              </div>
              <div className="bg-stone-50 p-2 rounded border border-stone-200">
                <span className="text-stone-400 block text-[10px]">Payment on Arrival</span>
                <span className="font-bold text-emerald-800">₹{booking.totalAmount} (Cash/UPI)</span>
              </div>
            </div>
          </div>

          {/* Contact Verification Box */}
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-xs">
            <h4 className="font-bold text-emerald-950 mb-2 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-800" />
              Verified Local Contact Directory
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-700">
              <div>
                <span className="text-stone-500 block text-[11px]">Homestay Host:</span>
                <strong className="text-stone-900">{homestay.hostName}</strong>
                <div className="font-mono text-emerald-800 font-bold">{homestay.hostPhone}</div>
                <span className="text-[10px] text-stone-500">Keypad Phone (BSNL/Jio Coverage)</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Village Coordinator:</span>
                <strong className="text-stone-900">{homestay.coordinatorName}</strong>
                <div className="font-mono text-emerald-800 font-bold">{homestay.coordinatorPhone}</div>
                <span className="text-[10px] text-stone-500">Available for transit & pickup assistance</span>
              </div>
            </div>
          </div>

          {/* Plain-Text Offline Directions & Transit Instructions */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#c25e3e]" />
              {t.directionsOffline} (Use When Offline)
            </h4>
            <pre className="text-stone-700 font-sans text-xs bg-stone-50 p-3 rounded-lg border border-stone-200 whitespace-pre-wrap leading-relaxed">
              {homestay.plainTextDirections}
            </pre>
            <div className="text-[11px] text-stone-500">
              <strong>Landmark:</strong> {homestay.landmarkDirections}
            </div>
            {homestay.pickupAvailable && (
              <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                <strong>Pickup Arrangements:</strong> {homestay.pickupDetails}
              </div>
            )}
          </div>

          {/* House Rules & Cultural Protocols */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-1.5">
            <h4 className="font-bold text-stone-900">Community Respect & House Rules</h4>
            <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px]">
              {homestay.houseRules.map((rule, idx) => (
                <li key={idx}>{rule}</li>
              ))}
              <li>Drinking water: {homestay.drinkingWaterInfo}</li>
              <li>Sanitation: {homestay.sanitationInfo}</li>
            </ul>
          </div>

          {/* Footer Timestamp & Authenticity */}
          <div className="text-[10px] text-stone-400 border-t border-stone-200 pt-3 flex justify-between">
            <span>Generated: {new Date().toLocaleDateString()} | SETUVANA OSFIC</span>
            <span>GPS: {homestay.gpsCoordinates.lat}, {homestay.gpsCoordinates.lng}</span>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="bg-stone-100 px-5 py-2.5 border-t border-stone-200 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-300 hover:bg-stone-400 text-stone-800 font-semibold text-xs transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
