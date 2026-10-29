/**
 * SETUVANA - Administration & Rural Impact Dashboard
 * Governs Bookability Passports, Telephony Gateway Configuration,
 * Audit Trails, and Verified CSV Data Exports
 */

import React, { useState, useEffect } from 'react';
import { Language, Homestay, Booking, AuditLog } from '../types';
import { translations } from '../translations';
import {
  Shield,
  Download,
  PhoneCall,
  Activity,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  Settings,
  Server,
  Lock,
} from 'lucide-react';

interface AdminViewProps {
  currentLanguage: Language;
  homestays: Homestay[];
  bookings: Booking[];
  onOpenBookabilityPassport: (homestay: Homestay) => void;
  onResetDemo: () => Promise<void>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  currentLanguage,
  homestays,
  bookings,
  onOpenBookabilityPassport,
  onResetDemo,
}) => {
  const t = translations[currentLanguage];

  const [metrics, setMetrics] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [telephonyLiveMode, setTelephonyLiveMode] = useState(false);
  const [accountSid, setAccountSid] = useState('EXOTEL_SETUVANA_DEMO');
  const [apiKey, setApiKey] = useState('EXOTEL_KEY_DEMO');
  const [virtualNumber, setVirtualNumber] = useState('+91 80471 90000');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, [homestays, bookings]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setAuditLogs(data.auditLogs || []);
        if (data.metrics.telephonyConfig) {
          setTelephonyLiveMode(data.metrics.telephonyConfig.liveModeEnabled);
        }
      }
    } catch (err) {
      console.error('Metrics fetch error:', err);
    }
  };

  const handleSaveTelephonyConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/telephony-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: telephonyLiveMode ? 'exotel' : 'simulation',
          accountSid,
          apiKey,
          registeredVirtualNumber: virtualNumber,
          liveModeEnabled: telephonyLiveMode,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert('Error updating telephony configuration');
    }
  };

  const handleExportCSV = (type: 'bookings' | 'impact') => {
    window.open(`/api/admin/export/${type}`, '_blank');
  };

  const confirmedStays = bookings.filter((b) => b.status === 'confirmed' || b.status === 'completed');
  const totalRevenue = confirmedStays.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#133926] text-amber-300 flex items-center justify-center font-serif text-2xl font-bold shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif text-stone-900">
                {t.adminTitle}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold uppercase">
                Govt & Tourism Partner Portal
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Audited Metrics, Telephony Gateway Settings & Rural Socio-Economic Impact
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleExportCSV('bookings')}
            className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 border border-stone-300 shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Bookings CSV</span>
          </button>

          <button
            onClick={() => handleExportCSV('impact')}
            className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition flex items-center gap-1.5 border border-stone-300 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#c25e3e]" />
            <span>Rural Revenue CSV</span>
          </button>

          <button
            onClick={onResetDemo}
            className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Reset demonstration state safely"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-stone-400 text-xs block">{t.totalListings}</span>
          <span className="text-2xl font-black text-stone-900 font-mono mt-0.5 block">
            {homestays.length}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold">100% Field Inspected</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-stone-400 text-xs block">{t.activeBookings}</span>
          <span className="text-2xl font-black text-amber-600 font-mono mt-0.5 block">
            {bookings.length}
          </span>
          <span className="text-[10px] text-stone-500">Inquiry & Confirmed Queue</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-stone-400 text-xs block">SmartCall Response Rate</span>
          <span className="text-2xl font-black text-emerald-800 font-mono mt-0.5 block">
            {metrics?.hostResponseRate || 94}%
          </span>
          <span className="text-[10px] text-stone-500">Keypad Phone Pickup Rate</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-stone-400 text-xs block">{t.communityRevenue}</span>
          <span className="text-2xl font-black text-[#133926] font-mono mt-0.5 block">
            ₹{totalRevenue}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold">Direct to Indigenous Families</span>
        </div>
      </div>

      {/* Grid: Telephony Gateway & Listings Review */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Telephony Configuration (Exotel / Indian Telecom Adapter) */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-700" />
              {t.telephonyConfig} (Exotel Integration)
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                telephonyLiveMode
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}
            >
              {telephonyLiveMode ? 'LIVE TELEPHONY' : 'SIMULATION MODE'}
            </span>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            SETUVANA connects with Indian telecom providers (e.g. Exotel) to dispatch automated voice calls and DLT-registered SMS templates to ordinary keypad mobile phones.
          </p>

          {saveSuccess && (
            <div className="bg-emerald-50 text-emerald-900 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Telephony gateway configuration updated.</span>
            </div>
          )}

          <form onSubmit={handleSaveTelephonyConfig} className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
              <div>
                <strong className="text-stone-800 block text-xs">Enable Live Outbound Telephony</strong>
                <span className="text-[11px] text-stone-500">
                  Switch from simulated keypad calls to live phone dialing via Exotel API
                </span>
              </div>
              <input
                type="checkbox"
                checked={telephonyLiveMode}
                onChange={(e) => setTelephonyLiveMode(e.target.checked)}
                className="h-5 w-5 text-emerald-700 rounded"
              />
            </div>

            <div>
              <label className="block text-stone-600 font-bold mb-1">Account SID / Account ID</label>
              <input
                type="text"
                value={accountSid}
                onChange={(e) => setAccountSid(e.target.value)}
                className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-600 font-bold mb-1">API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-bold mb-1">Virtual Caller ID</label>
                <input
                  type="text"
                  value={virtualNumber}
                  onChange={(e) => setVirtualNumber(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50 font-mono text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#133926] hover:bg-[#0e2a1c] text-white font-bold rounded-lg transition text-xs"
            >
              Save Telephony Settings
            </button>
          </form>
        </div>

        {/* Listings Readiness & Passports Review */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              Verified Homestay Readiness Review
            </h3>
            <span className="text-xs text-stone-400">Total: {homestays.length}</span>
          </div>

          <div className="space-y-2.5 max-h-[290px] overflow-y-auto text-xs">
            {homestays.map((h) => (
              <div
                key={h.id}
                className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3"
              >
                <div>
                  <strong className="text-stone-900 block text-xs">{h.name}</strong>
                  <span className="text-stone-500 text-[11px]">
                    {h.village}, {h.district} • Host: {h.hostName} ({h.hostPhone})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-800 text-xs bg-emerald-100 px-2 py-0.5 rounded">
                    {h.bookabilityScore}%
                  </span>
                  <button
                    onClick={() => onOpenBookabilityPassport(h)}
                    className="px-2.5 py-1 rounded bg-[#133926] text-white font-semibold text-[11px] hover:bg-[#0e2a1c]"
                  >
                    Audit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Trail Log */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-900 font-serif flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              {t.auditTrail} (System Ledger)
            </h3>
            <p className="text-xs text-stone-500">
              Immutable ledger of all booking submissions, confirmations, coordinator manual edits, and telemetry updates
            </p>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 text-xs font-mono">
          {auditLogs.length === 0 ? (
            <div className="p-4 text-center text-stone-400">No audit logs recorded yet.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="p-3 flex items-start justify-between gap-4 hover:bg-stone-50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#c25e3e]">{log.action}</span>
                    <span className="text-[10px] text-stone-400">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span className="text-[10px] bg-stone-100 px-1.5 py-0.2 rounded text-stone-700 font-semibold">
                      {log.actorRole}: {log.actorName}
                    </span>
                  </div>
                  <p className="text-stone-700 text-[11px] font-sans">{log.details}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
