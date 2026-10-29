/**
 * SETUVANA - SmartCall Interactive Keypad Phone & SMS Simulator
 * Real-world voice & SMS bridge for homestay hosts with basic keypad phones.
 */

import React, { useState, useEffect } from 'react';
import { Booking, Language, SmartCallNotification } from '../types';
import { translations } from '../translations';
import { playDTMFTone, playRingingTone } from '../services/audio';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Volume2,
  MessageSquare,
  X,
  Radio,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface SmartCallModalProps {
  currentLanguage: Language;
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  notification: SmartCallNotification | null;
  onKeypadResponse: (bookingId: string, dtmfInput: '1' | '2' | '3' | '4') => Promise<void>;
}

export const SmartCallModal: React.FC<SmartCallModalProps> = ({
  currentLanguage,
  isOpen,
  onClose,
  booking,
  notification,
  onKeypadResponse,
}) => {
  const t = translations[currentLanguage];

  const [activeTab, setActiveTab] = useState<'call' | 'sms'>('call');
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Audio ringback effect on modal open
  useEffect(() => {
    if (isOpen && callState === 'ringing') {
      const stopRinging = playRingingTone(2);
      return () => stopRinging();
    }
  }, [isOpen, callState]);

  if (!isOpen || !booking) return null;

  const currentNotif = notification || booking.notificationHistory[0];

  const handleAnswerCall = () => {
    setCallState('connected');
    speakPrompt();
  };

  const handleEndCall = () => {
    setCallState('ended');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const speakPrompt = () => {
    if (!currentNotif) return;
    setIsSpeaking(true);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentNotif.voiceScript);
      if (currentNotif.preferredLanguage === 'or') {
        utterance.lang = 'or-IN';
      } else if (currentNotif.preferredLanguage === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsSpeaking(false), 5000);
    }
  };

  const handleKeyPress = async (key: string) => {
    playDTMFTone(key);
    setLastKeyPressed(key);

    if (key === '1') {
      setActionFeedback('DTMF 1 Received: Revalidating inventory & accepting booking...');
      await onKeypadResponse(booking.id, '1');
      setTimeout(() => {
        setCallState('ended');
        setActionFeedback('Booking Confirmed! Host accepted request.');
      }, 1000);
    } else if (key === '2') {
      setActionFeedback('DTMF 2 Received: Declining booking request...');
      await onKeypadResponse(booking.id, '2');
      setTimeout(() => {
        setCallState('ended');
        setActionFeedback('Booking Declined by host.');
      }, 1000);
    } else if (key === '3') {
      setActionFeedback('DTMF 3 Received: Escalating to Village Coordinator desk...');
      await onKeypadResponse(booking.id, '3');
      setTimeout(() => {
        setActionFeedback('Escalated! Urgent callback task created for Coordinator.');
      }, 1000);
    } else if (key === '4') {
      setActionFeedback('DTMF 4 Received: Repeating booking details...');
      speakPrompt();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#242b26] text-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-700 overflow-hidden flex flex-col">
        {/* Top Simulation Banner */}
        <div className="bg-[#133926] px-4 py-2 flex items-center justify-between text-xs border-b border-emerald-800">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span className="font-bold">SIMULATION: SMARTCALL TELEPHONY</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-800 rounded text-stone-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: Voice Call vs SMS preview */}
        <div className="flex border-b border-stone-700 bg-stone-900 text-xs">
          <button
            onClick={() => setActiveTab('call')}
            className={`flex-1 py-2 font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'call'
                ? 'bg-stone-800 text-amber-300 border-b-2 border-amber-400'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Keypad Phone Call
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-2 font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'sms'
                ? 'bg-stone-800 text-amber-300 border-b-2 border-amber-400'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Matching SMS Alert
          </button>
        </div>

        {activeTab === 'call' ? (
          <div className="p-4 sm:p-5 flex flex-col items-center">
            {/* Rustic Keypad Phone Body (Simulated JioBharat / Nokia) */}
            <div className="w-full max-w-[320px] bg-stone-900 rounded-3xl p-4 border-4 border-stone-700 shadow-2xl flex flex-col items-center">
              {/* Earpiece slit */}
              <div className="w-12 h-1.5 bg-stone-700 rounded-full mb-3" />

              {/* Monochrome / Green Backlight Screen */}
              <div className="w-full bg-[#7a9a60] text-[#1c2c10] font-mono rounded-lg p-3 border-2 border-stone-800 shadow-inner flex flex-col justify-between min-h-[140px] text-xs leading-tight">
                {/* Top status bar */}
                <div className="flex items-center justify-between border-b border-[#5c7a42] pb-1 text-[10px]">
                  <span>📶 BSNL 2G</span>
                  <span>[Ref:{booking.reference}]</span>
                  <span>🔋 92%</span>
                </div>

                {/* Main Screen Content */}
                <div className="my-2">
                  {callState === 'ringing' && (
                    <div className="text-center py-2 animate-pulse">
                      <div className="font-bold text-sm tracking-wide mb-1">INCOMING CALL...</div>
                      <div className="text-xs">SETUVANA SmartCall</div>
                      <div className="text-[10px] text-[#2c3d1e] mt-1">+91 80471 90000</div>
                    </div>
                  )}

                  {callState === 'connected' && (
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#2d401e] mb-1">
                        <span>● CALL ACTIVE</span>
                        <span>{isSpeaking ? '🔊 Speaking...' : 'Listening DTMF'}</span>
                      </div>
                      <div className="text-[11px] font-semibold line-clamp-3 bg-[#6f8e56]/40 p-1.5 rounded">
                        {currentNotif?.voiceScript || 'Playing booking audio script...'}
                      </div>
                    </div>
                  )}

                  {callState === 'ended' && (
                    <div className="text-center py-3">
                      <div className="font-bold text-sm">CALL TERMINATED</div>
                      <div className="text-[11px] mt-1">Status: {booking.status.toUpperCase()}</div>
                    </div>
                  )}
                </div>

                {/* Keypad Menu Guide on Screen */}
                <div className="border-t border-[#5c7a42] pt-1 text-[9px] text-[#243516] flex justify-between">
                  <span>1:Accept</span>
                  <span>2:Decline</span>
                  <span>3:Coord</span>
                  <span>4:Repeat</span>
                </div>
              </div>

              {/* Action Call Controls (Green Answer / Red Disconnect) */}
              <div className="w-full grid grid-cols-2 gap-3 my-3">
                <button
                  onClick={handleAnswerCall}
                  disabled={callState === 'connected'}
                  className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  Answer
                </button>
                <button
                  onClick={handleEndCall}
                  className="py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <PhoneOff className="w-4 h-4" />
                  End Call
                </button>
              </div>

              {/* Physical Keypad Buttons Grid (3x4) */}
              <div className="w-full grid grid-cols-3 gap-2 text-stone-200">
                {[
                  { key: '1', sub: 'Accept' },
                  { key: '2', sub: 'Decline' },
                  { key: '3', sub: 'Coord' },
                  { key: '4', sub: 'Repeat' },
                  { key: '5', sub: 'JKL' },
                  { key: '6', sub: 'MNO' },
                  { key: '7', sub: 'PQRS' },
                  { key: '8', sub: 'TUV' },
                  { key: '9', sub: 'WXYZ' },
                  { key: '*', sub: 'Lock' },
                  { key: '0', sub: 'Space' },
                  { key: '#', sub: 'Silent' },
                ].map(({ key, sub }) => (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className={`py-2 px-1 rounded-xl bg-stone-800 hover:bg-stone-700 active:bg-amber-600 active:text-white border border-stone-600 shadow flex flex-col items-center justify-center transition active:scale-95 ${
                      lastKeyPressed === key ? 'ring-2 ring-amber-400 bg-stone-700' : ''
                    }`}
                  >
                    <span className="font-bold text-sm leading-none">{key}</span>
                    <span className="text-[9px] text-stone-400 mt-0.5 leading-none">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Status Feedback */}
            {actionFeedback && (
              <div className="mt-3 w-full p-2.5 rounded-lg bg-stone-800 text-amber-300 text-xs text-center border border-amber-500/40 font-mono animate-fadeIn">
                {actionFeedback}
              </div>
            )}
          </div>
        ) : (
          /* Matching SMS Preview Tab */
          <div className="p-5 space-y-4">
            <div className="bg-stone-900 rounded-2xl p-4 border border-stone-700 font-mono text-xs">
              <div className="flex items-center justify-between text-stone-400 text-[11px] border-b border-stone-800 pb-2 mb-3">
                <span>Sender: VK-SETUVN</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>

              <div className="text-emerald-300 bg-stone-950 p-3 rounded-lg border border-emerald-900/60 leading-relaxed">
                {currentNotif?.smsText ||
                  `SETUVANA: New booking ref ${booking.reference}. Arriving ${booking.checkInDate}. Total ${booking.guestsCount} guests. Press 1 to accept.`}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                <span>Status: Delivered via Cellular SMS</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  CONFIRMED RECEIPT
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                Keypad Host Operating Rule
              </div>
              <p className="text-[11px] text-amber-300/80">
                Hosts in remote villages like Kurli or Doliamba reply directly during the voice call or via SMS without requiring mobile data. Non-response never counts as acceptance.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-stone-900 px-4 py-2.5 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Booking Ref: <strong className="text-white">{booking.reference}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
