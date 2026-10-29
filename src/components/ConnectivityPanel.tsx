/**
 * SETUVANA - Global Connectivity Panel & Test Lab
 * Offline Sync Manager, IndexedDB Cache Inspector, and Network Simulation Lab
 */

import React, { useState } from 'react';
import { Language, ConnectivityMode, OfflineActionQueueItem } from '../types';
import { translations } from '../translations';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Database,
  Trash2,
  AlertTriangle,
  FlaskConical,
  CheckCircle2,
  XCircle,
  X,
  PhoneCall,
  Clock,
  Layers,
} from 'lucide-react';
import { idbClearLocalCache } from '../services/db';

interface ConnectivityPanelProps {
  currentLanguage: Language;
  isOpen: boolean;
  onClose: () => void;
  connectivityMode: ConnectivityMode;
  setConnectivityMode: (mode: ConnectivityMode) => void;
  lowDataMode: boolean;
  setLowDataMode: (val: boolean) => void;
  queue: OfflineActionQueueItem[];
  onManualSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: string | null;
  cachedHomestaysCount: number;
  onSimulateConflict: () => void;
  onSimulateMissedCall: () => void;
  onSimulateDelayedSMS: () => void;
  onSimulateCoordinatorEscalation: () => void;
}

export const ConnectivityPanel: React.FC<ConnectivityPanelProps> = ({
  currentLanguage,
  isOpen,
  onClose,
  connectivityMode,
  setConnectivityMode,
  lowDataMode,
  setLowDataMode,
  queue,
  onManualSync,
  isSyncing,
  lastSyncTime,
  cachedHomestaysCount,
  onSimulateConflict,
  onSimulateMissedCall,
  onSimulateDelayedSMS,
  onSimulateCoordinatorEscalation,
}) => {
  const t = translations[currentLanguage];
  const [simulationNotice, setSimulationNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const showSimNotice = (msg: string) => {
    setSimulationNotice(msg);
    setTimeout(() => setSimulationNotice(null), 4000);
  };

  const handleClearCache = async () => {
    if (confirm('Clear local offline cached listings and drafts?')) {
      await idbClearLocalCache();
      showSimNotice('Local offline cache cleared.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#faf8f5] text-stone-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#133926] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-900 text-amber-300">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif tracking-tight">
                {t.testLab}
              </h2>
              <p className="text-xs text-emerald-200/80">
                Resilient Offline-First Architecture & Telemetry Manager
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-emerald-900 text-stone-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simulation Notice Banner */}
        {simulationNotice && (
          <div className="bg-amber-100 text-amber-900 border-b border-amber-300 px-6 py-2.5 text-xs font-semibold flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white text-[10px] uppercase font-bold tracking-wider">
              SIMULATION
            </span>
            <span>{simulationNotice}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Real-Time Connectivity Status */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#c25e3e]" />
                Current Network Status
              </h3>
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Last Sync: {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => {
                  setConnectivityMode('good');
                  showSimNotice('Switched network mode to Good Connectivity (Online).');
                }}
                className={`p-3 rounded-lg border text-left transition flex flex-col items-start ${
                  connectivityMode === 'good'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <Wifi className="w-4 h-4 text-emerald-600" />
                  Mode A: Online
                </div>
                <span className="text-[11px] text-stone-500 leading-tight">
                  Server reachable, live SmartCall, real-time sync.
                </span>
              </button>

              <button
                onClick={() => {
                  setConnectivityMode('weak');
                  setLowDataMode(true);
                  showSimNotice('Switched network mode to Weak / Intermittent (Low-Data).');
                }}
                className={`p-3 rounded-lg border text-left transition flex flex-col items-start ${
                  connectivityMode === 'weak'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Mode B: Weak
                </div>
                <span className="text-[11px] text-stone-500 leading-tight">
                  High latency, compact cards, queued sync.
                </span>
              </button>

              <button
                onClick={() => {
                  setConnectivityMode('offline');
                  showSimNotice('Switched network mode to Mode C (Completely Offline).');
                }}
                className={`p-3 rounded-lg border text-left transition flex flex-col items-start ${
                  connectivityMode === 'offline'
                    ? 'bg-stone-800 border-stone-900 text-white ring-1 ring-stone-900'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                  <WifiOff className="w-4 h-4 text-red-400" />
                  Mode C: Offline
                </div>
                <span className="text-[11px] text-stone-300 leading-tight">
                  Zero internet, IndexedDB local drafts only.
                </span>
              </button>
            </div>
          </div>

          {/* 2. Sync Queue & IndexedDB Cache */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700" />
                  IndexedDB Local Cache & Sync Queue
                </h3>
                <p className="text-xs text-stone-500">
                  {cachedHomestaysCount} homestays cached locally for instant offline search.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onManualSync}
                  disabled={isSyncing || connectivityMode === 'offline'}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#133926] text-white hover:bg-[#0e2a1c] disabled:opacity-50 transition flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? t.statusSyncing : t.manualSync}
                </button>
                <button
                  onClick={handleClearCache}
                  className="p-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-700 hover:bg-red-50 transition"
                  title="Clear IndexedDB cache"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {queue.length === 0 ? (
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All local booking requests & coordinator edits are synchronized with the server.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-xs font-bold text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {queue.length} item(s) pending synchronization. These will dispatch automatically when back online.
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5">
                  {queue.map((q) => (
                    <div
                      key={q.id}
                      className="p-2 rounded bg-stone-50 border border-stone-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-stone-800">
                          {q.actionType === 'create_booking' ? 'Booking Request Draft' : q.actionType}
                        </span>
                        <span className="text-stone-400 text-[10px] ml-2">
                          {new Date(q.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                        Waiting Sync
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. OSFIC Connectivity Test Lab (Simulation Controls) */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4.5 h-4.5 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900">
                  OSFIC Connectivity Demonstration Test Lab
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-bold">
                SIMULATION SUITE
              </span>
            </div>
            <p className="text-xs text-stone-600 mb-3">
              Use these interactive triggers to test edge conditions specified in the OSFIC problem statement.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  onSimulateConflict();
                  showSimNotice('Simulated booking conflict created. Coordinator review flagged.');
                }}
                className="p-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-left text-xs transition"
              >
                <div className="font-bold text-stone-800 mb-0.5 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-500" />
                  Simulate Booking Conflict
                </div>
                <p className="text-[11px] text-stone-500">
                  Tests concurrency detection when two reservations request overlapping dates.
                </p>
              </button>

              <button
                onClick={() => {
                  onSimulateMissedCall();
                  showSimNotice('Simulated unanswerable SmartCall. Retry scheduled with quiet hours.');
                }}
                className="p-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-left text-xs transition"
              >
                <div className="font-bold text-stone-800 mb-0.5 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-amber-500" />
                  Simulate Missed Call & Retry
                </div>
                <p className="text-[11px] text-stone-500">
                  Tests automated bounded retry policy when host keypad phone does not pick up.
                </p>
              </button>

              <button
                onClick={() => {
                  onSimulateDelayedSMS();
                  showSimNotice('Simulated cellular SMS delay. Plain-text SMS delivery queued.');
                }}
                className="p-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-left text-xs transition"
              >
                <div className="font-bold text-stone-800 mb-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  Simulate Delayed SMS Delivery
                </div>
                <p className="text-[11px] text-stone-500">
                  Tests delayed cellular delivery receipt and Odia Unicode message fragmentation.
                </p>
              </button>

              <button
                onClick={() => {
                  onSimulateCoordinatorEscalation();
                  showSimNotice('Simulated 2 failed attempts. Escalated to Village Coordinator desk.');
                }}
                className="p-2.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 text-left text-xs transition"
              >
                <div className="font-bold text-stone-800 mb-0.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
                  Simulate Coordinator Escalation
                </div>
                <p className="text-[11px] text-stone-500">
                  Triggers human coordinator callback queue task after repeated telecommunications failures.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
            <input
              type="checkbox"
              checked={lowDataMode}
              onChange={(e) => setLowDataMode(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-600 h-4 w-4"
            />
            <span>{t.lowDataMode} (Disable large image downloads)</span>
          </label>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-stone-300 hover:bg-stone-400 text-stone-800 transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
