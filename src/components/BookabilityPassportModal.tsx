/**
 * SETUVANA - Bookability Passport & Field Verification Breakdown
 * Transparent trust framework auditing rural homestay readiness
 */

import React from 'react';
import { Homestay, BookabilityPassport, Language } from '../types';
import { translations } from '../translations';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  UserCheck,
  Droplet,
  PhoneCall,
  X,
  FileCheck2,
} from 'lucide-react';

interface BookabilityPassportModalProps {
  currentLanguage: Language;
  isOpen: boolean;
  onClose: () => void;
  homestay: Homestay | null;
  passport: BookabilityPassport | null;
}

export const BookabilityPassportModal: React.FC<BookabilityPassportModalProps> = ({
  currentLanguage,
  isOpen,
  onClose,
  homestay,
  passport,
}) => {
  const t = translations[currentLanguage];

  if (!isOpen || !homestay) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#faf8f5] text-stone-900 rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#133926] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-900 text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">{t.bookabilityScore}</h2>
              <p className="text-xs text-emerald-200/80">
                Transparent Rural Homestay Readiness & Verification
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-emerald-900 text-stone-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Passport Score Banner */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 flex items-center justify-between shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-stone-900">{homestay.name}</h3>
              <p className="text-stone-500 text-[11px]">
                {homestay.village}, {homestay.district}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Field Verified by District Coordinator</span>
              </div>
            </div>

            <div className="text-center bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
              <span className="text-2xl font-black text-emerald-800 font-mono">
                {homestay.bookabilityScore}%
              </span>
              <span className="block text-[9px] uppercase tracking-wider text-emerald-600 font-bold">
                Readiness Score
              </span>
            </div>
          </div>

          {/* Audit Verification Checkpoints */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2.5 shadow-xs">
            <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-500 mb-2">
              Verified Readiness Checkpoints
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-200">
                <span className="flex items-center gap-2 text-stone-700">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Host Identity & Village Authorization
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Checked
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-200">
                <span className="flex items-center gap-2 text-stone-700">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  Keypad Phone SmartCall Connectivity
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> BSNL/Jio Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-200">
                <span className="flex items-center gap-2 text-stone-700">
                  <Droplet className="w-4 h-4 text-emerald-600" />
                  Drinking Water Purity & Sanitation
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lab Tested
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-stone-50 border border-stone-200">
                <span className="flex items-center gap-2 text-stone-700">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Physical Room & Bed Quality Inspection
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Inspected
                </span>
              </div>
            </div>
          </div>

          {/* Inspection Metadata */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-[11px] text-stone-600 space-y-1">
            <div className="flex justify-between">
              <span>Last Inspected By:</span>
              <strong className="text-stone-800">{homestay.coordinatorName} (Coordinator)</strong>
            </div>
            <div className="flex justify-between">
              <span>Last Verified Date:</span>
              <strong className="text-stone-800">{homestay.lastVerifiedDate}</strong>
            </div>
            <div className="flex justify-between">
              <span>Host Keypad Number:</span>
              <span className="font-mono text-stone-800">{homestay.hostPhone}</span>
            </div>
          </div>

          {/* Coordinator Notes */}
          {passport?.notes && (
            <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 text-xs text-amber-900">
              <span className="font-bold block mb-1">Coordinator Field Inspection Log:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                {passport.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
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
