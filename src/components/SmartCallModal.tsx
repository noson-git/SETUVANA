/**
 * SETUVANA - SmartCall Interactive Keypad Phone & SMS Simulator
 * High-fidelity, zero-dependency interactive demonstration of the SmartCall
 * feature-phone IVR workflow for rural and tribal homestay hosts in Odisha.
 * Fully Netlify and offline compatible.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Booking, Language, SmartCallNotification } from '../types';
import { translations } from '../translations';
import { playDTMFTone, playRingingTone } from '../services/audio';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  MessageSquare,
  X,
  Radio,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Send,
  Info,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export type SimulatorCallState =
  | 'ready'
  | 'incoming'
  | 'connected'
  | 'processing'
  | 'completed'
  | 'failed';

interface SmartCallModalProps {
  currentLanguage: Language;
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  notification: SmartCallNotification | null;
  onKeypadResponse: (bookingId: string, dtmfInput: '1' | '2' | '3' | '4') => Promise<void>;
  realTelephonyConfig?: {
    liveModeEnabled: boolean;
    provider: string;
    registeredVirtualNumber: string;
  };
}

export const SmartCallModal: React.FC<SmartCallModalProps> = ({
  currentLanguage,
  isOpen,
  onClose,
  booking,
  notification,
  onKeypadResponse,
  realTelephonyConfig,
}) => {
  const t = translations[currentLanguage];

  const [activeTab, setActiveTab] = useState<'call' | 'sms'>('call');
  const [callState, setCallState] = useState<SimulatorCallState>('incoming');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);
  const [displayInputBuffer, setDisplayInputBuffer] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [smsReplyText, setSmsReplyText] = useState<string>('');
  const [smsReplySent, setSmsReplySent] = useState<string | null>(null);

  const durationTimerRef = useRef<any>(null);
  const stopRingingRef = useRef<(() => void) | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Active notification data
  const currentNotif = notification || booking?.notificationHistory?.[0] || null;

  // Cleanup on unmount or close
  const cleanupAudioAndTimers = useCallback(() => {
    if (stopRingingRef.current) {
      stopRingingRef.current();
      stopRingingRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // When modal opens or booking changes, initialize call
  useEffect(() => {
    if (isOpen && booking) {
      setCallState('incoming');
      setLastKeyPressed(null);
      setDisplayInputBuffer('');
      setActionFeedback(null);
      setErrorMessage(null);
      setCallDuration(0);
      setSmsReplySent(null);
    } else {
      cleanupAudioAndTimers();
    }

    return () => {
      cleanupAudioAndTimers();
    };
  }, [isOpen, booking, cleanupAudioAndTimers]);

  // Manage Ringing audio when in 'incoming' state
  useEffect(() => {
    if (isOpen && callState === 'incoming') {
      try {
        const stopRing = playRingingTone(3);
        stopRingingRef.current = stopRing;
      } catch (err) {
        console.warn('Ringing audio tone note:', err);
      }
    } else {
      if (stopRingingRef.current) {
        stopRingingRef.current();
        stopRingingRef.current = null;
      }
    }
    return () => {
      if (stopRingingRef.current) {
        stopRingingRef.current();
        stopRingingRef.current = null;
      }
    };
  }, [isOpen, callState]);

  // Call duration counter when 'connected'
  useEffect(() => {
    if (callState === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    }
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [callState]);

  if (!isOpen || !booking) return null;

  // Speech synthesis speaker
  const speakPrompt = () => {
    if (!currentNotif || isMuted) return;
    setIsSpeaking(true);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentNotif.voiceScript);
      speechUtteranceRef.current = utterance;

      if (currentNotif.preferredLanguage === 'or') {
        utterance.lang = 'or-IN';
      } else if (currentNotif.preferredLanguage === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      utterance.rate = 0.92;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsSpeaking(false), 4000);
    }
  };

  const handleAnswerCall = () => {
    if (stopRingingRef.current) {
      stopRingingRef.current();
      stopRingingRef.current = null;
    }
    setCallState('connected');
    speakPrompt();
  };

  const handleEndCall = () => {
    cleanupAudioAndTimers();
    setCallState('completed');
    setActionFeedback('Call ended by host. Awaiting further communication.');
  };

  const handleResetSimulator = () => {
    cleanupAudioAndTimers();
    setCallState('incoming');
    setLastKeyPressed(null);
    setDisplayInputBuffer('');
    setActionFeedback(null);
    setErrorMessage(null);
    setCallDuration(0);
  };

  const handleKeyPress = async (key: string) => {
    // Play dual-tone multi-frequency tone
    try {
      playDTMFTone(key);
    } catch {
      // Audio fallback
    }

    setLastKeyPressed(key);
    setDisplayInputBuffer(`[ ${key} ]`);

    // Only process IVR response if call is in connected state
    if (callState !== 'connected') {
      if (callState === 'incoming') {
        setActionFeedback('Please answer the incoming call first (Press Answer button).');
      } else if (callState === 'completed' || callState === 'failed') {
        setActionFeedback('Call ended. Click "Reset Simulator" to test another response.');
      }
      return;
    }

    if (key === '1') {
      setCallState('processing');
      setActionFeedback('DTMF 1 Received: Revalidating room inventory & accepting stay...');
      try {
        await onKeypadResponse(booking.id, '1');
        cleanupAudioAndTimers();
        setCallState('completed');
        setActionFeedback('✅ BOOKING ACCEPTED! Stay confirmed. Guest SMS dispatched.');
      } catch (err: any) {
        setCallState('failed');
        setErrorMessage(err.message || 'Failed to accept booking. Server or network issue.');
      }
    } else if (key === '2') {
      setCallState('processing');
      setActionFeedback('DTMF 2 Received: Declining stay request & releasing dates...');
      try {
        await onKeypadResponse(booking.id, '2');
        cleanupAudioAndTimers();
        setCallState('completed');
        setActionFeedback('❌ BOOKING DECLINED. Host rejected the request.');
      } catch (err: any) {
        setCallState('failed');
        setErrorMessage(err.message || 'Failed to decline booking.');
      }
    } else if (key === '3') {
      setCallState('processing');
      setActionFeedback('DTMF 3 Received: Escalating to Village Coordinator desk...');
      try {
        await onKeypadResponse(booking.id, '3');
        cleanupAudioAndTimers();
        setCallState('completed');
        setActionFeedback('⚠️ ESCALATED! Urgent follow-up task created for Village Coordinator.');
      } catch (err: any) {
        setCallState('failed');
        setErrorMessage(err.message || 'Failed to escalate booking.');
      }
    } else if (key === '4') {
      setActionFeedback('DTMF 4 Received: Repeating booking details & instructions...');
      speakPrompt();
    } else {
      setActionFeedback(`Key [${key}]: Invalid option. Valid IVR keys: 1 (Accept), 2 (Decline), 3 (Coordinator), 4 (Repeat).`);
    }
  };

  const handleSendSimulatedSmsReply = async (replyCode: '1' | '2' | '3') => {
    const textDesc =
      replyCode === '1'
        ? 'Accepted stay via SMS 1'
        : replyCode === '2'
        ? 'Declined stay via SMS 2'
        : 'Requested Coordinator help via SMS 3';

    try {
      await onKeypadResponse(booking.id, replyCode);
      setSmsReplySent(`SMS Sent: "${replyCode}" (${textDesc}). System status updated.`);
    } catch (err: any) {
      setSmsReplySent(`Error processing SMS response: ${err.message}`);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isLiveTelephonyActive = Boolean(realTelephonyConfig?.liveModeEnabled);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#1f2420] text-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-700 overflow-hidden flex flex-col my-auto animate-fadeIn">
        {/* Top Demo Mode Banner */}
        <div className="bg-[#133926] px-4 py-2.5 flex items-center justify-between text-xs border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div className="leading-tight">
              <span className="font-bold text-amber-300 font-mono tracking-wide text-[11px] block">
                DEMO MODE: SMARTCALL SIMULATOR
              </span>
              <span className="text-[10px] text-emerald-200">
                Interactive Local Telephony • No Paid Provider Required
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-emerald-800 rounded-lg text-stone-300 hover:text-white transition"
            title="Close Simulator"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real Provider Transparency Callout */}
        <div className="bg-stone-900/90 px-4 py-1.5 border-b border-stone-800 flex items-center justify-between text-[10px] text-stone-400 font-mono">
          <span>
            Provider:{' '}
            <strong className={isLiveTelephonyActive ? 'text-emerald-400' : 'text-amber-300'}>
              {isLiveTelephonyActive ? 'Live Exotel Integration' : 'Local Audio Synthesis (Simulation)'}
            </strong>
          </span>
          <span>Virtual No: +91 80471 90000</span>
        </div>

        {/* Tab switch: Keypad Phone vs SMS preview */}
        <div className="flex border-b border-stone-700 bg-stone-950 text-xs">
          <button
            onClick={() => setActiveTab('call')}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'call'
                ? 'bg-stone-900 text-amber-300 border-b-2 border-amber-400'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Host Keypad Phone
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-2.5 font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'sms'
                ? 'bg-stone-900 text-amber-300 border-b-2 border-amber-400'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Cellular SMS Alert
          </button>
        </div>

        {activeTab === 'call' ? (
          <div className="p-4 sm:p-5 flex flex-col items-center">
            {/* Reset & Status Actions Header */}
            <div className="w-full flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    callState === 'incoming'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                      : callState === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : callState === 'processing'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : callState === 'completed'
                      ? 'bg-stone-700 text-stone-200'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  State: {callState.toUpperCase()}
                </span>
              </div>

              <button
                onClick={handleResetSimulator}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 text-[11px] font-semibold border border-stone-700 transition"
                title="Restart simulation call"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Simulator</span>
              </button>
            </div>

            {/* Rustic Keypad Phone Body (Simulated JioBharat / Nokia) */}
            <div className="w-full max-w-[320px] bg-stone-900 rounded-3xl p-4 border-4 border-stone-700 shadow-2xl flex flex-col items-center">
              {/* Earpiece slit */}
              <div className="w-12 h-1.5 bg-stone-700 rounded-full mb-3" />

              {/* Monochrome / Green Backlight Screen */}
              <div className="w-full bg-[#7a9a60] text-[#1c2c10] font-mono rounded-lg p-3 border-2 border-stone-800 shadow-inner flex flex-col justify-between min-h-[160px] text-xs leading-tight">
                {/* Top status bar */}
                <div className="flex items-center justify-between border-b border-[#5c7a42] pb-1 text-[10px]">
                  <span>📶 BSNL 2G</span>
                  <span>[Ref:{booking.reference}]</span>
                  <span>🔋 92%</span>
                </div>

                {/* Main Screen Content */}
                <div className="my-2">
                  {callState === 'ready' && (
                    <div className="text-center py-4">
                      <div className="font-bold text-sm tracking-wide">PHONE STANDBY</div>
                      <div className="text-[11px] mt-1 text-[#2d401e]">Host: {booking.hostName}</div>
                      <div className="text-[10px] mt-2 text-[#374e25]">Ready for incoming SmartCall</div>
                    </div>
                  )}

                  {callState === 'incoming' && (
                    <div className="text-center py-2 animate-pulse">
                      <div className="font-bold text-sm tracking-wide mb-1">📞 INCOMING CALL...</div>
                      <div className="text-xs font-semibold">SETUVANA SmartCall Gateway</div>
                      <div className="text-[10px] text-[#2c3d1e] mt-1">+91 80471 90000</div>
                      <div className="text-[9px] mt-2 font-bold text-[#1f2e13]">PRESS ANSWER TO CONNECT</div>
                    </div>
                  )}

                  {callState === 'connected' && (
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#2d401e] mb-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                          ACTIVE {formatSeconds(callDuration)}
                        </span>
                        <span>{isSpeaking ? '🔊 Speaking...' : 'Listening DTMF'}</span>
                      </div>
                      <div className="text-[11px] font-semibold line-clamp-3 bg-[#6f8e56]/40 p-1.5 rounded border border-[#5c7a42]/50">
                        {currentNotif?.voiceScript || 'Playing booking audio details...'}
                      </div>
                      {displayInputBuffer && (
                        <div className="mt-1 text-[11px] font-bold text-right text-[#17260d]">
                          Input Buffer: {displayInputBuffer}
                        </div>
                      )}
                    </div>
                  )}

                  {callState === 'processing' && (
                    <div className="text-center py-4 space-y-1">
                      <div className="font-bold text-sm flex items-center justify-center gap-1.5">
                        <Loader2 className="w-4 h-4 animate-spin text-[#17260d]" />
                        <span>PROCESSING...</span>
                      </div>
                      <div className="text-[10px] text-[#2c3d1e]">
                        Validating inventory & recording DTMF {lastKeyPressed}...
                      </div>
                    </div>
                  )}

                  {callState === 'completed' && (
                    <div className="text-center py-3">
                      <div className="font-bold text-sm flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-[#17260d]" />
                        <span>CALL FINISHED</span>
                      </div>
                      <div className="text-[11px] font-bold mt-1 uppercase">
                        Outcome: {booking.status.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[10px] mt-1 text-[#2d401e]">Ref #{booking.reference} saved to DB</div>
                    </div>
                  )}

                  {callState === 'failed' && (
                    <div className="text-center py-2 text-red-900">
                      <div className="font-bold text-sm">CALL FAILED</div>
                      <div className="text-[10px] line-clamp-2 mt-1">{errorMessage || 'Network or logic error'}</div>
                    </div>
                  )}
                </div>

                {/* Keypad Menu Guide on Screen */}
                <div className="border-t border-[#5c7a42] pt-1 text-[9px] text-[#243516] flex justify-between font-bold">
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
                  disabled={callState === 'connected' || callState === 'processing'}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  Answer
                </button>
                <button
                  onClick={handleEndCall}
                  disabled={callState === 'completed' || callState === 'ready'}
                  className="py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
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
                      lastKeyPressed === key ? 'ring-2 ring-amber-400 bg-stone-700 text-amber-200' : ''
                    }`}
                  >
                    <span className="font-bold text-sm leading-none">{key}</span>
                    <span className="text-[9px] text-stone-400 mt-0.5 leading-none">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Voice Control Utility */}
            {callState === 'connected' && (
              <div className="w-full max-w-[320px] mt-3 flex items-center justify-between text-xs text-stone-400">
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                    } else {
                      speakPrompt();
                    }
                  }}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{isSpeaking ? 'Stop Audio' : 'Play Script Audio'}</span>
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex items-center gap-1 text-stone-400 hover:text-white"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>
              </div>
            )}

            {/* Dynamic Status Feedback Banner */}
            {actionFeedback && (
              <div className="mt-3 w-full p-2.5 rounded-xl bg-stone-800 text-amber-300 text-xs text-center border border-amber-500/40 font-mono animate-fadeIn">
                {actionFeedback}
              </div>
            )}

            {errorMessage && (
              <div className="mt-3 w-full p-2.5 rounded-xl bg-red-950/60 text-red-200 text-xs text-center border border-red-500/50 font-mono">
                {errorMessage}
              </div>
            )}
          </div>
        ) : (
          /* Matching Cellular SMS Preview Tab */
          <div className="p-5 space-y-4">
            <div className="bg-stone-900 rounded-2xl p-4 border border-stone-700 font-mono text-xs">
              <div className="flex items-center justify-between text-stone-400 text-[11px] border-b border-stone-800 pb-2 mb-3">
                <span>Sender: VK-SETUVN</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>

              <div className="text-emerald-300 bg-stone-950 p-3 rounded-lg border border-emerald-900/60 leading-relaxed">
                {currentNotif?.smsText ||
                  `SETUVANA: New booking ref ${booking.reference}. ${booking.guestsCount} guests arriving ${booking.checkInDate} at ${booking.estimatedArrivalTime}. Stay till ${booking.checkOutDate}. Press 1 to accept or contact coordinator.`}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
                <span>Status: Delivered via Cellular 2G SMS</span>
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  CONFIRMED RECEIPT
                </span>
              </div>
            </div>

            {/* Simulated SMS Reply Actions */}
            <div className="bg-stone-900 rounded-2xl p-4 border border-stone-700 space-y-3">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                Simulate Host SMS Response
              </h4>
              <p className="text-[11px] text-stone-400">
                Hosts without voice connection can reply directly to the SMS with single-digit codes.
              </p>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSendSimulatedSmsReply('1')}
                  className="py-2 px-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center justify-center transition shadow-xs"
                >
                  <span className="font-black text-sm">Reply "1"</span>
                  <span className="text-[9px] text-emerald-200">Accept Stay</span>
                </button>

                <button
                  onClick={() => handleSendSimulatedSmsReply('2')}
                  className="py-2 px-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-white font-bold text-xs flex flex-col items-center justify-center transition shadow-xs"
                >
                  <span className="font-black text-sm">Reply "2"</span>
                  <span className="text-[9px] text-red-200">Decline Stay</span>
                </button>

                <button
                  onClick={() => handleSendSimulatedSmsReply('3')}
                  className="py-2 px-1.5 rounded-xl bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs flex flex-col items-center justify-center transition shadow-xs"
                >
                  <span className="font-black text-sm">Reply "3"</span>
                  <span className="text-[9px] text-amber-200">Coordinator</span>
                </button>
              </div>

              {smsReplySent && (
                <div className="mt-2 p-2 rounded-lg bg-emerald-950/60 text-emerald-300 text-[11px] border border-emerald-800 text-center font-mono">
                  {smsReplySent}
                </div>
              )}
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
          <span>
            Booking Ref: <strong className="text-white font-mono">{booking.reference}</strong> ({booking.status})
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
