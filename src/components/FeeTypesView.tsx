import React, { useState } from 'react';
import { FeeType, FeeFrequency } from '../types';
import { addFeeType, updateFeeType, deleteFeeType } from '../services/dbService';
import { formatCurrency } from '../utils/formatters';
import { Layers, Plus, Edit2, Trash2, AlertCircle, Save, X, Tag } from 'lucide-react';

interface FeeTypesViewProps {
  feeTypes: FeeType[];
  onShowToast: (message: string) => void;
}

export const FeeTypesView: React.FC<FeeTypesViewProps> = ({ feeTypes, onShowToast }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingFeeType, setEditingFeeType] = useState<FeeType | null>(null);

  // Form
  const [title, setTitle] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [defaultAmount, setDefaultAmount] = useState<number>(3000);
  const [frequency, setFrequency] = useState<FeeFrequency>('Monthly');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingFeeType, setDeletingFeeType] = useState<FeeType | null>(null);

  const openAddModal = () => {
    setEditingFeeType(null);
    setTitle('');
    setCode('');
    setDescription('');
    setDefaultAmount(3000);
    setFrequency('Monthly');
    setStatus('Active');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ft: FeeType) => {
    setEditingFeeType(ft);
    setTitle(ft.title);
    setCode(ft.code);
    setDescription(ft.description || '');
    setDefaultAmount(ft.defaultAmount);
    setFrequency(ft.frequency);
    setStatus(ft.status);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !code.trim() || defaultAmount < 0) {
      setError('Fee Title, Code, and valid Default Amount are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingFeeType) {
        await updateFeeType(editingFeeType.id, {
          title: title.trim(),
          code: code.trim(),
          description: description.trim(),
          defaultAmount: Number(defaultAmount),
          frequency,
          status
        });
        onShowToast(`Updated fee type: ${title}`);
      } else {
        await addFeeType({
          title: title.trim(),
          code: code.trim(),
          description: description.trim(),
          defaultAmount: Number(defaultAmount),
          frequency,
          status
        });
        onShowToast(`Created new fee type: ${title}`);
      }
      setIsSubmitting(false);
      setIsModalOpen(false);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Error saving fee type');
    }
  };

  const handleDelete = async () => {
    if (!deletingFeeType) return;
    try {
      await deleteFeeType(deletingFeeType.id);
      onShowToast(`Fee type ${deletingFeeType.title} removed.`);
      setDeletingFeeType(null);
    } catch {
      onShowToast('Failed to delete fee type.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            <span>Custom Fee Type Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Define dynamic college fee categories (Monthly Fee, Trip Fee, Fine, Examination, Admission, Labs, etc.)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Fee Type</span>
        </button>
      </div>

      {/* Fee Types Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Fee Title</th>
                <th className="p-3">Fee Code</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Default Amount</th>
                <th className="p-3">Frequency</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {feeTypes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No fee types defined yet. Click "Create Fee Type" to add one.
                  </td>
                </tr>
              ) : (
                feeTypes.map((ft) => (
                  <tr key={ft.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold text-white">{ft.title}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-400">{ft.code}</td>
                    <td className="p-3 text-slate-400 max-w-xs truncate">{ft.description || '—'}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(ft.defaultAmount)}
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10.5px]">
                        {ft.frequency}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          ft.status === 'Active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ft.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(ft)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                        title="Edit Fee Type"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingFeeType(ft)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-950/50 text-rose-400 rounded cursor-pointer"
                        title="Delete Fee Type"
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
              <h2 className="text-base font-bold text-white">
                {editingFeeType ? 'Edit Fee Type' : 'Create Custom Fee Type'}
              </h2>
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

            <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Fee Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Tuition Fee, Trip Fee, Lab Fee"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Fee Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FEE-TRIP"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Default Amount (PKR) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="3000"
                    value={defaultAmount}
                    onChange={(e) => setDefaultAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as FeeFrequency)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="One Time">One Time</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Semester">Semester</option>
                  <option value="Annual">Annual</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Mandatory college study excursion"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                  <span>{isSubmitting ? 'Saving...' : editingFeeType ? 'Save Changes' : 'Create Fee Type'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingFeeType && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl text-slate-100 text-xs space-y-4">
            <h3 className="text-base font-bold text-white">Delete Fee Type</h3>
            <p className="text-slate-300">
              Are you sure you want to delete fee type <strong>{deletingFeeType.title}</strong>? Existing challans will retain their records.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeletingFeeType(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
