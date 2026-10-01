import React, { useState, useEffect } from 'react';
import { CollegeClass, Student, FeeType, ChallanItem } from '../types';
import { createChallan, createBatchChallans } from '../services/dbService';
import { generateChallanNumber, formatCurrency } from '../utils/formatters';
import { X, Plus, Trash2, Receipt, AlertCircle, CheckCircle2, Users, User } from 'lucide-react';

interface ChallanGeneratorModalProps {
  classes: CollegeClass[];
  students: Student[];
  feeTypes: FeeType[];
  initialStudentId?: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const ChallanGeneratorModal: React.FC<ChallanGeneratorModalProps> = ({
  classes,
  students,
  feeTypes,
  initialStudentId,
  onClose,
  onSuccess
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [targetMode, setTargetMode] = useState<'single' | 'all'>('single');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || '');
  
  // Set default due date to 15 days from now
  const defaultDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  const [dueDate, setDueDate] = useState<string>(defaultDueDate());
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Fee items in this challan
  const [feeItems, setFeeItems] = useState<ChallanItem[]>([
    {
      feeTitle: feeTypes[0]?.title || 'Monthly Tuition Fee',
      description: 'Fee for current term',
      amount: feeTypes[0]?.defaultAmount || 3500
    }
  ]);

  const [fine, setFine] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Please pay the fee before the due date.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-detect class if student initially selected
  useEffect(() => {
    if (initialStudentId) {
      const student = students.find((s) => s.id === initialStudentId);
      if (student) {
        setSelectedClassId(student.classId);
        setSelectedStudentId(student.id);
        setTargetMode('single');
      }
    } else if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, initialStudentId, selectedClassId, students]);

  // Filter students based on selected class
  const classStudents = students.filter(
    (s) => (!selectedClassId || s.classId === selectedClassId) && s.status === 'Active'
  );

  // Update selected student when class changes if needed
  useEffect(() => {
    if (classStudents.length > 0 && (!selectedStudentId || !classStudents.some(s => s.id === selectedStudentId))) {
      setSelectedStudentId(classStudents[0].id);
    }
  }, [classStudents, selectedStudentId]);

  const handleAddFeeItem = () => {
    setFeeItems([
      ...feeItems,
      {
        feeTitle: 'Additional Fee',
        description: '',
        amount: 1000
      }
    ]);
  };

  const handleRemoveFeeItem = (index: number) => {
    if (feeItems.length === 1) return;
    setFeeItems(feeItems.filter((_, i) => i !== index));
  };

  const handleFeeItemChange = (index: number, field: keyof ChallanItem, value: any) => {
    const updated = [...feeItems];
    updated[index] = { ...updated[index], [field]: value };

    // If changing feeTitle to a known feeType, auto-populate defaultAmount
    if (field === 'feeTitle') {
      const matched = feeTypes.find((f) => f.title === value);
      if (matched) {
        updated[index].amount = matched.defaultAmount;
      }
    }

    setFeeItems(updated);
  };

  const subtotal = feeItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalPayable = Math.max(0, subtotal + (Number(fine) || 0) - (Number(discount) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (feeItems.length === 0 || subtotal <= 0) {
      setError('Please add at least one fee item with a positive amount.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (targetMode === 'single') {
        const student = students.find((s) => s.id === selectedStudentId);
        if (!student) {
          throw new Error('Please select a student.');
        }

        const challanNumber = generateChallanNumber(Math.floor(Date.now() / 1000) % 100000);
        await createChallan({
          challanNumber,
          studentId: student.id,
          studentName: student.name,
          fatherName: student.fatherName,
          rollNumber: student.rollNumber,
          classId: student.classId,
          className: student.className,
          session: student.section || '2026-27',
          issueDate,
          dueDate,
          items: feeItems,
          subtotal,
          fine: Number(fine) || 0,
          discount: Number(discount) || 0,
          totalPayable,
          paidAmount: 0,
          remainingAmount: totalPayable,
          status: 'UNPAID',
          notes
        });

        onSuccess(`Successfully generated Challan ${challanNumber} for ${student.name}.`);
      } else {
        // Batch generation for all students in class
        if (classStudents.length === 0) {
          throw new Error('No active students found in this class.');
        }

        const count = await createBatchChallans(
          classStudents,
          feeItems,
          dueDate,
          Number(fine) || 0,
          Number(discount) || 0,
          notes
        );

        onSuccess(`Successfully generated ${count} challans for class ${classes.find(c => c.id === selectedClassId)?.name}.`);
      }

      setIsSubmitting(false);
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Failed to generate challan');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Generate College Fee Challan</h2>
              <p className="text-xs text-slate-400">Create individual or batch class fee vouchers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs">
          {/* Target Mode Toggle */}
          <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setTargetMode('single')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition cursor-pointer ${
                targetMode === 'single'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Individual Student</span>
            </button>
            <button
              type="button"
              onClick={() => setTargetMode('all')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition cursor-pointer ${
                targetMode === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Students in Class ({classStudents.length})</span>
            </button>
          </div>

          {/* Class & Student Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Select Class / Batch <span className="text-rose-400">*</span>
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                required
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {targetMode === 'single' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Student <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                  required
                >
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.rollNumber} - {s.name} (s/o {s.fatherName})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Issue Date</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Due Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Multi-Item Fee Breakdown */}
          <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/40">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200">Fee Line Items</span>
              <button
                type="button"
                onClick={handleAddFeeItem}
                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {feeItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  <div className="flex-1">
                    <input
                      type="text"
                      list={`fee-types-list-${index}`}
                      placeholder="Fee title (e.g. Monthly Fee, Trip Fee)"
                      value={item.feeTitle}
                      onChange={(e) => handleFeeItemChange(index, 'feeTitle', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs"
                      required
                    />
                    <datalist id={`fee-types-list-${index}`}>
                      {feeTypes.map((ft) => (
                        <option key={ft.id} value={ft.title} />
                      ))}
                    </datalist>
                  </div>

                  <div className="w-28 sm:w-32">
                    <input
                      type="text"
                      placeholder="Note / Month"
                      value={item.description || ''}
                      onChange={(e) => handleFeeItemChange(index, 'description', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>

                  <div className="w-24 sm:w-28">
                    <input
                      type="number"
                      placeholder="Amount"
                      min="0"
                      value={item.amount}
                      onChange={(e) => handleFeeItemChange(index, 'amount', Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs text-right"
                      required
                    />
                  </div>

                  {feeItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveFeeItem(index)}
                      className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded transition cursor-pointer"
                      title="Remove fee line"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Subtotal, Fine, Discount Calculations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-400 mb-1">Late Fine / Extra Surcharge (PKR)</label>
              <input
                type="number"
                min="0"
                value={fine}
                onChange={(e) => setFine(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Scholarship / Concession / Discount (PKR)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-white font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
              <span className="text-slate-400">Subtotal: <strong className="text-white font-mono">{formatCurrency(subtotal)}</strong></span>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Payable</span>
                <span className="text-lg font-bold font-mono text-amber-400">{formatCurrency(totalPayable)}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Instructions / Bank Note</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please pay before due date. Fine applies after due date."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
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
              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>
                {isSubmitting
                  ? 'Generating...'
                  : targetMode === 'all'
                  ? `Generate for ${classStudents.length} Students`
                  : 'Generate Challan'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
