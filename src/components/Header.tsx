/**
 * SETUVANA - Global Header & Navigation
 * Trilingual Selector, Role Switcher, Persistent Connectivity Indicator
 */

import React from 'react';
import { Language, UserRole, ConnectivityMode } from '../types';
import { translations } from '../translations';
import { Wifi, WifiOff, RefreshCw, Smartphone, MapPin, Compass, Shield, UserCheck, Bot } from 'lucide-react';

interface HeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  connectivityMode: ConnectivityMode;
  isSyncing: boolean;
  unsyncedCount: number;
  onOpenConnectivityPanel: () => void;
  onOpenAIStudio: () => void;
  onOpenSignalMap: () => void;
  onOpenBookings: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  currentRole,
  onRoleChange,
  connectivityMode,
  isSyncing,
  unsyncedCount,
  onOpenConnectivityPanel,
  onOpenAIStudio,
  onOpenSignalMap,
  onOpenBookings,
  activeTab,
  setActiveTab,
}) => {
  const t = translations[currentLanguage];

  const getConnectivityBadge = () => {
    if (connectivityMode === 'offline') {
      return (
        <button
          onClick={onOpenConnectivityPanel}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-800 text-stone-200 border border-stone-600 hover:bg-stone-700 transition"
          title="Operating completely offline from IndexedDB"
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.statusOffline}</span>
          {unsyncedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-bold">
              {unsyncedCount}
            </span>
          )}
        </button>
      );
    }
    if (connectivityMode === 'weak') {
      return (
        <button
          onClick={onOpenConnectivityPanel}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-900/40 text-amber-300 border border-amber-600/60 hover:bg-amber-900/60 transition"
          title="Weak connectivity - Low Data mode active"
        >
          <Wifi className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{t.statusWeak}</span>
          {unsyncedCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-bold">
              {unsyncedCount}
            </span>
          )}
        </button>
      );
    }
    return (
      <button
        onClick={onOpenConnectivityPanel}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/40 text-emerald-300 border border-emerald-600/50 hover:bg-emerald-900/60 transition"
        title="Good network connectivity"
      >
        {isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
        ) : (
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        )}
        <span>{isSyncing ? t.statusSyncing : t.statusOnline}</span>
        {unsyncedCount > 0 && (
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-black font-bold">
            {unsyncedCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-[#133926] text-white shadow-md border-b border-emerald-950">
      {/* Top Brand & Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('explore')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c25e3e] to-[#9e4528] flex items-center justify-center shadow-inner border border-amber-300/30">
            <span className="text-xl font-black text-amber-100 tracking-wider font-serif">ସେ</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-cream-100 font-serif">
                SETUVANA
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-800/80 text-emerald-200 font-medium">
                ଓଡ଼ିଶା
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 tracking-wide hidden sm:block">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Global Controls: Language, Signal, AI, Bookings, Role */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Connectivity Status Indicator */}
          {getConnectivityBadge()}

          {/* Trilingual Language Selector */}
          <div className="flex items-center bg-[#0e2a1c] rounded-lg p-0.5 border border-emerald-800/60 text-xs">
            <button
              onClick={() => onLanguageChange('or')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                currentLanguage === 'or'
                  ? 'bg-[#c25e3e] text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              ଓଡ଼ିଆ
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                currentLanguage === 'en'
                  ? 'bg-[#c25e3e] text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                currentLanguage === 'hi'
                  ? 'bg-[#c25e3e] text-white shadow-sm'
                  : 'text-emerald-200 hover:text-white'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Signal Map Quick Link */}
          <button
            onClick={onOpenSignalMap}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-100 border border-emerald-700/60 transition"
            title="View rural network signal reports"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden md:inline">{t.navConnectivityMap}</span>
          </button>

          {/* AI Studio Hub */}
          <button
            onClick={onOpenAIStudio}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-600/80 to-[#c25e3e] hover:from-amber-600 hover:to-[#c25e3e]/90 text-white shadow-sm transition"
            title="Gemini AI Studio: Route Planner, TTS & Image Generator"
          >
            <Bot className="w-3.5 h-3.5 text-amber-200" />
            <span className="font-semibold">{t.navAIStudio}</span>
          </button>

          {/* My Bookings Drawer Trigger */}
          <button
            onClick={onOpenBookings}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-800/80 hover:bg-emerald-700 text-white transition"
          >
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.navMyBookings}</span>
          </button>

          {/* Role Switcher Pill */}
          <div className="relative flex items-center bg-[#0a2015] rounded-lg px-2 py-1 border border-emerald-700/60">
            <span className="text-[10px] text-emerald-400 mr-1.5 uppercase font-bold tracking-wider hidden sm:inline">
              Role:
            </span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-transparent text-xs font-semibold text-amber-200 outline-none cursor-pointer pr-1"
            >
              <option value="traveller" className="bg-[#133926] text-white">
                {t.roleTraveller}
              </option>
              <option value="host" className="bg-[#133926] text-white">
                {t.roleHost}
              </option>
              <option value="coordinator" className="bg-[#133926] text-white">
                {t.roleCoordinator}
              </option>
              <option value="admin" className="bg-[#133926] text-white">
                {t.roleAdmin}
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Role Navigation Bar */}
      <nav className="bg-[#0e2a1c] border-t border-emerald-900/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'explore'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-emerald-200/90 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            {t.navExplore}
          </button>

          <button
            onClick={() => {
              setActiveTab('host');
              onRoleChange('host');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'host'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-emerald-200/90 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-400" />
            {t.navHostPortal}
          </button>

          <button
            onClick={() => {
              setActiveTab('coordinator');
              onRoleChange('coordinator');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'coordinator'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-emerald-200/90 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            {t.navCoordinatorDesk}
          </button>

          <button
            onClick={() => {
              setActiveTab('admin');
              onRoleChange('admin');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition ${
              activeTab === 'admin'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-emerald-200/90 hover:text-white hover:bg-emerald-900/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            {t.navAdminPanel}
          </button>
        </div>
      </nav>
    </header>
  );
};
