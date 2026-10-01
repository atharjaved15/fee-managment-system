import React from 'react';
import { Student, Challan, Payment, CollegeConfig } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';
import { X, Receipt, CreditCard, Eye, Printer, AlertTriangle, CheckCircle2, History } from 'lucide-react';

interface StudentHistoryModalProps {
  student: Student;
  challans: Challan[];
  payments: Payment[];
  config: CollegeConfig;
  onClose: () => void;
  onViewChallan: (challan: Challan) => void;
  onViewReceipt: (payment: Payment) => void;
  onRecordPayment: (challan: Challan) => void;
  onGenerateChallanForStudent: (student: Student) => void;
}

export const StudentHistoryModal: React.FC<StudentHistoryModalProps> = ({
  student,
  challans,
  payments,
  config,
  onClose,
  onViewChallan,
  onViewReceipt,
  onRecordPayment,
  onGenerateChallanForStudent
}) => {
  // Student's challans and payments
  const studentChallans = challans.filter((c) => c.studentId === student.id);
  const studentPayments = payments.filter((p) => p.studentId === student.id && p.status === 'PAID');

  const totalBilled = studentChallans.reduce((sum, c) => sum + (c.status !== 'CANCELLED' ? c.totalPayable : 0), 0);
  const totalPaid = studentPayments.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalPaid);

  const lastPayment = studentPayments.length > 0
    ? [...studentPayments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())[0]
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Student Profile & Fee Ledger</h2>
              <p className="text-xs text-slate-400">
                {student.name} ({student.rollNumber}) • {student.className}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Bio & Summary Cards */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs">
          {/* Bio card */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 block text-[11px]">Father's Name</span>
              <strong className="text-slate-200 text-xs">{student.fatherName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Student ID</span>
              <span className="font-mono text-slate-200 text-xs">{student.studentId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Phone</span>
              <span className="text-slate-200 text-xs">{student.phone || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Status</span>
              <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px] font-bold">
                {student.status}
              </span>
            </div>
          </div>

          {/* Financial summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Total Billed</span>
              <span className="text-base sm:text-lg font-bold font-mono text-white mt-1 block">
                {formatCurrency(totalBilled)}
              </span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Total Paid</span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-1 block">
                {formatCurrency(totalPaid)}
              </span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Current Balance</span>
              <span className={`text-base sm:text-lg font-bold font-mono mt-1 block ${totalOutstanding > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {formatCurrency(totalOutstanding)}
              </span>
            </div>
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Last Payment</span>
              <span className="text-xs font-semibold text-slate-300 mt-1 block">
                {lastPayment ? `${formatCurrency(lastPayment.amountPaid)} (${formatDate(lastPayment.paymentDate)})` : 'None'}
              </span>
            </div>
          </div>

          {/* Quick Action */}
          <div className="flex justify-between items-center bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
            <span className="text-amber-200 text-xs">Need to issue another fee voucher for this student?</span>
            <button
              onClick={() => onGenerateChallanForStudent(student)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
            >
              Issue New Challan
            </button>
          </div>

          {/* Challans Table */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <span>Issued Challans ({studentChallans.length})</span>
            </h3>

            {studentChallans.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-950/30 rounded-xl border border-slate-800">
                No fee challans generated yet for this student.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-2.5">Challan #</th>
                      <th className="p-2.5">Fee Particulars</th>
                      <th className="p-2.5 text-right">Payable</th>
                      <th className="p-2.5 text-right">Paid</th>
                      <th className="p-2.5 text-right">Remaining</th>
                      <th className="p-2.5">Due Date</th>
                      <th className="p-2.5 text-center">Status</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {studentChallans.map((challan) => (
                      <tr key={challan.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono font-bold text-amber-400">{challan.challanNumber}</td>
                        <td className="p-2.5">
                          {challan.items.map((i) => i.feeTitle).join(', ')}
                        </td>
                        <td className="p-2.5 text-right font-mono font-semibold text-white">
                          {formatCurrency(challan.totalPayable)}
                        </td>
                        <td className="p-2.5 text-right font-mono text-emerald-400">
                          {formatCurrency(challan.paidAmount)}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-rose-400">
                          {formatCurrency(challan.remainingAmount)}
                        </td>
                        <td className="p-2.5 text-slate-400">{formatDate(challan.dueDate)}</td>
                        <td className="p-2.5 text-center">
                          <StatusBadge status={challan.status} size="sm" />
                        </td>
                        <td className="p-2.5 text-right space-x-1">
                          <button
                            onClick={() => onViewChallan(challan)}
                            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded cursor-pointer"
                            title="View / Print Challan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {challan.status !== 'PAID' && challan.status !== 'CANCELLED' && (
                            <button
                              onClick={() => onRecordPayment(challan)}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold cursor-pointer"
                              title="Record Payment"
                            >
                              Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Receipts History */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Payment Receipts ({studentPayments.length})</span>
            </h3>

            {studentPayments.length === 0 ? (
              <div className="p-6 text-center text-slate-500 bg-slate-950/30 rounded-xl border border-slate-800">
                No payment receipts recorded yet for this student.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-2.5">Receipt #</th>
                      <th className="p-2.5">Challan Ref</th>
                      <th className="p-2.5 text-right">Amount Paid</th>
                      <th className="p-2.5">Method</th>
                      <th className="p-2.5">Transaction ID</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5">Received By</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {studentPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-mono font-bold text-emerald-400">{payment.receiptNumber}</td>
                        <td className="p-2.5 font-mono text-slate-400">{payment.challanNumber}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-white">
                          {formatCurrency(payment.amountPaid)}
                        </td>
                        <td className="p-2.5">{payment.paymentMethod}</td>
                        <td className="p-2.5 font-mono text-slate-400">{payment.transactionId || '—'}</td>
                        <td className="p-2.5">{formatDate(payment.paymentDate)}</td>
                        <td className="p-2.5 text-slate-400">{payment.receivedBy}</td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => onViewReceipt(payment)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-semibold cursor-pointer"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
