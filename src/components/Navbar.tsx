import React, { useState } from 'react';
import { CollegeLogo } from './CollegeLogo';
import { TPCLogo } from './TPCLogo';
import { CollegeConfig } from '../types';
import { useAuth } from '../context/AuthContext';
import { Phone, MapPin, LogOut, Menu, X, ShieldCheck, Database, Trash2, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  config: CollegeConfig;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onSeedDemoData: () => void;
  isSeeding: boolean;
  onClearData: () => void;
  isClearing: boolean;
  hasData: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  setMobileMenuOpen,
  mobileMenuOpen,
  onSeedDemoData,
  isSeeding,
  onClearData,
  isClearing,
  hasData
}) => {
  const { currentUser, signOut, userRole } = useAuth();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 shadow-md sticky top-0 z-30 no-print">
      {/* Top institution bar with contact info & data tools */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-orange-400 font-bold">
              <Phone className="w-3.5 h-3.5" />
              <span>{config.phone || '0323 8091599'}</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-md">{config.address || 'Faddah Chungi Chowk, Vehari Road, Mailsi, 61200'}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Clear Dummy Data Button */}
            {hasData && (
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={isClearing || isSeeding}
                title="Wipe out all dummy/sample records for clean real college software operation"
                className="inline-flex items-center gap-1 text-[11px] bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 rounded px-2.5 py-0.5 transition cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3 text-rose-400" />
                <span>{isClearing ? 'Clearing...' : 'Remove Dummy Data'}</span>
              </button>
            )}

            {/* Add Dummy Data Button */}
            <button
              onClick={onSeedDemoData}
              disabled={isSeeding || isClearing}
              title="Preload sample college classes, students, fee types, and challans for demonstration"
              className="inline-flex items-center gap-1 text-[11px] bg-orange-950/50 hover:bg-orange-900/60 text-orange-300 border border-orange-700/50 rounded px-2.5 py-0.5 transition cursor-pointer disabled:opacity-50"
            >
              <Database className="w-3 h-3 text-orange-400" />
              <span>{isSeeding ? 'Adding...' : 'Add Dummy Data'}</span>
            </button>

            {currentUser && (
              <div className="flex items-center gap-1.5 text-slate-300 pl-2 border-l border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="capitalize text-slate-400 hidden md:inline">{userRole.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Branding Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Official College Logo and Titles */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-1.5 bg-white rounded-xl shadow-xs border border-slate-700/50 flex items-center justify-center">
            <TPCLogo variant="full" size="sm" className="h-9 sm:h-11" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase font-extrabold text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-500/30">
                CAMPUS PORTAL
              </span>
            </div>
            <h1 className="text-sm sm:text-lg font-extrabold tracking-tight text-white leading-tight mt-0.5">
              {config.universityName || 'Sarhad University SSC Mailsi'}
            </h1>
            <h2 className="text-xs sm:text-sm font-bold tracking-wide text-orange-400 leading-tight">
              {config.collegeName || 'The Physio College Mailsi'}
            </h2>
          </div>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {currentUser && (
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">
                {currentUser.displayName || currentUser.email}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">Logged in Admin</span>
            </div>
          )}

          {currentUser && (
            <button
              onClick={() => signOut()}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-rose-900/40 text-slate-200 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 rounded-lg px-3 py-1.5 transition cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Confirmation Modal to Clear Dummy Data */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl text-slate-100 text-xs space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Remove All Dummy Records?</h3>
                <p className="text-[11px] text-slate-400">Prepare for clean production use</p>
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed">
              This will wipe out all sample students, sample classes, test fee types, challans, and receipts so you can begin entering actual college records.
              <br /><br />
              <span className="text-orange-400 font-semibold">Note:</span> You can re-populate sample data at any time by clicking "Add Dummy Data".
            </p>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  onClearData();
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Remove All Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
