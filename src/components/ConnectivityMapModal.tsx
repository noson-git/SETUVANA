/**
 * SETUVANA - Crowdsourced Rural Connectivity Observation Map & Reporter
 * Real-time signal intelligence across remote Odisha districts (Rayagada, Kandhamal, Koraput, Mayurbhanj)
 */

import React, { useState } from 'react';
import { ConnectivityObservation, Language } from '../types';
import { translations } from '../translations';
import {
  MapPin,
  Radio,
  PlusCircle,
  X,
  CheckCircle2,
  AlertTriangle,
  Send,
  Signal,
  Clock,
} from 'lucide-react';

interface ConnectivityMapModalProps {
  currentLanguage: Language;
  isOpen: boolean;
  onClose: () => void;
  observations: ConnectivityObservation[];
  onAddObservation: (obs: any) => Promise<void>;
}

export const ConnectivityMapModal: React.FC<ConnectivityMapModalProps> = ({
  currentLanguage,
  isOpen,
  onClose,
  observations,
  onAddObservation,
}) => {
  const t = translations[currentLanguage];

  const [showReportForm, setShowReportForm] = useState(false);
  const [district, setDistrict] = useState('Rayagada');
  const [village, setVillage] = useState('');
  const [operator, setOperator] = useState<'BSNL' | 'Jio' | 'Airtel' | 'Vi'>('BSNL');
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [smsAvailable, setSmsAvailable] = useState(true);
  const [dataQuality, setDataQuality] = useState<'none' | '2g_edge' | '4g_weak' | '4g_good'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!village.trim()) return;

    setIsSubmitting(true);
    await onAddObservation({
      district,
      village,
      operator,
      voiceAvailable,
      smsAvailable,
      dataQuality,
      latitude: district === 'Rayagada' ? 19.51 : district === 'Kandhamal' ? 19.9 : 18.67,
      longitude: district === 'Rayagada' ? 83.51 : district === 'Kandhamal' ? 84.13 : 82.98,
      reporterRole: 'Volunteer Contributor',
    });

    setIsSubmitting(false);
    setShowReportForm(false);
    setVillage('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#faf8f5] text-stone-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#133926] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-900 text-amber-300">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">{t.navConnectivityMap}</h2>
              <p className="text-xs text-emerald-200/80">
                Crowdsourced Odisha Rural Signal Intelligence
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-emerald-900 text-stone-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-amber-100 text-amber-900 px-5 py-2.5 text-[11px] border-b border-amber-300 flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Crowdsourced observation map: observations represent actual field reports submitted by coordinators and travellers. They are not guaranteed telecom coverage maps.
          </span>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-300 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Thank you! Your signal observation was recorded to help rural travellers.</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex items-center justify-between">
            <span className="text-stone-500 font-bold uppercase tracking-wider text-[11px]">
              Latest Village Network Observations ({observations.length})
            </span>
            <button
              onClick={() => setShowReportForm(!showReportForm)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#133926] hover:bg-[#0e2a1c] text-white flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>{showReportForm ? 'Cancel' : 'Report Signal in Your Village'}</span>
            </button>
          </div>

          {/* Volunteer Report Form */}
          {showReportForm && (
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-stone-300 shadow-sm space-y-3">
              <h4 className="font-bold text-stone-900">Volunteer a Network Signal Report</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 text-[11px] font-semibold mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                  >
                    <option value="Rayagada">Rayagada</option>
                    <option value="Kandhamal">Kandhamal</option>
                    <option value="Koraput">Koraput</option>
                    <option value="Mayurbhanj">Mayurbhanj</option>
                    <option value="Bargarh">Bargarh</option>
                    <option value="Puri">Puri</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 text-[11px] font-semibold mb-1">Village / Landmark</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kurli Village, near school"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-600 text-[11px] font-semibold mb-1">Telecom Operator</label>
                  <select
                    value={operator}
                    onChange={(e) => setOperator(e.target.value as any)}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                  >
                    <option value="BSNL">BSNL</option>
                    <option value="Jio">Reliance Jio</option>
                    <option value="Airtel">Bharti Airtel</option>
                    <option value="Vi">Vodafone Idea</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-600 text-[11px] font-semibold mb-1">Mobile Data Quality</label>
                  <select
                    value={dataQuality}
                    onChange={(e) => setDataQuality(e.target.value as any)}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                  >
                    <option value="none">No Internet / Zero Data</option>
                    <option value="2g_edge">2G / EDGE (Voice/SMS only)</option>
                    <option value="4g_weak">4G Weak (1-2 bars)</option>
                    <option value="4g_good">4G Strong</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={voiceAvailable}
                    onChange={(e) => setVoiceAvailable(e.target.checked)}
                    className="rounded text-emerald-700"
                  />
                  <span>Voice Calling Working</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={smsAvailable}
                    onChange={(e) => setSmsAvailable(e.target.checked)}
                    className="rounded text-emerald-700"
                  />
                  <span>SMS Working</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 bg-[#c25e3e] hover:bg-[#a84d30] text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Recording...' : 'Submit Observation'}</span>
              </button>
            </form>
          )}

          {/* Observations List */}
          <div className="space-y-2.5">
            {observations.map((obs) => (
              <div
                key={obs.id}
                className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#c25e3e]" />
                    <span className="font-bold text-stone-900 text-sm">{obs.village}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
                      {obs.district}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-600">
                    <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {obs.operator}
                    </span>
                    <span>Voice: {obs.voiceAvailable ? '✓ Yes' : '✗ No'}</span>
                    <span>•</span>
                    <span>SMS: {obs.smsAvailable ? '✓ Yes' : '✗ No'}</span>
                    <span>•</span>
                    <span className={obs.dataQuality === 'none' ? 'text-red-600 font-bold' : 'text-stone-700'}>
                      Data: {obs.dataQuality.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-stone-400">
                  <span className="block">{new Date(obs.reportedAt).toLocaleDateString()}</span>
                  <span className="block text-stone-500 font-medium">By {obs.reporterRole}</span>
                </div>
              </div>
            ))}
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
