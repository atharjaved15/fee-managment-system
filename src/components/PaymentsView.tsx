import React, { useState, useMemo } from 'react';
import { Payment, Challan, PaymentMethod } from '../types';
import { cancelPayment } from '../services/dbService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import {
  CreditCard,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  Ban,
  ChevronLeft,
  ChevronRight,
  Receipt
} from 'lucide-react';

interface PaymentsViewProps {
  payments: Payment[];
  challans: Challan[];
  onViewReceipt: (payment: Payment) => void;
  onShowToast: (message: string) => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  challans,
  onViewReceipt,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [payments, searchTerm, methodFilter]);

  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage]);

  const handleCancelPayment = async (p: Payment) => {
    if (confirm(`Are you sure you want to cancel Receipt ${p.receiptNumber}? The challan balance will be restored.`)) {
      try {
        await cancelPayment(p.id, p.challanId);
        onShowToast(`Payment ${p.receiptNumber} cancelled and balance restored.`);
      } catch {
        onShowToast('Failed to cancel payment.');
      }
    }
  };

  const handleExportCSV = () => {
    const data = filteredPayments.map((p) => ({
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
      'Status': p.status,
      'Notes': p.notes || ''
    }));
    exportToCSV(data, `Payments_Report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportExcel = () => {
    const data = filteredPayments.map((p) => ({
      'Receipt #': p.receiptNumber,
      'Challan #': p.challanNumber,
      'Student': p.studentName,
      'Roll No': p.rollNumber,
      'Class': p.className,
      'Amount Paid': p.amountPaid,
      'Method': p.paymentMethod,
      'Transaction ID': p.transactionId || '',
      'Date': p.paymentDate,
      'Received By': p.receivedBy,
      'Status': p.status
    }));
    exportToExcel(data, `Payments_Export_${new Date().toISOString().split('T')[0]}`, 'Payments');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <span>Payments &amp; Transactions</span>
          </h2>
          <p className="text-xs text-slate-400">
            Recorded student fee collections across Cash, Bank, JazzCash, and EasyPaisa
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
            title="Export to Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Receipt #, Challan #, Student Name, Roll No, Transaction ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
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

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Receipt #</th>
                <th className="p-3">Challan Ref</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class</th>
                <th className="p-3 text-right">Amount Paid</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3">Transaction / Ref</th>
                <th className="p-3">Date</th>
                <th className="p-3">Received By</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-emerald-400">{p.receiptNumber}</td>
                    <td className="p-3 font-mono text-slate-400 font-medium">{p.challanNumber}</td>
                    <td className="p-3">
                      <span className="font-bold text-white block">{p.studentName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Roll: {p.rollNumber}</span>
                    </td>
                    <td className="p-3 text-slate-200">{p.className}</td>
                    <td className="p-3 text-right font-mono font-bold text-white text-sm">
                      {formatCurrency(p.amountPaid)}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10.5px]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{p.transactionId || '—'}</td>
                    <td className="p-3 text-slate-300">{formatDate(p.paymentDate)}</td>
                    <td className="p-3 text-slate-400">{p.receivedBy}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'PAID'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400 line-through'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onViewReceipt(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold cursor-pointer transition shadow-2xs"
                        title="View Official Receipt"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>

                      {p.status === 'PAID' && (
                        <button
                          onClick={() => handleCancelPayment(p)}
                          className="p-1 bg-slate-800 hover:bg-rose-950/60 text-rose-400 rounded cursor-pointer transition"
                          title="Cancel Payment Transaction"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>
            Showing {filteredPayments.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredPayments.length)} of {filteredPayments.length} payments
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-white font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
