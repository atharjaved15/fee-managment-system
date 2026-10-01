import React, { useState } from 'react';
import { Challan, CollegeConfig } from '../types';
import { CollegeLogo } from './CollegeLogo';
import { formatCurrency, formatDate } from '../utils/formatters';
import { numberToWords } from '../utils/numberToWords';
import { Printer, ArrowLeft, CheckCircle2, AlertTriangle, FileText, Download } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface PrintableChallanProps {
  challan: Challan;
  config: CollegeConfig;
  onClose: () => void;
  onRecordPayment?: (challan: Challan) => void;
}

export const PrintableChallan: React.FC<PrintableChallanProps> = ({
  challan,
  config,
  onClose,
  onRecordPayment
}) => {
  const [layoutMode, setLayoutMode] = useState<'3-copy' | '1-copy'>('3-copy');

  const handlePrint = () => {
    window.print();
  };

  const amountInWords = numberToWords(challan.totalPayable);

  // Single copy template used for rendering either 1 page or 3 columns (Bank, College, Student)
  const renderChallanSlip = (copyTitle: string) => {
    return (
      <div className="border-2 border-slate-900 p-4 bg-white text-slate-900 rounded-sm relative flex flex-col justify-between text-xs h-full min-h-[580px]">
        {/* Top watermark / background stamp */}
        <div className="text-center pb-2 border-b-2 border-slate-900 mb-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CollegeLogo size="sm" />
            <div className="text-left">
              <h1 className="font-extrabold text-[13px] uppercase tracking-tight text-slate-950 leading-tight">
                {config.universityName}
              </h1>
              <h2 className="font-bold text-[11px] text-amber-700 leading-tight">
                {config.collegeName}
              </h2>
            </div>
          </div>
          <p className="text-[9px] text-slate-600 leading-tight">
            {config.address} • Ph: {config.phone}
          </p>
          <div className="mt-2 inline-flex items-center justify-between w-full px-2 py-0.5 bg-slate-900 text-white font-bold rounded-xs">
            <span className="text-[10px] tracking-wider uppercase">FEE CHALLAN</span>
            <span className="text-[9px] text-amber-300 font-extrabold uppercase bg-slate-800 px-1.5 py-0.2 rounded">
              {copyTitle}
            </span>
          </div>
        </div>

        {/* Challan Meta Info */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-slate-100 p-2 border border-slate-300 rounded mb-3 text-[10.5px]">
          <div>
            <span className="text-slate-500 font-medium">Challan No: </span>
            <span className="font-bold font-mono text-slate-900">{challan.challanNumber}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-medium">Status: </span>
            <span className={`font-bold ${challan.status === 'PAID' ? 'text-emerald-700' : 'text-rose-700'}`}>
              {challan.status}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">Issue Date: </span>
            <span className="font-semibold text-slate-800">{formatDate(challan.issueDate)}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 font-medium">Due Date: </span>
            <span className="font-bold text-rose-700">{formatDate(challan.dueDate)}</span>
          </div>
        </div>

        {/* Student Details */}
        <div className="border border-slate-300 rounded p-2 mb-3 text-[10.5px] space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Student Name:</span>
            <span className="font-bold text-slate-900 uppercase">{challan.studentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Father's Name:</span>
            <span className="font-semibold text-slate-800">{challan.fatherName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Roll No:</span>
            <span className="font-mono font-bold text-slate-900">{challan.rollNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Class/Program:</span>
            <span className="font-medium text-slate-800">{challan.className}</span>
          </div>
          {challan.session && (
            <div className="flex justify-between">
              <span className="text-slate-500">Session/Batch:</span>
              <span className="font-medium text-slate-800">{challan.session}</span>
            </div>
          )}
        </div>

        {/* Fee Items Table */}
        <div className="mb-3 flex-1">
          <table className="w-full text-left border-collapse border border-slate-400 text-[10px]">
            <thead>
              <tr className="bg-slate-200 text-slate-900 border-b border-slate-400">
                <th className="p-1 border-r border-slate-300">#</th>
                <th className="p-1 border-r border-slate-300">Fee Title / Description</th>
                <th className="p-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="p-1 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                  <td className="p-1 border-r border-slate-300">
                    <span className="font-semibold">{item.feeTitle}</span>
                    {item.description && <div className="text-[8.5px] text-slate-500">{item.description}</div>}
                  </td>
                  <td className="p-1 text-right font-mono font-medium">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
              {/* Subtotal */}
              <tr className="border-t border-slate-400 bg-slate-50">
                <td colSpan={2} className="p-1 font-semibold text-right border-r border-slate-300">
                  Subtotal:
                </td>
                <td className="p-1 text-right font-mono font-semibold">{formatCurrency(challan.subtotal)}</td>
              </tr>
              {challan.fine > 0 && (
                <tr className="text-rose-700 bg-rose-50">
                  <td colSpan={2} className="p-1 font-medium text-right border-r border-slate-300">
                    Late Fee Fine:
                  </td>
                  <td className="p-1 text-right font-mono font-medium">+{formatCurrency(challan.fine)}</td>
                </tr>
              )}
              {challan.discount > 0 && (
                <tr className="text-emerald-700 bg-emerald-50">
                  <td colSpan={2} className="p-1 font-medium text-right border-r border-slate-300">
                    Scholarship / Discount:
                  </td>
                  <td className="p-1 text-right font-mono font-medium">-{formatCurrency(challan.discount)}</td>
                </tr>
              )}
              {/* Total Payable */}
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
                <td colSpan={2} className="p-1.5 text-right uppercase tracking-wider text-[10.5px]">
                  Total Payable:
                </td>
                <td className="p-1.5 text-right font-mono text-[11px] text-amber-300">
                  {formatCurrency(challan.totalPayable)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Amount in words */}
          <div className="mt-2 p-1.5 bg-slate-50 border border-slate-300 rounded text-[9.5px]">
            <span className="font-semibold text-slate-700">Amount in Words: </span>
            <span className="italic text-slate-900 font-medium">{amountInWords}</span>
          </div>

          {/* Payment Progress if partial */}
          {challan.paidAmount > 0 && (
            <div className="mt-1.5 flex justify-between p-1 bg-amber-50 border border-amber-300 rounded text-[9.5px] font-semibold">
              <span className="text-amber-800">Paid Amount: {formatCurrency(challan.paidAmount)}</span>
              <span className="text-rose-800">Remaining Balance: {formatCurrency(challan.remainingAmount)}</span>
            </div>
          )}
        </div>

        {/* Bank & Payment Instructions */}
        <div className="text-[8.5px] text-slate-600 border-t border-slate-300 pt-1.5 mb-3 leading-tight space-y-0.5">
          <p className="font-bold text-slate-800">Bank Details: {config.bankName || 'Allied Bank Mailsi'}</p>
          <p>Account Title: {config.accountTitle || 'The Physio College Mailsi'}</p>
          <p>A/C No: {config.accountNumber || '6580-00129384-001'}</p>
          <p className="italic text-slate-500 mt-1">{challan.notes || 'Please pay the fee before the due date.'}</p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-2 text-center text-[9px] pt-4 mt-auto border-t border-dashed border-slate-400">
          <div>
            <div className="h-6 border-b border-slate-400 mb-1"></div>
            <span className="text-slate-600">Student/Depositor Sign</span>
          </div>
          <div>
            <div className="h-6 border-b border-slate-400 mb-1"></div>
            <span className="text-slate-800 font-semibold">Authorized Bank/College Officer</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-4">
      {/* Top action toolbar (Hidden when printing) */}
      <div className="w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 mb-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-white no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">Challan #{challan.challanNumber}</h2>
              <StatusBadge status={challan.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400">
              {challan.studentName} ({challan.rollNumber}) • {challan.className}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Layout Mode Toggle */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setLayoutMode('3-copy')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                layoutMode === '3-copy' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              3-Copy Layout (Standard)
            </button>
            <button
              onClick={() => setLayoutMode('1-copy')}
              className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                layoutMode === '1-copy' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Single A4 Layout
            </button>
          </div>

          {/* Quick Record Payment button if unpaid */}
          {challan.status !== 'PAID' && challan.status !== 'CANCELLED' && onRecordPayment && (
            <button
              onClick={() => onRecordPayment(challan)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg shadow-sm transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Payment</span>
            </button>
          )}

          {/* Print / Save as PDF Button */}
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="w-full max-w-6xl printable-document">
        {layoutMode === '3-copy' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
            {renderChallanSlip('Bank Copy')}
            {renderChallanSlip('College Copy')}
            {renderChallanSlip('Student Copy')}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {renderChallanSlip('Official College Copy')}
          </div>
        )}
      </div>
    </div>
  );
};
