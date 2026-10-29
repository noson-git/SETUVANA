/**
 * SETUVANA - Traveller View
 * Authentic Homestay Discovery, Resilient Booking Flow, Offline Caching
 */

import React, { useState, useMemo } from 'react';
import { Homestay, Booking, Language, ConnectivityMode, Room, DestinationAttraction } from '../types';
import { translations } from '../translations';
import { ODISHA_IMAGES } from '../assets/images';
import { ODISHA_DESTINATIONS } from '../data/destinationsData';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle,
  Download,
  Phone,
  Droplet,
  Compass,
  ArrowRight,
  X,
  FileCheck,
  AlertTriangle,
  Heart,
  Share2,
  Mountain,
  Coffee,
  Trees,
  Waves,
  Sparkles,
  Info,
  Check,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { idbSaveBooking } from '../services/db';

interface TravellerViewProps {
  currentLanguage: Language;
  homestays: Homestay[];
  bookings: Booking[];
  connectivityMode: ConnectivityMode;
  lowDataMode: boolean;
  onOpenBookingDetails: (booking: Booking) => void;
  onOpenArrivalPack: (booking: Booking, homestay: Homestay) => void;
  onOpenGoogleCalendar: (booking: Booking) => void;
  onOpenSmartCall: (booking: Booking) => void;
  onOpenBookabilityPassport: (homestay: Homestay) => void;
  onSubmitBookingRequest: (bookingData: any) => Promise<Booking | null>;
  isBookingsDrawerOpen: boolean;
  setIsBookingsDrawerOpen: (open: boolean) => void;
}

export const TravellerView: React.FC<TravellerViewProps> = ({
  currentLanguage,
  homestays,
  bookings,
  connectivityMode,
  lowDataMode,
  onOpenBookingDetails,
  onOpenArrivalPack,
  onOpenGoogleCalendar,
  onOpenSmartCall,
  onOpenBookabilityPassport,
  onSubmitBookingRequest,
  isBookingsDrawerOpen,
  setIsBookingsDrawerOpen,
}) => {
  const t = translations[currentLanguage];

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [checkInDate, setCheckInDate] = useState<string>('2026-11-14');
  const [checkOutDate, setCheckOutDate] = useState<string>('2026-11-16');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);
  const [filterPickupOnly, setFilterPickupOnly] = useState<boolean>(false);
  const [filterCleanWaterOnly, setFilterCleanWaterOnly] = useState<boolean>(false);

  // Active Detail / Booking Modals
  const [selectedHomestay, setSelectedHomestay] = useState<Homestay | null>(null);
  const [bookingHomestay, setBookingHomestay] = useState<Homestay | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Destination Explorer State
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedAttraction, setSelectedAttraction] = useState<DestinationAttraction | null>(null);
  const [activeDestinationNotice, setActiveDestinationNotice] = useState<string | null>(null);

  // Filtered Destinations for the Explorer
  const filteredDestinations = useMemo(() => {
    if (selectedRegion === 'all') return ODISHA_DESTINATIONS;
    return ODISHA_DESTINATIONS.filter((d) => d.region === selectedRegion);
  }, [selectedRegion]);

  const handleSelectDestinationFilter = (destination: DestinationAttraction) => {
    setSelectedDistrict(destination.district);
    setActiveDestinationNotice(`Filtered village homestays near ${destination.name} (${destination.district})`);
    const elem = document.getElementById('homestays-section');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Booking Form Inputs
  const [guestName, setGuestName] = useState('Rahul Mohapatra');
  const [guestPhone, setGuestPhone] = useState('+91 98610 23456');
  const [guestEmail, setGuestEmail] = useState('rahul.mohapatra@example.com');
  const [arrivalTime, setArrivalTime] = useState('3:30 PM');
  const [pickupNeeded, setPickupNeeded] = useState(true);
  const [specialRequests, setSpecialRequests] = useState('Traditional vegetarian dalma & ragi jau preferred');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  // Filtered homestays
  const filteredHomestays = useMemo(() => {
    return homestays.filter((h) => {
      if (selectedDistrict !== 'all' && h.district !== selectedDistrict) return false;
      if (h.pricePerNight > maxPrice) return false;
      if (h.capacityGuests < guestCount) return false;
      if (filterVerifiedOnly && h.verificationStatus !== 'verified_field_visit') return false;
      if (filterPickupOnly && !h.pickupAvailable) return false;
      if (filterCleanWaterOnly && !h.drinkingWaterInfo.toLowerCase().includes('filter')) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = h.name.toLowerCase().includes(query) || h.odiaName.includes(query) || h.hindiName.includes(query);
        const matchVillage = h.village.toLowerCase().includes(query);
        const matchTribe = h.tribalCommunity.toLowerCase().includes(query);
        const matchDistrict = h.district.toLowerCase().includes(query);
        if (!matchName && !matchVillage && !matchTribe && !matchDistrict) return false;
      }
      return true;
    });
  }, [
    homestays,
    selectedDistrict,
    maxPrice,
    guestCount,
    filterVerifiedOnly,
    filterPickupOnly,
    filterCleanWaterOnly,
    searchQuery,
  ]);

  const handleStartBooking = (homestay: Homestay) => {
    setBookingHomestay(homestay);
    setSelectedRoom(homestay.rooms[0] || null);
    setSelectedHomestay(null);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingHomestay || !selectedRoom) return;

    setIsSubmitting(true);
    const bookingPayload = {
      propertyId: bookingHomestay.id,
      roomId: selectedRoom.id,
      guestName,
      guestPhone,
      guestEmail,
      checkInDate,
      checkOutDate,
      estimatedArrivalTime: arrivalTime,
      guestsCount: guestCount,
      pickupRequested: pickupNeeded,
      specialRequests,
      preferredLanguage: currentLanguage,
      idempotencyKey: `idem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };

    if (connectivityMode === 'offline') {
      // Offline rule: Save locally in IndexedDB with pending status
      const offlineBooking: Booking = {
        id: `bk-off-${Date.now()}`,
        reference: Math.floor(1000 + Math.random() * 9000).toString(),
        propertyId: bookingHomestay.id,
        propertyName: bookingHomestay.name,
        propertyVillage: bookingHomestay.village,
        propertyDistrict: bookingHomestay.district,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        hostId: bookingHomestay.hostId,
        hostName: bookingHomestay.hostName,
        hostPhone: bookingHomestay.hostPhone,
        guestId: `guest-offline-${Date.now()}`,
        guestName,
        guestPhone,
        guestEmail,
        checkInDate,
        checkOutDate,
        estimatedArrivalTime: arrivalTime,
        guestsCount: Number(guestCount),
        totalAmount: selectedRoom.pricePerNight * 2,
        paymentMode: 'pay_at_homestay',
        status: 'saved_offline',
        syncStatus: 'saved_locally',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        idempotencyKey: bookingPayload.idempotencyKey,
        pickupRequested: pickupNeeded,
        specialRequests,
        notificationHistory: [],
      };

      await idbSaveBooking(offlineBooking);
      setBookingHomestay(null);
      setIsSubmitting(false);
      setOfflineNotice(
        'Saved on this device. This request has not yet reached the host. It will automatically submit once internet is restored.'
      );
      return;
    }

    try {
      const created = await onSubmitBookingRequest(bookingPayload);
      setIsSubmitting(false);
      setBookingHomestay(null);
      if (created) {
        onOpenSmartCall(created);
      }
    } catch (err: any) {
      alert('Error submitting booking: ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Offline Alert Banner */}
      {connectivityMode === 'offline' && (
        <div className="bg-stone-900 text-stone-100 p-4 rounded-2xl border border-stone-700 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-300">
                Operating in Offline Mode (Mode C)
              </h4>
              <p className="text-xs text-stone-300">
                Browsing cached Odisha homestays from IndexedDB. Booking drafts are saved safely on your device.
              </p>
            </div>
          </div>
        </div>
      )}

      {offlineNotice && (
        <div className="bg-amber-100 border-l-4 border-amber-600 p-4 rounded-xl text-amber-900 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{offlineNotice}</span>
          </div>
          <button onClick={() => setOfflineNotice(null)} className="text-amber-800 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-800 bg-stone-950 min-h-[380px] flex items-center">
        {/* AI-Generated Expansive Rural Odisha Landscape Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={ODISHA_IMAGES.heroLandscape}
            alt="Rural Odisha Landscape with traditional cottage, green rolling hills, red-earth paths and morning mist"
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Multi-layered gradient overlay for superior readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/95 via-[#133926]/85 to-stone-900/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/40" />
        </div>

        <div className="relative z-10 max-w-3xl p-6 sm:p-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-amber-300 border border-emerald-700/60 backdrop-blur-xs">
            <span>🌾 {t.tagline}</span>
            <span>•</span>
            <span>OSFIC Rural & Tribal Odisha Initiative</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif tracking-tight leading-tight text-[#faf8f5]">
            {currentLanguage === 'or'
              ? 'ପ୍ରକୃତିର ନିକଟତର ହୁଅନ୍ତୁ। ଓଡ଼ିଶା ସହିତ ସଂଯୋଗ ହୁଅନ୍ତୁ।'
              : currentLanguage === 'hi'
              ? 'प्रकृति के करीब रहें। ओडिशा से जुड़ें।'
              : 'Stay Closer to Nature. Connect with Odisha.'}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-sans max-w-2xl">
            {currentLanguage === 'or'
              ? 'ଗୋଷ୍ଠୀ-ପରିଚାଳିତ ହୋମଷ୍ଟେ, ସ୍ଥାନୀୟ ଅନୁଭୂତି ଏବଂ ଓଡ଼ିଶାର ଅନାବିଷ୍କୃତ ପ୍ରାକୃତିକ ସୌନ୍ଦର୍ଯ୍ୟ ଉପଭୋଗ କରନ୍ତୁ — ଗୋଟିଏ ଗ୍ରାମରୁ ଅନ୍ୟ ଏକ ଗ୍ରାମ।'
              : currentLanguage === 'hi'
              ? 'समुदाय-नेतृत्व वाले होमस्टे, स्थानीय अनुभवों और ओडिशा के अप्रतिम परिदृश्यों की खोज करें — एक समय में एक गांव।'
              : 'Discover community-led homestays, local experiences and the hidden landscapes of Odisha — one village at a time.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#destinations-section"
              className="px-4 py-2.5 rounded-xl bg-[#c25e3e] hover:bg-[#a84d30] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>{t.exploreOdisha}</span>
            </a>
            <a
              href="#homestays-section"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#faf8f5] border border-white/20 font-semibold text-xs backdrop-blur-xs transition flex items-center gap-1.5"
            >
              <span>{t.foundHomestays}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-emerald-200/90 font-medium">
            <span className="px-2.5 py-1 rounded-md bg-stone-900/60 border border-emerald-900/70">
              ☕ Daringbadi Coffee Hills
            </span>
            <span className="px-2.5 py-1 rounded-md bg-stone-900/60 border border-emerald-900/70">
              ⛰️ Deomali Mountain Peaks
            </span>
            <span className="px-2.5 py-1 rounded-md bg-stone-900/60 border border-emerald-900/70">
              🌿 Phulbani Forest Retreats
            </span>
            <span className="px-2.5 py-1 rounded-md bg-stone-900/60 border border-emerald-900/70">
              🐅 Similipal Sal Woods
            </span>
          </div>
        </div>
      </section>

      {/* Explore Odisha Destination Explorer Section */}
      <section id="destinations-section" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c25e3e] uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>{t.exploreOdisha}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
              {t.exploreOdisha} — Tribal & Highland Wonders
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              {t.exploreOdishaSubtitle}
            </p>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Showing {filteredDestinations.length} regional attractions
          </div>
        </div>

        {/* Region Filter Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { id: 'all', label: t.allRegions },
            { id: 'Daringbadi and Kandhamal', label: 'Daringbadi & Kandhamal' },
            { id: 'Koraput and Deomali', label: 'Koraput & Deomali' },
            { id: 'Phulbani', label: 'Phulbani & Central' },
            { id: 'Mayurbhanj and Baripada', label: 'Mayurbhanj & Similipal' },
          ].map((regionTab) => (
            <button
              key={regionTab.id}
              onClick={() => setSelectedRegion(regionTab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedRegion === regionTab.id
                  ? 'bg-[#133926] text-white shadow-xs'
                  : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
              }`}
            >
              {regionTab.label}
            </button>
          ))}
        </div>

        {/* Destination Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDestinations.map((dest) => {
            const destTitle =
              currentLanguage === 'or'
                ? dest.odiaName
                : currentLanguage === 'hi'
                ? dest.hindiName
                : dest.name;

            const destDesc =
              currentLanguage === 'or'
                ? dest.odiaDescription
                : dest.description;

            const getCategoryIcon = (cat: string) => {
              switch (cat) {
                case 'waterfall':
                  return <Waves className="w-3 h-3 text-cyan-600" />;
                case 'coffee_garden':
                  return <Coffee className="w-3 h-3 text-amber-600" />;
                case 'forest':
                  return <Trees className="w-3 h-3 text-emerald-600" />;
                case 'viewpoint':
                  return <Mountain className="w-3 h-3 text-indigo-600" />;
                default:
                  return <Sparkles className="w-3 h-3 text-orange-600" />;
              }
            };

            return (
              <div
                key={dest.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-40 overflow-hidden bg-stone-100">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/95 text-stone-800 shadow-xs backdrop-blur-xs flex items-center gap-1">
                        {getCategoryIcon(dest.category)}
                        <span className="capitalize">{dest.category.replace('_', ' ')}</span>
                      </span>
                    </div>

                    <div className="absolute bottom-2 right-2 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded">
                      {dest.district}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <h3 className="font-bold text-stone-900 text-sm font-serif line-clamp-1">
                      {destTitle}
                    </h3>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {destDesc}
                    </p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {dest.activities.slice(0, 2).map((act, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px]"
                        >
                          {act}
                        </span>
                      ))}
                    </div>

                    <div className="pt-1 text-[11px] text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-600" />
                      <span className="truncate">{dest.bestSeason}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 pt-0 space-y-1.5 border-t border-stone-100 mt-2">
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => setSelectedAttraction(dest)}
                      className="w-full py-1.5 rounded-xl text-xs font-semibold border border-stone-300 hover:bg-stone-50 text-stone-700 transition flex items-center justify-center gap-1"
                    >
                      <span>{t.viewDestination}</span>
                    </button>
                    <button
                      onClick={() => handleSelectDestinationFilter(dest)}
                      className="w-full py-1.5 rounded-xl text-xs font-bold bg-[#133926] hover:bg-[#0e2a1c] text-white transition flex items-center justify-center gap-1 shadow-xs"
                      title={`Filter homestays in ${dest.district}`}
                    >
                      <span>Find Stays</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Active Destination Filter Notice */}
      {activeDestinationNotice && (
        <div className="bg-[#faf3eb] border border-[#d4973b]/40 p-3.5 rounded-2xl flex items-center justify-between text-xs text-stone-800 shadow-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#c25e3e]" />
            <span className="font-semibold">{activeDestinationNotice}</span>
          </div>
          <button
            onClick={() => {
              setActiveDestinationNotice(null);
              setSelectedDistrict('all');
            }}
            className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-xs"
          >
            Show All Regions
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <section className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        {/* Top search row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs outline-none focus:ring-2 focus:ring-emerald-700 bg-stone-50"
            />
          </div>

          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setActiveDestinationNotice(null);
              }}
              className="w-full p-2 rounded-xl border border-stone-300 text-xs bg-stone-50 outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
            >
              <option value="all">{t.filterAllDistricts}</option>
              <option value="Rayagada">Rayagada (Niyamgiri)</option>
              <option value="Kandhamal">Kandhamal (Daringbadi & Phulbani)</option>
              <option value="Koraput">Koraput (Deomali Hills)</option>
              <option value="Mayurbhanj">Mayurbhanj (Similipal National Park)</option>
              <option value="Bargarh">Bargarh (Barpali Weavers)</option>
              <option value="Puri">Puri / Khordha (Mangalajodi)</option>
            </select>
          </div>

          <div>
            <select
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full p-2 rounded-xl border border-stone-300 text-xs bg-stone-50 outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
            >
              <option value={1}>1 Guest</option>
              <option value={2}>2 Guests (Standard)</option>
              <option value={3}>3 Guests</option>
              <option value={4}>4 Guests</option>
              <option value={6}>6 Guests (Family)</option>
              <option value={8}>8 Guests</option>
            </select>
          </div>
        </div>

        {/* Date, Price & Quality Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-stone-500 text-[11px]">{t.filterCheckIn}:</span>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none text-stone-800"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span className="text-stone-500 text-[11px]">{t.filterCheckOut}:</span>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="bg-transparent text-xs font-semibold outline-none text-stone-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-500 text-[11px]">{t.filterMaxPrice}: ₹{maxPrice}</span>
              <input
                type="range"
                min={800}
                max={2500}
                step={100}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-emerald-700"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
              <input
                type="checkbox"
                checked={filterVerifiedOnly}
                onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
                className="rounded text-emerald-700 focus:ring-emerald-600"
              />
              <span>{t.filterVerifiedOnly}</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
              <input
                type="checkbox"
                checked={filterPickupOnly}
                onChange={(e) => setFilterPickupOnly(e.target.checked)}
                className="rounded text-emerald-700 focus:ring-emerald-600"
              />
              <span>{t.filterPickupAvailable}</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer font-medium text-stone-700">
              <input
                type="checkbox"
                checked={filterCleanWaterOnly}
                onChange={(e) => setFilterCleanWaterOnly(e.target.checked)}
                className="rounded text-emerald-700 focus:ring-emerald-600"
              />
              <span>{t.filterCleanWater}</span>
            </label>

            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDistrict('all');
                setActiveDestinationNotice(null);
                setGuestCount(2);
                setMaxPrice(2000);
                setFilterVerifiedOnly(false);
                setFilterPickupOnly(false);
                setFilterCleanWaterOnly(false);
              }}
              className="text-stone-400 hover:text-stone-700 underline text-[11px]"
            >
              {t.filterReset}
            </button>
          </div>
        </div>
      </section>

      {/* Homestay Listings Grid */}
      <section id="homestays-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900">
              {filteredHomestays.length} {t.foundHomestays}
            </h2>
            <p className="text-xs text-stone-500">
              All prices paid directly to community hosts. Keypad phone automated booking enabled.
            </p>
          </div>
          <span className="text-xs text-stone-500 hidden sm:inline-block">
            {t.demoListingNotice}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHomestays.map((homestay) => {
            const displayName =
              currentLanguage === 'or'
                ? homestay.odiaName
                : currentLanguage === 'hi'
                ? homestay.hindiName
                : homestay.name;

            const displayDesc =
              currentLanguage === 'or'
                ? homestay.odiaDescription
                : currentLanguage === 'hi'
                ? homestay.hindiDescription
                : homestay.description;

            return (
              <div
                key={homestay.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Badges */}
                  {!lowDataMode && homestay.images.length > 0 ? (
                    <div className="relative h-52 overflow-hidden bg-stone-100">
                      <img
                        src={homestay.images[0]}
                        alt={homestay.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5">
                        <div className="flex flex-wrap gap-1.5 max-w-[80%]">
                          {/* Demo Listing Badge */}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950 shadow-xs flex items-center gap-1 border border-amber-300">
                            <Info className="w-3 h-3 text-stone-950" />
                            <span>{t.demoListingBadge}</span>
                          </span>

                          {/* Landscape Type Tag */}
                          {homestay.landscapeType && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#133926]/90 text-white backdrop-blur-xs shadow-xs border border-emerald-800">
                              {homestay.landscapeType}
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-900/85 text-stone-200 backdrop-blur-xs flex items-center gap-1 shadow-xs">
                            <ShieldCheck className="w-3 h-3 text-amber-300" />
                            {homestay.tribalCommunity}
                          </span>
                        </div>

                        <div className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                          {homestay.bookabilityScore}%
                        </div>
                      </div>

                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-900/80 text-amber-200 backdrop-blur-xs">
                          Host: {homestay.hostName}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-950 text-white flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400 text-stone-950 font-bold">
                          {t.demoListingBadge}
                        </span>
                        <span className="text-xs font-bold text-amber-300">{homestay.tribalCommunity}</span>
                      </div>
                      <span className="text-xs font-mono font-bold">Passport: {homestay.bookabilityScore}%</span>
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-[#c25e3e] shrink-0" />
                      <span className="font-medium text-stone-700">{homestay.village}, {homestay.district}</span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 font-serif leading-snug line-clamp-1">
                      {displayName}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {displayDesc}
                    </p>

                    <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1.5 text-[11px] text-stone-600">
                      <span className="px-2 py-0.5 rounded bg-stone-100 font-medium">
                        {homestay.capacityGuests} {t.guestsMax}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-stone-100 font-medium">
                        {homestay.roomsCount} Rooms
                      </span>
                      {homestay.pickupAvailable && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-medium">
                          Pickup Available
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {homestay.drinkingWaterInfo.includes('Filter') ? 'Filtered Water' : 'Boiled Spring'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Price & Actions */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div>
                      <span className="text-base font-black text-stone-900 font-mono">
                        ₹{homestay.pricePerNight}
                      </span>
                      <span className="text-stone-500 text-xs"> {t.perNight}</span>
                    </div>

                    <button
                      onClick={() => onOpenBookabilityPassport(homestay)}
                      className="text-[11px] text-emerald-800 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Passport
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedHomestay(homestay)}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold border border-stone-300 hover:bg-stone-50 text-stone-800 transition flex items-center justify-center gap-1"
                    >
                      <span>{t.exploreStay}</span>
                    </button>
                    <button
                      onClick={() => handleStartBooking(homestay)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#133926] hover:bg-[#0e2a1c] text-white transition flex items-center justify-center gap-1 shadow-xs"
                    >
                      <span>{t.bookNow}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Homestay Details Modal */}
      {selectedHomestay && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#faf8f5] text-stone-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#133926] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider">
                  {selectedHomestay.tribalCommunity} Homestay
                </span>
                <h3 className="text-lg font-bold font-serif">{selectedHomestay.name}</h3>
              </div>
              <button onClick={() => setSelectedHomestay(null)} className="p-1 hover:bg-emerald-900 rounded text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Photo carousel / gallery */}
              {!lowDataMode && selectedHomestay.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 h-48 rounded-xl overflow-hidden">
                  <img src={selectedHomestay.images[0]} alt="Property" className="w-full h-full object-cover" />
                  {selectedHomestay.images[1] ? (
                    <img src={selectedHomestay.images[1]} alt="Property 2" className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-stone-200 flex items-center justify-center text-stone-500">Village Living</div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-stone-900">About this Homestay</h4>
                <p className="text-stone-700 leading-relaxed text-xs">
                  {currentLanguage === 'or'
                    ? selectedHomestay.odiaDescription
                    : currentLanguage === 'hi'
                    ? selectedHomestay.hindiDescription
                    : selectedHomestay.description}
                </p>
              </div>

              {/* Available Rooms */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-500">
                  {t.roomsAvailable}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedHomestay.rooms.map((room) => (
                    <div key={room.id} className="p-3 rounded-xl bg-white border border-stone-200 space-y-1">
                      <div className="flex justify-between font-bold text-stone-800">
                        <span>{room.name}</span>
                        <span className="text-emerald-800 font-mono">₹{room.pricePerNight}</span>
                      </div>
                      <p className="text-[11px] text-stone-500">{room.type}</p>
                      <p className="text-[11px] text-stone-600">Capacity: {room.capacity} adults | {room.beds}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Water & Sanitation Breakdown */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 space-y-1.5">
                <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-emerald-700" />
                  Drinking Water & Sanitation Certification
                </h4>
                <p className="text-stone-700"><strong>Water:</strong> {selectedHomestay.drinkingWaterInfo}</p>
                <p className="text-stone-700"><strong>Sanitation:</strong> {selectedHomestay.sanitationInfo}</p>
              </div>

              {/* Plain text offline directions */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1.5">
                <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#c25e3e]" />
                  {t.directionsOffline}
                </h4>
                <pre className="text-stone-700 font-sans text-xs bg-stone-50 p-3 rounded-lg border border-stone-200 whitespace-pre-wrap leading-relaxed">
                  {selectedHomestay.plainTextDirections}
                </pre>
              </div>

              {/* Community Experiences */}
              {selectedHomestay.communityExperiences.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-500">
                    {t.communityExperiences}
                  </h4>
                  <div className="space-y-2">
                    {selectedHomestay.communityExperiences.map((exp) => (
                      <div key={exp.id} className="p-3 rounded-xl bg-white border border-stone-200 flex justify-between items-center">
                        <div>
                          <strong className="text-stone-900 text-xs">{exp.title}</strong>
                          <p className="text-stone-500 text-[11px]">{exp.description}</p>
                        </div>
                        <span className="font-mono font-bold text-emerald-800 text-xs ml-3">₹{exp.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Discover Nearby Section */}
              <div className="pt-2 border-t border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm flex items-center gap-1.5 font-serif">
                      <Compass className="w-4 h-4 text-[#c25e3e]" />
                      <span>{t.discoverNearby}</span>
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {t.discoverNearbySubtitle} in {selectedHomestay.district}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {selectedHomestay.district}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ODISHA_DESTINATIONS.filter((d) => 
                    selectedHomestay.nearbyAttractionIds?.includes(d.id) || d.district === selectedHomestay.district
                  ).slice(0, 4).map((attraction) => {
                    const attractionName =
                      currentLanguage === 'or'
                        ? attraction.odiaName
                        : currentLanguage === 'hi'
                        ? attraction.hindiName
                        : attraction.name;

                    return (
                      <div
                        key={attraction.id}
                        className="p-2.5 rounded-xl bg-white border border-stone-200 hover:border-emerald-700/50 transition shadow-2xs flex gap-2.5 items-start cursor-pointer group"
                        onClick={() => setSelectedAttraction(attraction)}
                      >
                        <img
                          src={attraction.image}
                          alt={attraction.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 group-hover:scale-105 transition"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-stone-900 text-xs truncate group-hover:text-emerald-900">
                              {attractionName}
                            </span>
                          </div>
                          <span className="inline-block text-[10px] font-semibold text-[#c25e3e] uppercase">
                            {attraction.category.replace('_', ' ')}
                          </span>
                          <p className="text-[10px] text-stone-500 line-clamp-1">
                            {attraction.approxDistanceNote}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-base font-black text-stone-900 font-mono">₹{selectedHomestay.pricePerNight}</span>
                <span className="text-stone-500 text-xs"> {t.perNight}</span>
              </div>
              <button
                onClick={() => handleStartBooking(selectedHomestay)}
                className="py-2 px-5 bg-[#c25e3e] hover:bg-[#a84d30] text-white font-bold rounded-xl transition shadow-xs"
              >
                {t.bookNow}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Destination Detail Modal */}
      {selectedAttraction && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#faf8f5] text-stone-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="relative h-56 bg-stone-900">
              <img
                src={selectedAttraction.image}
                alt={selectedAttraction.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
              
              <button
                onClick={() => setSelectedAttraction(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-xs transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#c25e3e] text-white uppercase tracking-wider">
                    {selectedAttraction.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-stone-300 font-medium">
                    {selectedAttraction.region} • {selectedAttraction.district}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif">
                  {currentLanguage === 'or'
                    ? selectedAttraction.odiaName
                    : currentLanguage === 'hi'
                    ? selectedAttraction.hindiName
                    : selectedAttraction.name}
                </h3>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-900 text-sm">About this Destination</h4>
                <p className="text-stone-700 leading-relaxed text-xs">
                  {currentLanguage === 'or'
                    ? selectedAttraction.odiaDescription
                    : selectedAttraction.description}
                </p>
              </div>

              {/* Activities */}
              <div className="space-y-2">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-500">
                  Key Experiences & Activities
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedAttraction.activities.map((act, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center gap-2 text-stone-800">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Season & Access Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 space-y-1">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    Best Visiting Season
                  </span>
                  <p className="text-stone-800 text-xs font-medium">{selectedAttraction.bestSeason}</p>
                </div>

                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#c25e3e]" />
                    Local Access & Route
                  </span>
                  <p className="text-stone-800 text-xs">{selectedAttraction.approxDistanceNote}</p>
                </div>
              </div>

              {/* Nearby Homestays in this area */}
              <div className="pt-2 border-t border-stone-200 space-y-2.5">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider text-stone-500">
                  Village Homestays in {selectedAttraction.district}
                </h4>
                <div className="space-y-2">
                  {homestays.filter((h) => h.district === selectedAttraction.district).map((h) => (
                    <div key={h.id} className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={h.images[0]} alt={h.name} className="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <h5 className="font-bold text-stone-900 text-xs">{h.name}</h5>
                          <p className="text-[11px] text-stone-500">{h.village} • ₹{h.pricePerNight}/night</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedAttraction(null);
                          setSelectedHomestay(h);
                        }}
                        className="px-3 py-1.5 bg-[#133926] hover:bg-[#0e2a1c] text-white text-xs font-semibold rounded-lg shadow-2xs"
                      >
                        Explore Stay
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedAttraction(null)}
                className="py-2 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const dest = selectedAttraction;
                  setSelectedAttraction(null);
                  if (dest) {
                    handleSelectDestinationFilter(dest);
                  }
                }}
                className="py-2 px-5 bg-[#c25e3e] hover:bg-[#a84d30] text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
              >
                <span>Filter Stays in {selectedAttraction.district}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {bookingHomestay && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#faf8f5] text-stone-900 rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#133926] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-300 font-semibold">{t.bookingTitle}</span>
                <h3 className="text-base font-bold font-serif">{bookingHomestay.name}</h3>
              </div>
              <button onClick={() => setBookingHomestay(null)} className="p-1 hover:bg-emerald-900 rounded text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitBooking} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Room Choice */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">{t.selectRoom}</label>
                <select
                  value={selectedRoom?.id}
                  onChange={(e) => {
                    const r = bookingHomestay.rooms.find((rm) => rm.id === e.target.value);
                    if (r) setSelectedRoom(r);
                  }}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  {bookingHomestay.rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} - ₹{r.pricePerNight}/night (Cap: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">{t.guestNameLabel}</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">{t.guestPhoneLabel}</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              {/* Dates & Arrival */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">{t.filterCheckIn}</label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">{t.filterCheckOut}</label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">{t.arrivalEstimatedTime}</label>
                <input
                  type="text"
                  placeholder="e.g. 3:30 PM (before sunset)"
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pickup"
                  checked={pickupNeeded}
                  onChange={(e) => setPickupNeeded(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-600 h-4 w-4"
                />
                <label htmlFor="pickup" className="text-stone-700 font-medium">
                  {t.requestPickup} (Coordinated by Village Coordinator)
                </label>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">{t.specialRequests}</label>
                <input
                  type="text"
                  placeholder="e.g. Traditional tribal meal preferences, language assistance"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 bg-white"
                />
              </div>

              {/* Total & Transparency */}
              <div className="bg-stone-100 p-3.5 rounded-xl border border-stone-200 space-y-1">
                <div className="flex justify-between font-bold text-stone-900 text-sm">
                  <span>{t.totalEstimated}:</span>
                  <span className="font-mono text-emerald-800">
                    ₹{(selectedRoom?.pricePerNight || 1200) * 2}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">{t.payAtHomestayNotice}</p>
              </div>

              {connectivityMode === 'offline' && (
                <div className="bg-amber-50 text-amber-900 p-3 rounded-xl border border-amber-300 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{t.offlineBookingWarning}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#c25e3e] hover:bg-[#a84d30] disabled:opacity-50 text-white font-bold transition flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <span>{connectivityMode === 'offline' ? t.saveDraftOfflineBtn : t.submitRequestBtn}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bookings Drawer */}
      {isBookingsDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-[#faf8f5] text-stone-900 w-full max-w-md h-full shadow-2xl border-l border-stone-200 flex flex-col">
            <div className="bg-[#133926] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold font-serif">{t.navMyBookings} ({bookings.length})</h3>
              </div>
              <button onClick={() => setIsBookingsDrawerOpen(false)} className="p-1 hover:bg-emerald-900 rounded text-stone-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <Compass className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                  <p>No homestay bookings yet. Explore listings to request your first stay!</p>
                </div>
              ) : (
                bookings.map((b) => {
                  const homestay = homestays.find((h) => h.id === b.propertyId) || homestays[0];

                  return (
                    <div key={b.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono text-stone-400 text-[10px]">Ref: #{b.reference}</span>
                          <h4 className="font-bold text-stone-900 text-sm">{b.propertyName}</h4>
                          <p className="text-stone-500 text-[11px]">{b.propertyVillage}, {b.propertyDistrict}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'declined'
                              ? 'bg-red-100 text-red-800'
                              : b.status === 'saved_offline'
                              ? 'bg-stone-200 text-stone-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status === 'awaiting_host_response' ? 'Awaiting Host' : b.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] bg-stone-50 p-2 rounded-lg text-stone-600">
                        <div>
                          <span className="text-stone-400 block">Dates:</span>
                          <span className="font-semibold text-stone-800">{b.checkInDate} to {b.checkOutDate}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block">Guests & Total:</span>
                          <span className="font-semibold text-stone-800">{b.guestsCount} adults (₹{b.totalAmount})</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {/* Keypad Phone Simulation */}
                        <button
                          onClick={() => onOpenSmartCall(b)}
                          className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-[11px] font-bold flex items-center gap-1"
                          title="Open host keypad phone call simulation"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Simulate Host Keypad Call</span>
                        </button>

                        {/* Arrival Pack */}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => onOpenArrivalPack(b, homestay)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1"
                          >
                            <FileCheck className="w-3 h-3 text-amber-300" />
                            <span>Arrival Pack</span>
                          </button>
                        )}

                        {/* Google Calendar */}
                        {b.status === 'confirmed' && (
                          <button
                            onClick={() => onOpenGoogleCalendar(b)}
                            className="px-2.5 py-1 rounded-lg bg-[#c25e3e] hover:bg-[#a84d30] text-white text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>Google Calendar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
