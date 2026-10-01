export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Online Transfer' | 'JazzCash' | 'EasyPaisa' | 'Other';

export type StudentStatus = 'Active' | 'Inactive' | 'Graduated' | 'Left College';

export type FeeFrequency = 'One Time' | 'Monthly' | 'Quarterly' | 'Semester' | 'Annual' | 'Custom';

export interface CollegeConfig {
  universityName: string;
  collegeName: string;
  phone: string;
  address: string;
  email: string;
  website: string;
  logoUrl?: string;
  footerNote?: string;
  bankName?: string;
  accountTitle?: string;
  accountNumber?: string;
  challanInstructions?: string[];
}

export interface CollegeClass {
  id: string;
  name: string;
  code: string;
  session: string;
  description?: string;
  status: 'active' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  studentId: string;
  rollNumber: string;
  registrationNumber?: string;
  name: string;
  fatherName: string;
  cnic?: string;
  dob?: string;
  gender: 'Male' | 'Female' | 'Other';
  classId: string;
  className: string;
  section?: string;
  phone: string;
  parentPhone?: string;
  address: string;
  admissionDate: string;
  status: StudentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeeType {
  id: string;
  title: string;
  code: string;
  description?: string;
  defaultAmount: number;
  frequency: FeeFrequency;
  status: 'Active' | 'Inactive';
  createdAt?: string;
}

export interface FeeAssignment {
  id: string;
  feeTypeId: string;
  feeTitle: string;
  targetType: 'class' | 'student';
  targetId: string;
  targetName: string;
  amount: number;
  dueDate: string;
  session?: string;
  notes?: string;
  createdAt?: string;
}

export interface ChallanItem {
  feeTypeId?: string;
  feeTitle: string;
  description?: string;
  amount: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  studentId: string;
  studentName: string;
  fatherName: string;
  rollNumber: string;
  classId: string;
  className: string;
  session?: string;
  issueDate: string;
  dueDate: string;
  items: ChallanItem[];
  subtotal: number;
  fine: number;
  discount: number;
  totalPayable: number;
  paidAmount: number;
  remainingAmount: number;
  status: PaymentStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  challanId: string;
  challanNumber: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  classId?: string;
  className: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentDate: string;
  receivedBy: string;
  status: 'PAID' | 'CANCELLED';
  notes?: string;
  createdAt?: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'super_admin' | 'accountant' | 'staff';
}
