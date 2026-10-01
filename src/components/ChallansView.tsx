import React, { useState, useMemo } from 'react';
import { Challan, CollegeClass, PaymentStatus } from '../types';
import { cancelChallan } from '../services/dbService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import { StatusBadge } from './StatusBadge';
import {
  Receipt,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Plus,
  Eye,
  CreditCard,
  Ban,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ChallansViewProps {
  challans: Challan[];
  classes: CollegeClass[];
  onViewChallan: (challan: Challan) => void;
  onRecordPayment: (challan: Challan) => void;
  onOpenGenerateChallan: () => void;
  onShowToast: (message: string) => void;
}

export const ChallansView: React.FC<ChallansViewProps> = ({
  challans,
  classes,
  onViewChallan,
  onRecordPayment,
  onOpenGenerateChallan,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter
  const filteredChallans = useMemo(() => {
    return challans.filter((c) => {
      const matchesSearch =
        c.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.fatherName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClass = selectedClassFilter === 'ALL' || c.classId === selectedClassFilter;
      const matchesStatus = selectedStatusFilter === 'ALL' || c.status === selectedStatusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [challans, searchTerm, selectedClassFilter, selectedStatusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredChallans.length / pageSize) || 1;
  const paginatedChallans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredChallans.slice(start, start + pageSize);
  }, [filteredChallans, currentPage]);

  const handleCancel = async (challan: Challan) => {
    if (challan.paidAmount > 0) {
      alert('Cannot cancel a challan that already has payments recorded against it.');
      return;
    }
    if (confirm(`Are you sure you want to cancel Challan ${challan.challanNumber}?`)) {
      try {
        await cancelChallan(challan.id);
        onShowToast(`Challan ${challan.challanNumber} cancelled.`);
      } catch {
        onShowToast('Failed to cancel challan.');
      }
    }
  };

  const handleExportCSV = () => {
    const data = filteredChallans.map((c) => ({
      'Challan Number': c.challanNumber,
      'Student Name': c.studentName,
      'Father Name': c.fatherName,
      'Roll Number': c.rollNumber,
      'Class': c.className,
      'Fee Items': c.items.map((i) => `${i.feeTitle} (${i.amount})`).join('; '),
      'Subtotal': c.subtotal,
      'Fine': c.fine,
      'Discount': c.discount,
      'Total Payable': c.totalPayable,
      'Paid Amount': c.paidAmount,
      'Remaining Amount': c.remainingAmount,
      'Issue Date': c.issueDate,
      'Due Date': c.dueDate,
      'Status': c.status
    }));
    exportToCSV(data, `Challans_Report_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportExcel = () => {
    const data = filteredChallans.map((c) => ({
      'Challan #': c.challanNumber,
      'Student': c.studentName,
      'Roll No': c.rollNumber,
      'Class': c.className,
      'Total Payable': c.totalPayable,
      'Paid': c.paidAmount,
      'Remaining': c.remainingAmount,
      'Due Date': c.dueDate,
      'Status': c.status
    }));
    exportToExcel(data, `Challans_Export_${new Date().toISOString().split('T')[0]}`, 'Challans');
  };

  return (
    <div className="space-y-5">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-400" />
            <span>Challan Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Track issued fee vouchers, due dates, outstanding balances, and print official slips
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
          <button
            onClick={onOpenGenerateChallan}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-lg text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Generate Challan</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Challan #, Student Name, Roll No..."
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
            value={selectedClassFilter}
            onChange={(e) => {
              setSelectedClassFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="ALL">All Classes &amp; Programs</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => {
              setSelectedStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">PAID</option>
            <option value="UNPAID">UNPAID</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="OVERDUE">OVERDUE</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Challans Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Challan #</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class / Program</th>
                <th className="p-3">Fee Particulars</th>
                <th className="p-3 text-right">Total Payable</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Remaining</th>
                <th className="p-3">Due Date</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedChallans.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500">
                    {challans.length === 0 ? (
                      <div className="py-6 space-y-3">
                        <Receipt className="w-10 h-10 mx-auto text-slate-600" />
                        <p className="text-sm font-semibold text-slate-300">No fee challans generated yet.</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Click "Generate Challan" to issue individual or batch class fee vouchers.
                        </p>
                        <button
                          onClick={onOpenGenerateChallan}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-slate-950 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-slate-950" />
                          <span>Generate First Challan</span>
                        </button>
                      </div>
                    ) : (
                      'No challans match your query. Try adjusting your search or filters.'
                    )}
                  </td>
                </tr>
              ) : (
                paginatedChallans.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono font-bold text-amber-400">{c.challanNumber}</td>
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
                    <td className="p-3 text-slate-400">{formatDate(c.dueDate)}</td>
                    <td className="p-3 text-center">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      {/* View / Print Challan */}
                      <button
                        onClick={() => onViewChallan(c)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer transition"
                        title="View / Print 3-Copy Challan"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Record payment if balance remaining */}
                      {c.status !== 'PAID' && c.status !== 'CANCELLED' && (
                        <button
                          onClick={() => onRecordPayment(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold cursor-pointer transition shadow-2xs"
                          title="Record Payment"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>Pay</span>
                        </button>
                      )}

                      {/* Cancel challan */}
                      {c.status !== 'PAID' && c.status !== 'CANCELLED' && c.paidAmount === 0 && (
                        <button
                          onClick={() => handleCancel(c)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-950/60 text-rose-400 rounded cursor-pointer transition"
                          title="Cancel Challan"
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
            Showing {filteredChallans.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredChallans.length)} of {filteredChallans.length} challans
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
