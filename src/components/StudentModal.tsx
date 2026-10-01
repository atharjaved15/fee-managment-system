import React, { useState } from 'react';
import { Student, CollegeClass, StudentStatus } from '../types';
import { addStudent, updateStudent } from '../services/dbService';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

interface StudentModalProps {
  classes: CollegeClass[];
  student?: Student | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  classes,
  student,
  onClose,
  onSuccess
}) => {
  const isEditing = !!student;

  const [studentId, setStudentId] = useState<string>(student?.studentId || `STU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`);
  const [rollNumber, setRollNumber] = useState<string>(student?.rollNumber || '');
  const [registrationNumber, setRegistrationNumber] = useState<string>(student?.registrationNumber || '');
  const [name, setName] = useState<string>(student?.name || '');
  const [fatherName, setFatherName] = useState<string>(student?.fatherName || '');
  const [cnic, setCnic] = useState<string>(student?.cnic || '');
  const [dob, setDob] = useState<string>(student?.dob || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(student?.gender || 'Male');
  const [classId, setClassId] = useState<string>(student?.classId || classes[0]?.id || '');
  const [section, setSection] = useState<string>(student?.section || 'Morning');
  const [phone, setPhone] = useState<string>(student?.phone || '');
  const [parentPhone, setParentPhone] = useState<string>(student?.parentPhone || '');
  const [address, setAddress] = useState<string>(student?.address || '');
  const [admissionDate, setAdmissionDate] = useState<string>(student?.admissionDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<StudentStatus>(student?.status || 'Active');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !fatherName.trim() || !rollNumber.trim() || !classId) {
      setError('Student Name, Father Name, Roll Number, and Class are required.');
      return;
    }

    const selectedClass = classes.find((c) => c.id === classId);
    const className = selectedClass ? selectedClass.name : '';

    const payload = {
      studentId: studentId.trim(),
      rollNumber: rollNumber.trim(),
      registrationNumber: registrationNumber.trim(),
      name: name.trim(),
      fatherName: fatherName.trim(),
      cnic: cnic.trim(),
      dob,
      gender,
      classId,
      className,
      section: section.trim(),
      phone: phone.trim(),
      parentPhone: parentPhone.trim(),
      address: address.trim(),
      admissionDate,
      status
    };

    try {
      setIsSubmitting(true);
      if (isEditing && student) {
        await updateStudent(student.id, payload);
        onSuccess(`Updated student: ${name}`);
      } else {
        await addStudent(payload);
        onSuccess(`Added new student: ${name}`);
      }
      setIsSubmitting(false);
      onClose();
    } catch (err: unknown) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : 'Error saving student');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{isEditing ? 'Edit Student' : 'Add New Student'}</h2>
              <p className="text-xs text-slate-400">Enroll student in college record</p>
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
          {/* Row 1: IDs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Student ID <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Roll Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. DPT-01-24"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Registration No</label>
              <input
                type="text"
                placeholder="e.g. SU-MLSI-2026-01"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Row 2: Name & Father's Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Student Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Muhammad ..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Father's Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Father's name"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
          </div>

          {/* Row 3: Class, Section, Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Class / Program <span className="text-rose-400">*</span>
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
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
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Section / Batch</label>
              <input
                type="text"
                placeholder="e.g. Morning A"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 4: Phone & Parent Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Student Phone</label>
              <input
                type="text"
                placeholder="03xx xxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Parent / Guardian Phone</label>
              <input
                type="text"
                placeholder="03xx xxxxxxx"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Row 5: CNIC & DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">CNIC / B-Form</label>
              <input
                type="text"
                placeholder="36602-xxxxxxx-x"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Admission Date</label>
              <input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Row 6: Address & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Residential Address</label>
              <input
                type="text"
                placeholder="Street, Mohallah, Tehsil Mailsi, District Vehari"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentStatus)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Graduated">Graduated</option>
                <option value="Left College">Left College</option>
              </select>
            </div>
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
              className="inline-flex items-center gap-1.5 px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Student'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
