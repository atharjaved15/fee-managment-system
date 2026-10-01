import React, { useState } from 'react';
import { FeeAssignment, CollegeClass, Student, FeeType } from '../types';
import { addFeeAssignment, deleteFeeAssignment, createBatchChallans, createChallan } from '../services/dbService';
import { formatCurrency, formatDate, generateChallanNumber } from '../utils/formatters';
import { FileSpreadsheet, Plus, Trash2, Zap, AlertCircle, Save, X, Users, User } from 'lucide-react';

interface FeeAssignmentsViewProps {
  assignments: FeeAssignment[];
  classes: CollegeClass[];
  students: Student[];
  feeTypes: FeeType[];
  onShowToast: (message: string) => void;
}

export const FeeAssignmentsView: React.FC<FeeAssignmentsViewProps> = ({
  assignments,
  classes,
  students,
  feeTypes,
  onShowToast
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [targetType, setTargetType] = useState<'class' | 'student'>('class');
  const [targetId, setTargetId] = useState<string>(classes[0]?.id || '');
  const [feeTypeId, setFeeTypeId] = useState<string>(feeTypes[0]?.id || '');
  const [amount, setAmount] = useState<number>(feeTypes[0]?.defaultAmount || 3000);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [generatingForId, setGeneratingForId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFeeTypeChange = (id: string) => {
    setFeeTypeId(id);
    const selected = feeTypes.find((f) => f.id === id);
    if (selected) {
      setAmount(selected.defaultAmount);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const selectedFee = feeTypes.find((f) => f.id === feeTypeId);
    if (!selectedFee) {
      setError('Please select a fee type.');
      return;
    }

    let targetName = '';
    if (targetType === 'class') {
      const cls = classes.find((c) => c.id === targetId);
      if (!cls) {
        setError('Please select a class.');
        return;
      }
      targetName = cls.name;
    } else {
      const stu = students.find((s) => s.id === targetId);
      if (!stu) {
        setError('Please select a student.');
        return;
      }
      targetName = `${stu.name} (${stu.rollNumber})`;
    }

    try {
      setIsSubmitting(true);
      await addFeeAssignment({
        feeTypeId,
        feeTitle: selectedFee.title,
        targetType,
        targetId,
        targetName,
        amount: Number(amount),
        dueDate,
        notes
      });
      onShowToast(`Fee schedule assigned to ${targetName}.`);
      setIsSubmitting(false);
      setIsModalOpen(false);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Error creating fee schedule');
    }
  };

  // Instant trigger to generate challans from this assignment rule
  const handleGenerateChallans = async (assignment: FeeAssignment) => {
    try {
      setGeneratingForId(assignment.id);

      if (assignment.targetType === 'class') {
        const classStudents = students.filter(
          (s) => s.classId === assignment.targetId && s.status === 'Active'
        );
        if (classStudents.length === 0) {
          alert('No active students found in this class.');
          setGeneratingForId(null);
          return;
        }

        const count = await createBatchChallans(
          classStudents,
          [
            {
              feeTypeId: assignment.feeTypeId,
              feeTitle: assignment.feeTitle,
              amount: assignment.amount,
              description: assignment.notes || 'Scheduled Fee'
            }
          ],
          assignment.dueDate,
          0,
          0,
          assignment.notes
        );

        onShowToast(`Successfully generated ${count} challans for ${assignment.targetName}!`);
      } else {
        const student = students.find((s) => s.id === assignment.targetId);
        if (!student) {
          alert('Student not found.');
          setGeneratingForId(null);
          return;
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
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: assignment.dueDate,
          items: [
            {
              feeTypeId: assignment.feeTypeId,
              feeTitle: assignment.feeTitle,
              amount: assignment.amount,
              description: assignment.notes || 'Scheduled Fee'
            }
          ],
          subtotal: assignment.amount,
          fine: 0,
          discount: 0,
          totalPayable: assignment.amount,
          paidAmount: 0,
          remainingAmount: assignment.amount,
          status: 'UNPAID',
          notes: assignment.notes
        });

        onShowToast(`Successfully generated Challan ${challanNumber} for ${student.name}!`);
      }

      setGeneratingForId(null);
    } catch (err) {
      console.error(err);
      onShowToast('Error generating challans');
      setGeneratingForId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFeeAssignment(id);
      onShowToast('Fee assignment rule removed.');
    } catch {
      onShowToast('Failed to delete assignment.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-400" />
            <span>Fee Assignment &amp; Automation</span>
          </h2>
          <p className="text-xs text-slate-400">
            Assign recurring or semester fees to entire classes or individual students with 1-click batch challan generation
          </p>
        </div>

        <button
          onClick={() => {
            setIsModalOpen(true);
            setError(null);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Fee Assignment</span>
        </button>
      </div>

      {/* Assignments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Fee Type</th>
                <th className="p-3">Target Scope</th>
                <th className="p-3">Target Name</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3">Due Date</th>
                <th className="p-3">Notes</th>
                <th className="p-3 text-right">Generate &amp; Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No fee assignments created yet. Assign a fee to a class or student to generate bulk challans.
                  </td>
                </tr>
              ) : (
                assignments.map((asg) => (
                  <tr key={asg.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-bold text-white">{asg.feeTitle}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                          asg.targetType === 'class'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {asg.targetType === 'class' ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        <span className="capitalize">{asg.targetType}</span>
                      </span>
                    </td>
                    <td className="p-3 text-slate-200 font-medium">{asg.targetName}</td>
                    <td className="p-3 text-right font-mono font-bold text-amber-400">
                      {formatCurrency(asg.amount)}
                    </td>
                    <td className="p-3 text-slate-400">{formatDate(asg.dueDate)}</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">{asg.notes || '—'}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleGenerateChallans(asg)}
                        disabled={generatingForId === asg.id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                        title="Generate Challans Now"
                      >
                        <Zap className="w-3 h-3 fill-slate-950" />
                        <span>{generatingForId === asg.id ? 'Issuing...' : 'Issue Challans'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(asg.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-950/50 text-rose-400 rounded cursor-pointer transition"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-slate-100 text-xs">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h2 className="text-base font-bold text-white">Create Fee Assignment Schedule</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mx-4 mt-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateAssignment} className="p-4 sm:p-5 space-y-4">
              {/* Target Type */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign Fee To</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('class');
                      setTargetId(classes[0]?.id || '');
                    }}
                    className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      targetType === 'class'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Entire Class</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('student');
                      setTargetId(students[0]?.id || '');
                    }}
                    className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      targetType === 'student'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Individual Student</span>
                  </button>
                </div>
              </div>

              {/* Target Select */}
              {targetType === 'class' ? (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Select Class / Program <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Select Student <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.rollNumber} - {s.name} ({s.className})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fee Type */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Fee Type <span className="text-rose-400">*</span>
                </label>
                <select
                  value={feeTypeId}
                  onChange={(e) => handleFeeTypeChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                >
                  {feeTypes.map((ft) => (
                    <option key={ft.id} value={ft.id}>
                      {ft.title} (Default: Rs. {ft.defaultAmount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Fee Amount (PKR) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
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
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Fall Semester Examination Fee"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
