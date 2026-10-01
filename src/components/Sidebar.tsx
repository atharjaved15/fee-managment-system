import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  History,
  BarChart3,
  Settings,
  LogOut,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onOpenGenerateChallan: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  onOpenGenerateChallan
}) => {
  const { signOut, currentUser } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'classes', label: 'Classes & Batches', icon: GraduationCap },
    { id: 'feeTypes', label: 'Fee Types', icon: Layers },
    { id: 'feeAssignments', label: 'Fee Assignments', icon: FileSpreadsheet },
    { id: 'challans', label: 'Challans', icon: Receipt },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'receipts', label: 'Paid Receipts', icon: History },
    { id: 'reports', label: 'Collection Reports', icon: BarChart3 },
    { id: 'settings', label: 'College Settings', icon: Settings },
  ];

  const handleSelect = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-20 md:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 md:top-[105px] left-0 h-screen md:h-[calc(100vh-105px)] w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between z-30 transition-transform duration-200 ease-in-out no-print ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Quick Action Button */}
          <button
            onClick={() => {
              onOpenGenerateChallan();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-md transition transform active:scale-98 cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-slate-950" />
            <span>Generate Challan</span>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Administration
            </div>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer text-left ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          {currentUser && (
            <div className="mb-3 px-2">
              <p className="text-[11px] text-slate-400">Signed in as:</p>
              <p className="text-xs font-medium text-slate-200 truncate">{currentUser.email}</p>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 border border-transparent hover:border-rose-800/50 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
