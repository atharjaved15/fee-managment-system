import React, { useState, useMemo } from 'react';
import { Student, CollegeClass, StudentStatus, Challan, Payment, CollegeConfig } from '../types';
import { deleteStudent } from '../services/dbService';
import { exportToCSV, exportToExcel } from '../utils/exportUtils';
import { formatDate } from '../utils/formatters';
import { StudentModal } from './StudentModal';
import { StudentHistoryModal } from './StudentHistoryModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Eye,
  Receipt,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface StudentsViewProps {
  students: Student[];
  classes: CollegeClass[];
  challans: Challan[];
  payments: Payment[];
  config: CollegeConfig;
  onViewChallan: (challan: Challan) => void;
  onViewReceipt: (payment: Payment) => void;
  onRecordPayment: (challan: Challan) => void;
  onOpenGenerateChallan: (studentId?: string) => void;
  onShowToast: (message: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  classes,
  challans,
  payments,
  config,
  onViewChallan,
  onViewReceipt,
  onRecordPayment,
  onOpenGenerateChallan,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [historyStudent, setHistoryStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.phone && s.phone.includes(searchTerm));

      const matchesClass = selectedClassFilter === 'ALL' || s.classId === selectedClassFilter;
      const matchesStatus = selectedStatusFilter === 'ALL' || s.status === selectedStatusFilter;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchTerm, selectedClassFilter, selectedStatusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const handleDelete = async () => {
    if (!deletingStudent) return;
    try {
      await deleteStudent(deletingStudent.id);
      onShowToast(`Student ${deletingStudent.name} removed successfully.`);
      setDeletingStudent(null);
    } catch {
      onShowToast('Failed to delete student.');
    }
  };

  const handleExportCSV = () => {
    const data = filteredStudents.map((s) => ({
      'Student ID': s.studentId,
      'Roll Number': s.rollNumber,
      'Registration Number': s.registrationNumber || '',
      'Student Name': s.name,
      'Father Name': s.fatherName,
      'Class': s.className,
      'Section': s.section || '',
      'Phone': s.phone || '',
      'Parent Phone': s.parentPhone || '',
      'CNIC': s.cnic || '',
      'Status': s.status,
      'Admission Date': s.admissionDate
    }));
    exportToCSV(data, `Students_Sarhad_Physio_Mailsi_${new Date().toISOString().split('T')[0]}`);
  };

  const handleExportExcel = () => {
    const data = filteredStudents.map((s) => ({
      'Student ID': s.studentId,
      'Roll Number': s.rollNumber,
      'Student Name': s.name,
      'Father Name': s.fatherName,
      'Class': s.className,
      'Phone': s.phone || '',
      'Status': s.status,
      'Admission Date': s.admissionDate
    }));
    exportToExcel(data, `Students_Export_${new Date().toISOString().split('T')[0]}`, 'Students');
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Student Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Registered students of Sarhad University SSC & The Physio College Mailsi
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
            <span>Excel (.xlsx)</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Roll No, ID, Phone..."
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
            <option value="ALL">All Classes & Programs</option>
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
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Graduated">Graduated</option>
            <option value="Left College">Left College</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Student ID</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Father's Name</th>
                <th className="p-3">Class / Program</th>
                <th className="p-3">Phone</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    {students.length === 0 ? (
                      <div className="py-6 space-y-3">
                        <Users className="w-10 h-10 mx-auto text-slate-600" />
                        <p className="text-sm font-semibold text-slate-300">No students registered in the system yet.</p>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Click "Add Student" above to enroll your first student, or use "Add Dummy Data" in the top bar to preview sample records.
                        </p>
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Enroll First Student</span>
                        </button>
                      </div>
                    ) : (
                      'No students match your query. Try adjusting your search or filters.'
                    )}
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-slate-400 font-semibold">{s.studentId}</td>
                    <td className="p-3 font-mono font-bold text-amber-400">{s.rollNumber}</td>
                    <td className="p-3">
                      <span className="font-bold text-white block">{s.name}</span>
                      {s.section && <span className="text-[10px] text-slate-400">{s.section}</span>}
                    </td>
                    <td className="p-3 text-slate-300">{s.fatherName}</td>
                    <td className="p-3 text-slate-200">{s.className}</td>
                    <td className="p-3 text-slate-400">{s.phone || '—'}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          s.status === 'Active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : s.status === 'Graduated'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      {/* View Ledger / Fee History */}
                      <button
                        onClick={() => setHistoryStudent(s)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-md transition cursor-pointer"
                        title="View Fee History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Generate Challan directly for this student */}
                      <button
                        onClick={() => onOpenGenerateChallan(s.id)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-md transition cursor-pointer"
                        title="Generate Challan"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => setEditingStudent(s)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition cursor-pointer"
                        title="Edit Student"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeletingStudent(s)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-950/60 text-rose-400 rounded-md transition cursor-pointer"
                        title="Delete Student"
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

        {/* Pagination Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span>
            Showing {filteredStudents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredStudents.length)} of {filteredStudents.length} students
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

      {/* Add / Edit Student Modal */}
      {(isAddModalOpen || editingStudent) && (
        <StudentModal
          classes={classes}
          student={editingStudent}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingStudent(null);
          }}
          onSuccess={(msg) => onShowToast(msg)}
        />
      )}

      {/* Student Fee History Modal */}
      {historyStudent && (
        <StudentHistoryModal
          student={historyStudent}
          challans={challans}
          payments={payments}
          config={config}
          onClose={() => setHistoryStudent(null)}
          onViewChallan={(c) => onViewChallan(c)}
          onViewReceipt={(p) => onViewReceipt(p)}
          onRecordPayment={(c) => onRecordPayment(c)}
          onGenerateChallanForStudent={(s) => {
            setHistoryStudent(null);
            onOpenGenerateChallan(s.id);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl text-slate-100 text-xs space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Delete Student Confirmation</h3>
            </div>
            <p className="text-slate-300">
              Are you sure you want to delete student <strong>{deletingStudent.name}</strong> ({deletingStudent.rollNumber})?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeletingStudent(null)}
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
