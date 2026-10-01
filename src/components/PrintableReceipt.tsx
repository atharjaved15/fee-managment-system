import React from 'react';
import { Payment, CollegeConfig, Challan } from '../types';
import { CollegeLogo } from './CollegeLogo';
import { formatCurrency, formatDate } from '../utils/formatters';
import { numberToWords } from '../utils/numberToWords';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

interface PrintableReceiptProps {
  payment: Payment;
  challan?: Challan;
  config: CollegeConfig;
  onClose: () => void;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  payment,
  challan,
  config,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const amountInWords = numberToWords(payment.amountPaid);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-4">
      {/* Top action toolbar (Hidden when printing) */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 mb-4 shadow-xl flex items-center justify-between gap-3 text-white no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">Receipt #{payment.receiptNumber}</h2>
            <p className="text-xs text-slate-400">
              Paid by {payment.studentName} ({payment.rollNumber})
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Receipt Area */}
      <div className="w-full max-w-2xl printable-document">
        <div className="border-4 border-slate-900 p-6 sm:p-8 bg-white text-slate-900 rounded-md relative shadow-md">
          {/* Watermark PAID Stamp */}
          <div className="absolute right-8 top-28 pointer-events-none opacity-15 rotate-[-20deg]">
            <div className="border-4 border-emerald-800 text-emerald-800 font-extrabold text-5xl px-6 py-2 rounded-lg uppercase tracking-widest">
              PAID
            </div>
          </div>

          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <CollegeLogo size="md" />
              <div className="text-left">
                <h1 className="font-extrabold text-base sm:text-xl uppercase tracking-tight text-slate-950 leading-tight">
                  {config.universityName}
                </h1>
                <h2 className="font-bold text-sm sm:text-base text-amber-700 leading-tight">
                  {config.collegeName}
                </h2>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              {config.address} • Phone: {config.phone}
            </p>
            <div className="mt-3 inline-block bg-slate-900 text-white font-extrabold text-sm sm:text-base tracking-widest uppercase px-6 py-1 rounded">
              FEE PAYMENT RECEIPT
            </div>
          </div>

          {/* Receipt Meta Box */}
          <div className="grid grid-cols-2 gap-4 bg-slate-100 p-3.5 border border-slate-300 rounded mb-5 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Receipt No: </span>
              <span className="font-mono font-bold text-slate-900 text-sm">{payment.receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium">Payment Date: </span>
              <span className="font-semibold text-slate-900">{formatDate(payment.paymentDate)}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Challan Ref: </span>
              <span className="font-mono font-semibold text-slate-800">{payment.challanNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 font-medium">Payment Status: </span>
              <span className="font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {payment.status}
              </span>
            </div>
          </div>

          {/* Student Info */}
          <div className="border border-slate-300 rounded p-4 mb-5 text-xs space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500">Student Name:</span>
                <p className="font-bold text-slate-900 uppercase text-sm">{payment.studentName}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Roll Number:</span>
                <p className="font-mono font-bold text-slate-900 text-sm">{payment.rollNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-2">
              <div>
                <span className="text-slate-500">Class / Program:</span>
                <p className="font-medium text-slate-800">{payment.className}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Received By:</span>
                <p className="font-medium text-slate-800">{payment.receivedBy}</p>
              </div>
            </div>
          </div>

          {/* Fee Breakdown Table (If challan provided) */}
          {challan && challan.items && challan.items.length > 0 && (
            <div className="mb-5">
              <h3 className="text-xs font-bold uppercase text-slate-700 mb-1">Fee Particulars</h3>
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-200 text-slate-900 border-b border-slate-300 font-semibold">
                    <th className="p-2 border-r border-slate-300">#</th>
                    <th className="p-2 border-r border-slate-300">Fee Title</th>
                    <th className="p-2 text-right">Fee Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {challan.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-300">
                        <span className="font-medium">{item.feeTitle}</span>
                        {item.description && <span className="text-slate-500 text-[11px] block">{item.description}</span>}
                      </td>
                      <td className="p-2 text-right font-mono">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-semibold border-t border-slate-300">
                    <td colSpan={2} className="p-2 text-right border-r border-slate-300">
                      Total Challan Payable:
                    </td>
                    <td className="p-2 text-right font-mono">{formatCurrency(challan.totalPayable)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Payment Details Banner */}
          <div className="border-2 border-emerald-700 bg-emerald-50/60 rounded p-4 mb-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-900 tracking-wider">Amount Paid</span>
                <div className="text-2xl font-extrabold text-emerald-800 font-mono">
                  {formatCurrency(payment.amountPaid)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-600 block">Payment Method</span>
                <span className="font-bold text-slate-900 bg-white border border-slate-300 px-3 py-1 rounded inline-block text-xs">
                  {payment.paymentMethod}
                </span>
              </div>
            </div>

            {payment.transactionId && (
              <div className="text-xs text-slate-700 border-t border-emerald-200 pt-2 flex justify-between">
                <span>Transaction ID / Ref:</span>
                <span className="font-mono font-bold">{payment.transactionId}</span>
              </div>
            )}

            <div className="text-xs text-slate-800 border-t border-emerald-200 pt-2 mt-2">
              <span className="font-semibold">Amount in Words: </span>
              <span className="italic font-bold">{amountInWords}</span>
            </div>
          </div>

          {/* Outstanding if partial */}
          {challan && challan.remainingAmount > 0 && (
            <div className="mb-5 p-2.5 bg-amber-50 border border-amber-300 rounded text-xs flex justify-between items-center">
              <span className="font-semibold text-amber-900">Remaining Balance on Challan:</span>
              <span className="font-mono font-bold text-rose-700 text-sm">
                {formatCurrency(challan.remainingAmount)}
              </span>
            </div>
          )}

          {/* Signatures & Seal */}
          <div className="grid grid-cols-2 gap-6 text-center text-xs pt-8 border-t border-slate-300 mt-6">
            <div>
              <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center pb-1 text-slate-400 italic">
                Verified System Entry
              </div>
              <span className="text-slate-600 font-medium">Student Signature</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center pb-1 font-semibold text-slate-800">
                {payment.receivedBy || 'Accounts Officer'}
              </div>
              <span className="text-slate-800 font-bold">Authorized Officer / Cashier</span>
            </div>
          </div>

          {/* Official Footer Note */}
          <div className="text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-200 italic">
            Thank you for your payment. This is a computer-generated official receipt and requires no physical seal when verified by authorized login.
          </div>
        </div>
      </div>
    </div>
  );
};
