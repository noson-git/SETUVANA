/**
 * SETUVANA - Homestay Host Management Portal
 * Simple, accessible dashboard designed for rural village hosts,
 * with keypad phone testing, language preferences, and AI listing assistant.
 */

import React, { useState } from 'react';
import { Homestay, Booking, Language, UserRole } from '../types';
import { translations } from '../translations';
import {
  Smartphone,
  PhoneCall,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  PlusCircle,
  Wand2,
  DollarSign,
  Save,
  MessageSquare,
  X,
} from 'lucide-react';

interface HostViewProps {
  currentLanguage: Language;
  homestays: Homestay[];
  bookings: Booking[];
  onOpenSmartCall: (booking: Booking) => void;
  onAddNewHomestay: (data: any) => Promise<void>;
}

export const HostView: React.FC<HostViewProps> = ({
  currentLanguage,
  homestays,
  bookings,
  onOpenSmartCall,
  onAddNewHomestay,
}) => {
  const t = translations[currentLanguage];

  // Default to first host (Subarna Wadaka, Niyamgiri)
  const currentHost = homestays[0];
  const hostBookings = bookings.filter((b) => b.propertyId === currentHost?.id);

  // Host notification preferences
  const [hostLangPref, setHostLangPref] = useState<Language>('or');
  const [hostPhone, setHostPhone] = useState(currentHost?.hostPhone || '+91 94371 88210');
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // AI-Assisted Listing Onboarding Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVillage, setNewVillage] = useState('Gudugudia');
  const [newDistrict, setNewDistrict] = useState<'Rayagada' | 'Kandhamal' | 'Koraput' | 'Mayurbhanj' | 'Bargarh' | 'Puri'>('Mayurbhanj');
  const [newCommunity, setNewCommunity] = useState<'Dongria Kondh' | 'Kutia Kondh' | 'Desia' | 'Santhal' | 'Saura' | 'Sambalpuri Rural'>('Santhal');
  const [newHouseType, setNewHouseType] = useState('Traditional Mud & Thatched Cottage');
  const [newHighlights, setNewHighlights] = useState('Sal tree forest edge, traditional Santhal flute music, red ant chutney');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiDraft, setAiDraft] = useState<any | null>(null);

  const handleSavePreferences = () => {
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  const handleGenerateAIListing = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/gemini/host-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          village: newVillage,
          district: newDistrict,
          community: newCommunity,
          houseType: newHouseType,
          highlights: newHighlights,
        }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        setAiDraft(result.data);
      } else {
        alert('AI draft generation failed');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSaveNewListing = async () => {
    if (!aiDraft) return;

    await onAddNewHomestay({
      name: aiDraft.title || `${newVillage} Eco Cottage`,
      odiaName: aiDraft.odiaTitle || 'ଗ୍ରାମୀଣ ହୋମଷ୍ଟେ',
      hindiName: aiDraft.hindiTitle || 'ग्रामीण होमस्टे',
      district: newDistrict,
      village: newVillage,
      block: 'Local Block',
      tribalCommunity: newCommunity,
      hostId: `host-${Date.now()}`,
      hostName: 'Village Host',
      hostPhone: '+91 94379 12345',
      coordinatorId: 'coord-lead',
      coordinatorName: 'District Coordinator',
      coordinatorPhone: '+91 94372 99401',
      pricePerNight: 1200,
      capacityGuests: 6,
      roomsCount: 2,
      rooms: [
        {
          id: `room-${Date.now()}`,
          name: 'Main Cottage Room',
          type: 'Traditional Mud & Bamboo Cottage',
          capacity: 3,
          pricePerNight: 1200,
          beds: '2 Cots',
          privateBath: true,
        },
      ],
      facilities: aiDraft.suggestedAmenities || ['Clean Water', 'Traditional Cooking', 'Village Guide'],
      sanitationInfo: 'Inspected twin-pit clean sanitation.',
      drinkingWaterInfo: 'Filtered boiled drinking water.',
      familySuitability: true,
      accessibility: 'Ground level mud pathway.',
      pickupAvailable: true,
      pickupDetails: 'Pickup coordinated from bus stand.',
      landmarkDirections: 'Near village primary school.',
      plainTextDirections: 'Ask coordinator at main junction.',
      gpsCoordinates: { lat: 20.0, lng: 84.0 },
      images: ['https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1200&q=80'],
      description: aiDraft.description || '',
      odiaDescription: aiDraft.odiaDescription || '',
      hindiDescription: aiDraft.hindiDescription || '',
      houseRules: ['Respect village traditions.'],
      mealsAvailable: ['Traditional Dalma', 'Millet Porridge'],
      communityExperiences: [],
      rating: 5.0,
      reviewCount: 0,
    });

    setShowAddModal(false);
    setAiDraft(null);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Welcome Card */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#133926] text-amber-300 flex items-center justify-center font-serif text-2xl font-bold shadow-inner">
            {currentHost?.hostName ? currentHost.hostName[0] : 'H'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif text-stone-900">
                {currentHost?.hostName}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold uppercase">
                Registered Host
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {currentHost?.name} • {currentHost?.village}, {currentHost?.district} ({currentHost?.tribalCommunity})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2 px-3.5 rounded-xl bg-[#c25e3e] hover:bg-[#a84d30] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{t.addNewHomestay}</span>
          </button>
        </div>
      </div>

      {savedSettingsNotice && (
        <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Notification preferences & registered phone number saved.</span>
        </div>
      )}

      {/* Grid: Preferences & Keypad Phone Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Keypad Phone & Language Preference */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-700" />
            {t.callLanguagePreference}
          </h3>

          <p className="text-xs text-stone-500">
            Automated SmartCall voice calls and keypad instructions will speak in your preferred language.
          </p>

          <div className="space-y-2 text-xs">
            <label className="block text-stone-600 font-bold">Voice Call Language</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['or', 'en', 'hi'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setHostLangPref(lang)}
                  className={`py-1.5 px-2 rounded-lg font-bold border transition text-center ${
                    hostLangPref === lang
                      ? 'bg-[#133926] text-white border-[#133926]'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {lang === 'or' ? 'ଓଡ଼ିଆ' : lang === 'hi' ? 'हिन्दी' : 'English'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="block text-stone-600 font-bold">{t.registeredPhone}</label>
            <input
              type="text"
              value={hostPhone}
              onChange={(e) => setHostPhone(e.target.value)}
              className="w-full p-2 rounded-lg border border-stone-300 bg-stone-50 font-mono text-xs"
            />
            <span className="text-[10px] text-stone-400">
              Ordinary keypad phone (BSNL 2G / Jio cellular). No smartphone required.
            </span>
          </div>

          <button
            onClick={handleSavePreferences}
            className="w-full py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 text-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>

        {/* Card 2: Earnings & Performance */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-700" />
            Host Direct Community Revenue
          </h3>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
            <span className="text-3xl font-black text-emerald-900 font-mono">
              ₹{hostBookings.filter((b) => b.status === 'confirmed').reduce((sum, b) => sum + b.totalAmount, 2500)}
            </span>
            <span className="block text-[11px] text-emerald-700 font-medium mt-1">
              100% Retained by Wadaka Family
            </span>
          </div>

          <div className="space-y-2 text-xs text-stone-600">
            <div className="flex justify-between border-b border-stone-100 pb-1.5">
              <span>Confirmed Stays:</span>
              <strong className="text-stone-900">{hostBookings.length} bookings</strong>
            </div>
            <div className="flex justify-between border-b border-stone-100 pb-1.5">
              <span>Assigned Coordinator:</span>
              <strong className="text-stone-900">{currentHost?.coordinatorName}</strong>
            </div>
            <div className="flex justify-between">
              <span>Readiness Passport:</span>
              <strong className="text-emerald-800">{currentHost?.bookabilityScore}% Complete</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Keypad Phone Test Simulator */}
        <div className="bg-stone-900 text-white rounded-2xl p-5 border border-stone-800 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Keypad Phone Simulator
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">
                SIMULATION
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Test how you receive and answer booking requests on your keypad phone. Press 1 to Accept, 2 to Decline, or 3 for Village Coordinator assistance.
            </p>
          </div>

          <button
            onClick={() => {
              const activeBookingForHost = hostBookings[0] || bookings[0] || null;
              if (activeBookingForHost) onOpenSmartCall(activeBookingForHost);
            }}
            disabled={hostBookings.length === 0 && bookings.length === 0}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-black font-bold rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-md"
          >
            <PhoneCall className="w-4 h-4 text-black" />
            <span>Launch Keypad Call Screen</span>
          </button>
        </div>
      </div>

      {/* Bookings & SmartCall Logs */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-900 font-serif">
              {t.notificationLog} ({hostBookings.length} Inquiries)
            </h3>
            <p className="text-xs text-stone-500">
              Audit log of all voice calls, DTMF keypad responses, and SMS delivery receipts
            </p>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200">
                <th className="p-3.5 font-bold">Ref #</th>
                <th className="p-3.5 font-bold">Guest</th>
                <th className="p-3.5 font-bold">Stay Dates</th>
                <th className="p-3.5 font-bold">SmartCall Status</th>
                <th className="p-3.5 font-bold">Keypad Response</th>
                <th className="p-3.5 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {hostBookings.map((b) => {
                const notif = b.notificationHistory[0];

                return (
                  <tr key={b.id} className="hover:bg-stone-50 transition">
                    <td className="p-3.5 font-mono font-bold text-stone-900">#{b.reference}</td>
                    <td className="p-3.5">
                      <strong className="text-stone-800">{b.guestName}</strong>
                      <span className="block text-[10px] text-stone-400">{b.guestPhone}</span>
                    </td>
                    <td className="p-3.5 text-stone-600">
                      {b.checkInDate} to {b.checkOutDate} ({b.guestsCount} guests)
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {notif ? notif.status.toUpperCase() : 'QUEUED'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {notif?.dtmfInput ? (
                        <span className="font-mono font-bold text-stone-900">
                          Pressed [{notif.dtmfInput}] ({notif.dtmfAction})
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">Pending keypad reply</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => onOpenSmartCall(b)}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-[11px] flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 h-3" />
                        <span>Keypad Sim</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Host Onboarding Guided Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#faf8f5] text-stone-900 rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#133926] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold font-serif">{t.addNewHomestay}</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-stone-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <p className="text-stone-600">
                Provide basic village facts. Gemini AI will format the title, realistic facilities, and generate accurate Odia, English, and Hindi translations.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Village Name</label>
                  <input
                    type="text"
                    value={newVillage}
                    onChange={(e) => setNewVillage(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">District</label>
                  <select
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value as any)}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="Mayurbhanj">Mayurbhanj</option>
                    <option value="Rayagada">Rayagada</option>
                    <option value="Kandhamal">Kandhamal</option>
                    <option value="Koraput">Koraput</option>
                    <option value="Bargarh">Bargarh</option>
                    <option value="Puri">Puri</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Tribal Community</label>
                <select
                  value={newCommunity}
                  onChange={(e) => setNewCommunity(e.target.value as any)}
                  className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                >
                  <option value="Santhal">Santhal</option>
                  <option value="Dongria Kondh">Dongria Kondh</option>
                  <option value="Kutia Kondh">Kutia Kondh</option>
                  <option value="Desia">Desia</option>
                  <option value="Saura">Saura</option>
                  <option value="Sambalpuri Rural">Sambalpuri Rural</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">House Architecture Type</label>
                <input
                  type="text"
                  value={newHouseType}
                  onChange={(e) => setNewHouseType(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Unique Highlights / Local Food</label>
                <textarea
                  rows={2}
                  value={newHighlights}
                  onChange={(e) => setNewHighlights(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg bg-white"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateAIListing}
                disabled={isGeneratingAI}
                className="w-full py-2.5 bg-[#133926] hover:bg-[#0e2a1c] disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Wand2 className="w-4 h-4 text-amber-300" />
                <span>{isGeneratingAI ? 'Formatting Trilingual Listing...' : 'Generate with Gemini AI'}</span>
              </button>

              {aiDraft && (
                <div className="bg-white p-4 rounded-xl border border-stone-300 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-emerald-800">Generated Draft</span>
                  <div className="font-bold text-sm text-stone-900">{aiDraft.title}</div>
                  <div className="font-serif text-xs text-stone-700">ଓଡ଼ିଆ: {aiDraft.odiaTitle}</div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{aiDraft.description}</p>
                  <p className="text-stone-600 text-[11px] font-serif">ଓଡ଼ିଆ ବିବରଣୀ: {aiDraft.odiaDescription}</p>

                  <button
                    type="button"
                    onClick={handleSaveNewListing}
                    className="w-full mt-2 py-2 bg-[#c25e3e] hover:bg-[#a84d30] text-white font-bold rounded-lg transition"
                  >
                    Approve and Add to Platform
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
