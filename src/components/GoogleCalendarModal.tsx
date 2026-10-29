/**
 * SETUVANA - Google Calendar & Travel Notes Integration
 * Syncs confirmed homestay bookings with Google Calendar via OAuth Bearer token
 * and provides offline .ics calendar export & Keep-ready packing checklists.
 */

import React, { useState, useEffect } from 'react';
import { Booking, Language } from '../types';
import { translations } from '../translations';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
} from '../services/firebase';
import { addBookingToGoogleCalendar, downloadICSFile } from '../services/calendar';
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  X,
  FileText,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface GoogleCalendarModalProps {
  currentLanguage: Language;
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const GoogleCalendarModal: React.FC<GoogleCalendarModalProps> = ({
  currentLanguage,
  isOpen,
  onClose,
  booking,
}) => {
  const t = translations[currentLanguage];

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; eventId?: string; htmlLink?: string; error?: string } | null>(null);
  const [copiedNotes, setCopiedNotes] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      alert('Google Sign-in failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSyncToGoogleCalendar = async () => {
    const confirmed = window.confirm(
      `Confirm adding "${booking.propertyName}" stay (${booking.checkInDate} to ${booking.checkOutDate}) to your primary Google Calendar?`
    );
    if (!confirmed) return;

    setIsSyncing(true);
    setSyncResult(null);

    const token = accessToken || (await getAccessToken()) || '';
    const res = await addBookingToGoogleCalendar(booking, token);
    setSyncResult(res);
    setIsSyncing(false);
  };

  const travelNotesText = `SETUVANA Travel Notes & Packing Checklist
Stay: ${booking.propertyName}
Village: ${booking.propertyVillage}, ${booking.propertyDistrict}
Check-In: ${booking.checkInDate} (${booking.estimatedArrivalTime})
Check-Out: ${booking.checkOutDate}
Booking Ref: ${booking.reference}
Host Contact: ${booking.hostName} (${booking.hostPhone})

Checklist:
[ ] Downloaded SETUVANA Offline Arrival Pack
[ ] Government ID card (Aadhaar / Voter ID / Passport)
[ ] Cash for payment on arrival (₹${booking.totalAmount})
[ ] Offline train / bus arrival instructions
[ ] Power bank for remote rural village
[ ] Basic personal medicines & torch/flashlight
[ ] Respect tribal community cultural guidelines (no loud noise, seek photo consent)`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(travelNotesText);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#faf8f5] text-stone-900 rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#133926] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-900 text-amber-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">{t.syncGoogleCalendar}</h2>
              <p className="text-xs text-emerald-200/80">
                Google Workspace Calendar & Rural Travel Checklists
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-emerald-900 text-stone-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Booking Summary Card */}
          <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-sm text-stone-800">{booking.propertyName}</h3>
                <p className="text-stone-500 text-[11px]">
                  {booking.propertyVillage}, {booking.propertyDistrict}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold uppercase">
                {booking.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-[11px]">
              <div>
                <span className="text-stone-400 block">Check-In:</span>
                <span className="font-semibold text-stone-800">{booking.checkInDate}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Check-Out:</span>
                <span className="font-semibold text-stone-800">{booking.checkOutDate}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Host Phone:</span>
                <span className="font-semibold text-stone-800">{booking.hostPhone}</span>
              </div>
              <div>
                <span className="text-stone-400 block">Guests:</span>
                <span className="font-semibold text-stone-800">{booking.guestsCount} adults</span>
              </div>
            </div>
          </div>

          {/* Google Calendar OAuth Sync Section */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
              1. Direct Google Calendar Sync (Live API)
            </h4>

            {!currentUser ? (
              <div className="space-y-2">
                <p className="text-stone-600 text-[11px]">
                  Sign in with your Google account to automatically schedule this homestay stay and reminders on your primary calendar.
                </p>

                {/* Official Material Google Sign-In Button */}
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold shadow-xs transition active:scale-[0.99]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Connected as: <strong>{currentUser.email}</strong></span>
                  </div>
                  <button onClick={logout} className="text-[11px] underline text-stone-500 hover:text-stone-800">
                    Sign out
                  </button>
                </div>

                <button
                  onClick={handleSyncToGoogleCalendar}
                  disabled={isSyncing}
                  className="w-full py-2.5 rounded-lg bg-[#133926] hover:bg-[#0e2a1c] text-white font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>{isSyncing ? 'Adding Event...' : 'Add Stay to Google Calendar'}</span>
                </button>

                {syncResult && (
                  <div className={`p-2.5 rounded-lg border ${syncResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                    {syncResult.success ? (
                      <div className="flex items-center justify-between">
                        <span>✓ Successfully added event to your Google Calendar!</span>
                        {syncResult.htmlLink && (
                          <a href={syncResult.htmlLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 underline font-bold">
                            Open <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <span>Failed: {syncResult.error}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Offline Calendar Fallback (.ICS) */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#c25e3e]" />
              2. Offline Calendar File (.ics Download)
            </h4>
            <p className="text-stone-600 text-[11px]">
              Works 100% offline without requiring internet. Download and open directly in your phone’s built-in Calendar app.
            </p>
            <button
              onClick={() => downloadICSFile(booking)}
              className="w-full py-2 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              Download .ICS Calendar Event
            </button>
          </div>

          {/* Travel Notes & Google Keep Checklist */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-700" />
                3. {t.googleKeepNotes}
              </h4>
              <button
                onClick={copyToClipboard}
                className="px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 text-[10px] font-semibold flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                {copiedNotes ? 'Copied!' : 'Copy to Keep'}
              </button>
            </div>
            <pre className="text-[10px] bg-white p-2.5 rounded-lg border border-stone-200 text-stone-700 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
              {travelNotesText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-100 px-5 py-3 border-t border-stone-200 flex justify-end">
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
