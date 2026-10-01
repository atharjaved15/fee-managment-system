import React, { useState } from 'react';
import { CollegeClass, Student } from '../types';
import { addClass, updateClass, deleteClass } from '../services/dbService';
import { GraduationCap, Plus, Edit2, Trash2, Users, AlertCircle, Save, X } from 'lucide-react';

interface ClassesViewProps {
  classes: CollegeClass[];
  students: Student[];
  onShowToast: (message: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ classes, students, onShowToast }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<CollegeClass | null>(null);

  // Form states
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [session, setSession] = useState<string>('2026-27');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingClass, setDeletingClass] = useState<CollegeClass | null>(null);

  const openAddModal = () => {
    setEditingClass(null);
    setName('');
    setCode('');
    setSession('2026-27');
    setDescription('');
    setStatus('active');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: CollegeClass) => {
    setEditingClass(c);
    setName(c.name);
    setCode(c.code);
    setSession(c.session);
    setDescription(c.description || '');
    setStatus(c.status);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !code.trim() || !session.trim()) {
      setError('Class Name, Code, and Session are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingClass) {
        await updateClass(editingClass.id, {
          name: name.trim(),
          code: code.trim(),
          session: session.trim(),
          description: description.trim(),
          status
        });
        onShowToast(`Updated class: ${name}`);
      } else {
        await addClass({
          name: name.trim(),
          code: code.trim(),
          session: session.trim(),
          description: description.trim(),
          status
        });
        onShowToast(`Added new class: ${name}`);
      }
      setIsSubmitting(false);
      setIsModalOpen(false);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Error saving class');
    }
  };

  const handleDelete = async () => {
    if (!deletingClass) return;
    const enrolledStudents = students.filter((s) => s.classId === deletingClass.id);
    if (enrolledStudents.length > 0) {
      alert(`Cannot delete this class: ${enrolledStudents.length} student(s) are currently enrolled in it.`);
      setDeletingClass(null);
      return;
    }

    try {
      await deleteClass(deletingClass.id);
      onShowToast(`Class ${deletingClass.name} deleted.`);
      setDeletingClass(null);
    } catch {
      onShowToast('Failed to delete class.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-amber-400" />
            <span>Class &amp; Program Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Define degree programs, semesters, and sessions (e.g. DPT, BS-MLT, Diplomas)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Class</span>
        </button>
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">
            No classes defined yet. Click "Add New Class" to create one.
          </div>
        ) : (
          classes.map((cls) => {
            const studentCount = students.filter((s) => s.classId === cls.id).length;
            return (
              <div
                key={cls.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                      {cls.code}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        cls.status === 'active'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {cls.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{cls.name}</h3>
                  <p className="text-xs text-slate-400 mb-2">
                    Session / Batch: <strong className="text-slate-200">{cls.session}</strong>
                  </p>
                  {cls.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{cls.description}</p>}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{studentCount} Students</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cls)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
                      title="Edit Class"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingClass(cls)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-950/50 text-rose-400 rounded cursor-pointer"
                      title="Delete Class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-slate-100 text-xs">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h2 className="text-base font-bold text-white">
                {editingClass ? 'Edit Class / Program' : 'Create Class / Program'}
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
                  Class / Program Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Doctor of Physical Therapy (DPT) 1st Sem"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Class Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DPT-01"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Session / Batch <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-31"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Degree Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 5-year undergraduate physical therapy program"
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
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
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
                  <span>{isSubmitting ? 'Saving...' : editingClass ? 'Save Changes' : 'Create Class'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingClass && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl text-slate-100 text-xs space-y-4">
            <h3 className="text-base font-bold text-white">Delete Class</h3>
            <p className="text-slate-300">
              Are you sure you want to delete class <strong>{deletingClass.name}</strong> ({deletingClass.code})?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeletingClass(null)}
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
