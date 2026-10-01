import React, { useState, useMemo } from 'react';
import { Payment } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import { History, Search, Download, FileSpreadsheet, Printer, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReceiptsViewProps {
  payments: Payment[];
  onViewReceipt: (payment: Payment) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({ payments, onViewReceipt }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const validReceipts = useMemo(() => {
    return payments.filter((p) => p.status === 'PAID');
  }, [payments]);

  const filteredReceipts = useMemo(() => {
    return validReceipts.filter((p) => {
      return (
        p.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [validReceipts, searchTerm]);

  const totalPages = Math.ceil(filteredReceipts.length / pageSize) || 1;
  const paginatedReceipts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReceipts.slice(start, start + pageSize);
  }, [filteredReceipts, currentPage]);

  const handleExportCSV = () => {
    const data = filteredReceipts.map((p) => ({
      'Receipt Number': p.receiptNumber,
      'Challan Reference': p.challanNumber,
      'Student Name': p.studentName,
      'Roll Number': p.rollNumber,
      'Class': p.className,
      'Amount Paid': p.amountPaid,
      'Payment Method': p.paymentMethod,
      'Transaction ID': p.transactionId || '',
      'Payment Date': p.paymentDate,
      'Received By': p.receivedBy
    }));
    exportToCSV(data, `Official_Receipts_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportExcel = () => {
    const data = filteredReceipts.map((p) => ({
      'Receipt #': p.receiptNumber,
      'Challan #': p.challanNumber,
      'Student': p.studentName,
      'Roll No': p.rollNumber,
      'Class': p.className,
      'Amount': p.amountPaid,
      'Method': p.paymentMethod,
      'Date': p.paymentDate,
      'Received By': p.receivedBy
    }));
    exportToExcel(data, `Official_Receipts_${new Date().toISOString().split('T')[0]}`, 'Receipts');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-6 h-6 text-amber-400" />
            <span>Official Paid Receipts Archive</span>
          </h2>
          <p className="text-xs text-slate-400">
            View, search, and reprint official college payment receipts
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
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Receipt #, Challan #, Student Name, Roll No..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Receipt Number</th>
                <th className="p-3">Challan Ref</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class</th>
                <th className="p-3 text-right">Amount Paid</th>
                <th className="p-3">Method</th>
                <th className="p-3">Transaction ID</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedReceipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No receipts found.
                  </td>
                </tr>
              ) : (
                paginatedReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-amber-400">{r.receiptNumber}</td>
                    <td className="p-3 font-mono text-slate-400">{r.challanNumber}</td>
                    <td className="p-3">
                      <span className="font-bold text-white block">{r.studentName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Roll: {r.rollNumber}</span>
                    </td>
                    <td className="p-3 text-slate-200">{r.className}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm">
                      {formatCurrency(r.amountPaid)}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10.5px]">
                        {r.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">{r.transactionId || '—'}</td>
                    <td className="p-3 text-slate-300">{formatDate(r.paymentDate)}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onViewReceipt(r)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                      </button>
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
            Showing {filteredReceipts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredReceipts.length)} of {filteredReceipts.length} receipts
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
