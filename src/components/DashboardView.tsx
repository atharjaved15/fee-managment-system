import React, { useMemo } from 'react';
import {
  Student,
  CollegeClass,
  Challan,
  Payment,
  FeeType,
  CollegeConfig
} from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';
import { TPCLogo } from './TPCLogo';
import {
  Users,
  GraduationCap,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Receipt,
  CreditCard,
  UserPlus,
  PlusCircle,
  Download,
  Printer,
  Calendar,
  Layers,
  Sparkles,
  Database,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { exportToCSV } from '../utils/exportUtils';

interface DashboardViewProps {
  students: Student[];
  classes: CollegeClass[];
  challans: Challan[];
  payments: Payment[];
  feeTypes: FeeType[];
  config: CollegeConfig;
  onSelectTab: (tab: string) => void;
  onOpenGenerateChallan: () => void;
  onViewReceipt: (payment: Payment) => void;
  onViewChallan: (challan: Challan) => void;
  onRecordPayment: (challan: Challan) => void;
  onSeedDemoData: () => void;
  isSeeding: boolean;
  onClearData: () => void;
  isClearing: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  classes,
  challans,
  payments,
  feeTypes,
  config,
  onSelectTab,
  onOpenGenerateChallan,
  onViewReceipt,
  onViewChallan,
  onRecordPayment,
  onSeedDemoData,
  isSeeding,
  onClearData,
  isClearing
}) => {
  // Statistics calculations
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Active').length;
  const totalClasses = classes.length;

  const validPayments = useMemo(() => payments.filter((p) => p.status === 'PAID'), [payments]);
  const totalFeesCollected = useMemo(
    () => validPayments.reduce((sum, p) => sum + p.amountPaid, 0),
    [validPayments]
  );

  const totalBilled = useMemo(
    () => challans.reduce((sum, c) => sum + (c.status !== 'CANCELLED' ? c.totalPayable : 0), 0),
    [challans]
  );

  const outstandingAmount = Math.max(0, totalBilled - totalFeesCollected);

  // Today's collection
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysCollection = useMemo(
    () =>
      validPayments
        .filter((p) => p.paymentDate === todayStr)
        .reduce((sum, p) => sum + p.amountPaid, 0),
    [validPayments, todayStr]
  );

  // This Month's collection
  const currentMonthPrefix = todayStr.substring(0, 7);
  const thisMonthsCollection = useMemo(
    () =>
      validPayments
        .filter((p) => p.paymentDate && p.paymentDate.startsWith(currentMonthPrefix))
        .reduce((sum, p) => sum + p.amountPaid, 0),
    [validPayments, currentMonthPrefix]
  );

  // Pending fees count
  const pendingChallansCount = challans.filter(
    (c) => c.status === 'UNPAID' || c.status === 'PARTIAL' || c.status === 'OVERDUE'
  ).length;

  // Recent payments
  const recentPayments = useMemo(
    () => [...validPayments].slice(0, 6),
    [validPayments]
  );

  const handleExportCSV = () => {
    const data = validPayments.map((p) => ({
      'Receipt Number': p.receiptNumber,
      'Challan Number': p.challanNumber,
      'Student Name': p.studentName,
      'Roll Number': p.rollNumber,
      'Class': p.className,
      'Amount Paid': p.amountPaid,
      'Payment Method': p.paymentMethod,
      'Transaction ID': p.transactionId || '',
      'Payment Date': p.paymentDate,
      'Received By': p.receivedBy,
      'Status': p.status
    }));
    exportToCSV(data, `Recent_Payments_${todayStr}`);
  };

  const isDatabaseEmpty = totalStudents === 0 && totalClasses === 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome with Official Logo */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-700/60 shrink-0 hidden sm:block">
            <TPCLogo variant="full" size="sm" className="h-10" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-orange-400 bg-orange-950/70 border border-orange-500/30 px-2 py-0.5 rounded">
              COLLEGE ADMINISTRATION SOFTWARE
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1.5 tracking-tight">
              {config.universityName} &bull; {config.collegeName}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Campus Accounts &amp; Student Fee Ledger &bull; {config.address} &bull; Ph: {config.phone}
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={onOpenGenerateChallan}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-slate-950" />
            <span>Issue Challan</span>
          </button>
          <button
            onClick={() => onSelectTab('students')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Add Student</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Production Onboarding Notice when database is clean */}
      {isDatabaseEmpty && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950/60 border border-indigo-900/50 rounded-2xl p-6 shadow-lg text-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Production Mode: Database is Clean</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Ready to manage students and fees for Sarhad University SSC &amp; The Physio College Mailsi
              </h3>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                Start by setting up your academic classes and degree programs, register students, configure custom fee types (Tuition, Trip, Admission, Lab, etc.), and generate official 3-copy bank challans.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => onSelectTab('classes')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>1. Add First Class</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>

              <button
                onClick={onSeedDemoData}
                disabled={isSeeding}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-orange-300 border border-orange-600/40 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Database className="w-4 h-4 text-orange-400" />
                <span>{isSeeding ? 'Loading Sample...' : 'Load Sample Data'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8 Primary Dashboard KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <div
          onClick={() => onSelectTab('students')}
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Students
            </span>
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-white mt-2 block">{totalStudents}</span>
          <span className="text-[10px] text-slate-500 mt-1 block">Registered in database</span>
        </div>

        {/* Total Classes */}
        <div
          onClick={() => onSelectTab('classes')}
          className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 p-4 rounded-xl shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Classes
            </span>
            <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-white mt-2 block">{totalClasses}</span>
          <span className="text-[10px] text-slate-500 mt-1 block">Active programs &amp; batches</span>
        </div>

        {/* Active Students */}
        <div
          onClick={() => onSelectTab('students')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Students
            </span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-2 block">{activeStudents}</span>
          <span className="text-[10px] text-emerald-500/80 mt-1 block">Currently enrolled</span>
        </div>

        {/* Pending Fees (Count) */}
        <div
          onClick={() => onSelectTab('challans')}
          className="bg-slate-900 border border-slate-800 hover:border-rose-500/50 p-4 rounded-xl shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pending Challans
            </span>
            <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-rose-400 mt-2 block">{pendingChallansCount}</span>
          <span className="text-[10px] text-rose-500/80 mt-1 block">Awaiting deposit</span>
        </div>

        {/* Total Fees Collected */}
        <div
          onClick={() => onSelectTab('reports')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Fees Collected
            </span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-2 block">
            {formatCurrency(totalFeesCollected)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">All-time received</span>
        </div>

        {/* Outstanding Amount */}
        <div
          onClick={() => onSelectTab('reports')}
          className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 p-4 rounded-xl shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Outstanding Amount
            </span>
            <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-orange-400 mt-2 block">
            {formatCurrency(outstandingAmount)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Total balance due</span>
        </div>

        {/* Today's Collection */}
        <div
          onClick={() => onSelectTab('payments')}
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Today's Collection
            </span>
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-white mt-2 block">
            {formatCurrency(todaysCollection)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">{formatDate(todayStr)}</span>
        </div>

        {/* This Month's Collection */}
        <div
          onClick={() => onSelectTab('payments')}
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-4 rounded-xl shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              This Month's Collection
            </span>
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-bold font-mono text-indigo-300 mt-2 block">
            {formatCurrency(thisMonthsCollection)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Current monthly revenue</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        <button
          onClick={() => onSelectTab('students')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-center transition cursor-pointer group"
        >
          <Users className="w-5 h-5 mx-auto text-indigo-400 mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-semibold text-slate-200 block">Manage Students</span>
        </button>

        <button
          onClick={() => onSelectTab('classes')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-center transition cursor-pointer group"
        >
          <GraduationCap className="w-5 h-5 mx-auto text-orange-400 mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-semibold text-slate-200 block">Add Class</span>
        </button>

        <button
          onClick={() => onSelectTab('feeTypes')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-center transition cursor-pointer group"
        >
          <PlusCircle className="w-5 h-5 mx-auto text-emerald-400 mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-semibold text-slate-200 block">Create Fee</span>
        </button>

        <button
          onClick={onOpenGenerateChallan}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-center transition cursor-pointer group"
        >
          <Receipt className="w-5 h-5 mx-auto text-orange-400 mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-semibold text-slate-200 block">Issue Challan</span>
        </button>

        <button
          onClick={() => onSelectTab('challans')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-center transition cursor-pointer group"
        >
          <CreditCard className="w-5 h-5 mx-auto text-indigo-400 mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-semibold text-slate-200 block">Record Payment</span>
        </button>

        <button
          onClick={() => onSelectTab('reports')}
          className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-center transition cursor-pointer group"
        >
          <Download className="w-5 h-5 mx-auto text-emerald-400 mb-1 group-hover:scale-110 transition" />
          <span className="text-xs font-semibold text-slate-200 block">Export Reports</span>
        </button>
      </div>

      {/* Recent Payments Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Recent Payment Receipts</h3>
          </div>
          <button
            onClick={() => onSelectTab('payments')}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold cursor-pointer"
          >
            View All ({validPayments.length}) &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Receipt #</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">Class</th>
                <th className="p-3 text-right">Amount Paid</th>
                <th className="p-3">Method</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No payment receipts recorded yet. Real payments will appear here as soon as fee deposits are received.
                  </td>
                </tr>
              ) : (
                recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-orange-400">{p.receiptNumber}</td>
                    <td className="p-3 font-bold text-white">{p.studentName}</td>
                    <td className="p-3 font-mono text-slate-400">{p.rollNumber}</td>
                    <td className="p-3 text-slate-200">{p.className}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(p.amountPaid)}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10.5px]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{formatDate(p.paymentDate)}</td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold uppercase">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onViewReceipt(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold cursor-pointer shadow-2xs"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
