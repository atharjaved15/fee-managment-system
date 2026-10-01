import React, { useState } from 'react';
import { Challan, PaymentMethod, Payment } from '../types';
import { recordPayment } from '../services/dbService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { X, CreditCard, CheckCircle2, AlertCircle, Receipt } from 'lucide-react';

interface RecordPaymentModalProps {
  challan: Challan;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  challan,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();

  const [amountPaid, setAmountPaid] = useState<number>(challan.remainingAmount || challan.totalPayable);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [receivedBy, setReceivedBy] = useState<string>(currentUser?.displayName || currentUser?.email || 'Accounts Officer');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = Number(amountPaid);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (amount > challan.remainingAmount) {
      setError(`Payment cannot exceed the remaining balance of ${formatCurrency(challan.remainingAmount)}.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const newPaymentId = await recordPayment({
        challanId: challan.id,
        amountPaid: amount,
        paymentMethod,
        transactionId: transactionId.trim(),
        paymentDate,
        receivedBy: receivedBy.trim(),
        notes: notes.trim()
      });

      setIsSubmitting(false);
      onSuccess(newPaymentId);
    } catch (err: unknown) {
      setIsSubmitting(false);
      console.error('Failed to record payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    }
  };

  const newRemaining = Math.max(0, challan.remainingAmount - (Number(amountPaid) || 0));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Record Fee Payment</h2>
              <p className="text-xs text-slate-400">Challan #{challan.challanNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challan Summary Box */}
        <div className="p-4 bg-slate-950/30 border-b border-slate-800 text-xs">
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div>
              <span className="text-slate-400 block text-[11px]">Student:</span>
              <span className="font-semibold text-white">{challan.studentName}</span> ({challan.rollNumber})
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[11px]">Class:</span>
              <span className="font-semibold text-slate-200">{challan.className}</span>
            </div>
            <div className="mt-1 pt-1 border-t border-slate-800/80">
              <span className="text-slate-400 block text-[11px]">Total Payable:</span>
              <span className="font-mono font-bold text-slate-200">{formatCurrency(challan.totalPayable)}</span>
            </div>
            <div className="mt-1 pt-1 border-t border-slate-800/80 text-right">
              <span className="text-slate-400 block text-[11px]">Outstanding Remaining:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{formatCurrency(challan.remainingAmount)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Payment Amount (PKR) <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold">Rs.</span>
              <input
                type="number"
                min="1"
                max={challan.remainingAmount}
                step="any"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-white font-mono text-sm focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>
            <div className="flex justify-between items-center mt-1 text-[11px]">
              <span className="text-slate-400">
                New Balance After Payment: <strong className="text-amber-400 font-mono">{formatCurrency(newRemaining)}</strong>
              </span>
              <button
                type="button"
                onClick={() => setAmountPaid(challan.remainingAmount)}
                className="text-amber-400 hover:underline font-semibold cursor-pointer"
              >
                Pay Full Balance
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Online Transfer">Online Transfer</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Transaction / Ref ID {paymentMethod !== 'Cash' && <span className="text-amber-400">*</span>}
              </label>
              <input
                type="text"
                placeholder={paymentMethod === 'Cash' ? 'e.g. CSH-01 (optional)' : 'e.g. TRX-98320491'}
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Received By</label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Notes / Remarks</label>
            <input
              type="text"
              placeholder="e.g. Deposited at front desk"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Recording...' : 'Generate Official Receipt'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
