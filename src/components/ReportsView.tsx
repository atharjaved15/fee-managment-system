import React, { useState, useMemo } from 'react';
import { Challan, Payment, CollegeClass, Student, FeeType, PaymentStatus, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import { StatusBadge } from './StatusBadge';
import {
  BarChart3,
  Calendar,
  Filter,
  Download,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface ReportsViewProps {
  challans: Challan[];
  payments: Payment[];
  classes: CollegeClass[];
  students: Student[];
  feeTypes: FeeType[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  challans,
  payments,
  classes,
  students,
  feeTypes
}) => {
  // Filter states
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [studentFilter, setStudentFilter] = useState<string>('ALL');
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  // Reset filters
  const handleResetFilters = () => {
    setDateFrom('');
    setDateTo('');
    setClassFilter('ALL');
    setStudentFilter('ALL');
    setFeeTypeFilter('ALL');
    setStatusFilter('ALL');
    setMethodFilter('ALL');
  };

  // Filtered Challans
  const filteredChallans = useMemo(() => {
    return challans.filter((c) => {
      // Date filter (by issueDate)
      if (dateFrom && c.issueDate < dateFrom) return false;
      if (dateTo && c.issueDate > dateTo) return false;

      // Class filter
      if (classFilter !== 'ALL' && c.classId !== classFilter) return false;

      // Student filter
      if (studentFilter !== 'ALL' && c.studentId !== studentFilter) return false;

      // Fee Type filter
      if (feeTypeFilter !== 'ALL') {
        const hasFee = c.items.some((i) => i.feeTitle === feeTypeFilter || i.feeTypeId === feeTypeFilter);
        if (!hasFee) return false;
      }

      // Status filter
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;

      return true;
    });
  }, [challans, dateFrom, dateTo, classFilter, studentFilter, feeTypeFilter, statusFilter]);

  // Filtered Payments associated with the filtered challans or payment criteria
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (p.status !== 'PAID') return false;
      if (dateFrom && p.paymentDate < dateFrom) return false;
      if (dateTo && p.paymentDate > dateTo) return false;
      if (methodFilter !== 'ALL' && p.paymentMethod !== methodFilter) return false;
      if (studentFilter !== 'ALL' && p.studentId !== studentFilter) return false;
      return true;
    });
  }, [payments, dateFrom, dateTo, methodFilter, studentFilter]);

  // Aggregate Metrics
  const totalBilled = filteredChallans.reduce((sum, c) => sum + (c.status !== 'CANCELLED' ? c.totalPayable : 0), 0);
  const totalPaid = filteredChallans.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalPaid);
  const paymentCount = filteredPayments.length;

  const handleExportCSV = () => {
    const data = filteredChallans.map((c) => {
      // Find matching payment if any
      const matchingPayment = payments.find((p) => p.challanId === c.id && p.status === 'PAID');
      const student = students.find((s) => s.id === c.studentId);

      return {
        'Receipt Number': matchingPayment ? matchingPayment.receiptNumber : '',
        'Challan Number': c.challanNumber,
        'Student ID': student ? student.studentId : '',
        'Roll Number': c.rollNumber,
        'Student Name': c.studentName,
        'Father Name': c.fatherName,
        'Class': c.className,
        'Fee Title': c.items.map((i) => i.feeTitle).join('; '),
        'Amount': c.subtotal,
        'Discount': c.discount,
        'Fine': c.fine,
        'Total Payable': c.totalPayable,
        'Paid Amount': c.paidAmount,
        'Remaining Amount': c.remainingAmount,
        'Due Date': c.dueDate,
        'Payment Date': matchingPayment ? matchingPayment.paymentDate : '',
        'Payment Method': matchingPayment ? matchingPayment.paymentMethod : '',
        'Transaction ID': matchingPayment ? matchingPayment.transactionId || '' : '',
        'Status': c.status
      };
    });

    exportToCSV(data, `College_Fee_Collection_Report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportExcel = () => {
    const data = filteredChallans.map((c) => {
      const matchingPayment = payments.find((p) => p.challanId === c.id && p.status === 'PAID');
      return {
        'Challan #': c.challanNumber,
        'Receipt #': matchingPayment ? matchingPayment.receiptNumber : '—',
        'Student': c.studentName,
        'Roll No': c.rollNumber,
        'Class': c.className,
        'Fee Type': c.items.map((i) => i.feeTitle).join(', '),
        'Total Payable': c.totalPayable,
        'Paid': c.paidAmount,
        'Remaining': c.remainingAmount,
        'Method': matchingPayment ? matchingPayment.paymentMethod : '—',
        'Status': c.status
      };
    });

    exportToExcel(data, `College_Fee_Collection_${new Date().toISOString().split('T')[0]}`, 'FeeCollection');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            <span>Fee Collection &amp; Financial Reports</span>
          </h2>
          <p className="text-xs text-slate-400">
            Generate audited reports, calculate recoveries, and export Excel-ready spreadsheets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-md cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Billed
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-white mt-1 block">
            {formatCurrency(totalBilled)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Across filtered criteria</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
            Paid / Collected
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {formatCurrency(totalPaid)}
          </span>
          <span className="text-[10px] text-emerald-500/80 mt-1 block">
            {totalBilled > 0 ? `${Math.round((totalPaid / totalBilled) * 100)}% recovery rate` : '0%'}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
            Outstanding Amount
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-1 block">
            {formatCurrency(totalOutstanding)}
          </span>
          <span className="text-[10px] text-amber-500/80 mt-1 block">Pending recovery</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider block">
            Recorded Transactions
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-400 mt-1 block">
            {paymentCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Receipted payments</span>
        </div>
      </div>

      {/* Comprehensive Filter Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Report Filters</span>
          </span>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Date From */}
          <div>
            <label className="block text-slate-400 mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-slate-400 mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            />
          </div>

          {/* Class */}
          <div>
            <label className="block text-slate-400 mb-1">Class / Program</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="ALL">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student */}
          <div>
            <label className="block text-slate-400 mb-1">Specific Student</label>
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="ALL">All Students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.rollNumber} - {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          {/* Fee Type */}
          <div>
            <label className="block text-slate-400 mb-1">Fee Type</label>
            <select
              value={feeTypeFilter}
              onChange={(e) => setFeeTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="ALL">All Fee Types</option>
              {feeTypes.map((ft) => (
                <option key={ft.id} value={ft.title}>
                  {ft.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-slate-400 mb-1">Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">PAID</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-slate-400 mb-1">Payment Method</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Online Transfer">Online Transfer</option>
              <option value="JazzCash">JazzCash</option>
              <option value="EasyPaisa">EasyPaisa</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detailed Ledger Report Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center text-xs">
          <span className="font-bold text-white">
            Collection Ledger ({filteredChallans.length} records found)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Receipt / Challan #</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">Fee Particulars</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Balance</th>
                <th className="p-3">Method</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredChallans.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    No records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredChallans.map((c) => {
                  const matchPay = payments.find((p) => p.challanId === c.id && p.status === 'PAID');
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 text-slate-400 whitespace-nowrap">{formatDate(c.issueDate)}</td>
                      <td className="p-3">
                        {matchPay ? (
                          <div>
                            <span className="font-mono font-bold text-emerald-400 block">{matchPay.receiptNumber}</span>
                            <span className="font-mono text-[10px] text-slate-500">{c.challanNumber}</span>
                          </div>
                        ) : (
                          <span className="font-mono font-bold text-amber-400">{c.challanNumber}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-white block">{c.studentName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Roll: {c.rollNumber}</span>
                      </td>
                      <td className="p-3 text-slate-200">{c.className}</td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">
                        {c.items.map((i) => i.feeTitle).join(', ')}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-white">
                        {formatCurrency(c.totalPayable)}
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-400 font-medium">
                        {formatCurrency(c.paidAmount)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-amber-400">
                        {formatCurrency(c.remainingAmount)}
                      </td>
                      <td className="p-3">
                        {matchPay ? (
                          <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[10.5px]">
                            {matchPay.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <StatusBadge status={c.status} size="sm" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
