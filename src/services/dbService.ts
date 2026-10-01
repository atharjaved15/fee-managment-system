import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import {
  CollegeClass,
  Student,
  FeeType,
  FeeAssignment,
  Challan,
  Payment,
  CollegeConfig,
  ChallanItem
} from '../types';
import { COLLEGE_CONFIG } from '../config/collegeConfig';
import { generateChallanNumber, generateReceiptNumber } from '../utils/formatters';

// Collection references
const CLASSES_COL = 'classes';
const STUDENTS_COL = 'students';
const FEE_TYPES_COL = 'feeTypes';
const FEE_ASSIGNMENTS_COL = 'feeAssignments';
const CHALLANS_COL = 'challans';
const PAYMENTS_COL = 'payments';
const SETTINGS_COL = 'settings';

/* =========================================================================
   SETTINGS OPERATIONS
   ========================================================================= */

export async function getCollegeSettings(): Promise<CollegeConfig> {
  const path = `${SETTINGS_COL}/college`;
  try {
    const docRef = doc(db, SETTINGS_COL, 'college');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...COLLEGE_CONFIG, ...docSnap.data() } as CollegeConfig;
    }
    // Pre-populate with default branding
    await setDoc(docRef, { ...COLLEGE_CONFIG, updatedAt: new Date().toISOString() });
    return COLLEGE_CONFIG;
  } catch (error) {
    console.warn('Could not load settings from firestore, using COLLEGE_CONFIG:', error);
    return COLLEGE_CONFIG;
  }
}

export async function updateCollegeSettings(config: Partial<CollegeConfig>): Promise<void> {
  const path = `${SETTINGS_COL}/college`;
  try {
    const docRef = doc(db, SETTINGS_COL, 'college');
    await setDoc(docRef, { ...config, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/* =========================================================================
   CLASSES OPERATIONS
   ========================================================================= */

export function subscribeClasses(callback: (classes: CollegeClass[]) => void) {
  const q = query(collection(db, CLASSES_COL), orderBy('name', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CollegeClass));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, CLASSES_COL);
    }
  );
}

export async function addClass(data: Omit<CollegeClass, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, CLASSES_COL), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CLASSES_COL);
  }
}

export async function updateClass(id: string, data: Partial<CollegeClass>): Promise<void> {
  const path = `${CLASSES_COL}/${id}`;
  try {
    const docRef = doc(db, CLASSES_COL, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteClass(id: string): Promise<void> {
  const path = `${CLASSES_COL}/${id}`;
  try {
    await deleteDoc(doc(db, CLASSES_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/* =========================================================================
   STUDENTS OPERATIONS
   ========================================================================= */

export function subscribeStudents(callback: (students: Student[]) => void) {
  const q = query(collection(db, STUDENTS_COL), orderBy('rollNumber', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Student));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, STUDENTS_COL);
    }
  );
}

export async function addStudent(data: Omit<Student, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, STUDENTS_COL), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, STUDENTS_COL);
  }
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<void> {
  const path = `${STUDENTS_COL}/${id}`;
  try {
    const docRef = doc(db, STUDENTS_COL, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteStudent(id: string): Promise<void> {
  const path = `${STUDENTS_COL}/${id}`;
  try {
    await deleteDoc(doc(db, STUDENTS_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/* =========================================================================
   FEE TYPES OPERATIONS
   ========================================================================= */

export function subscribeFeeTypes(callback: (types: FeeType[]) => void) {
  const q = query(collection(db, FEE_TYPES_COL), orderBy('title', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FeeType));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, FEE_TYPES_COL);
    }
  );
}

export async function addFeeType(data: Omit<FeeType, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, FEE_TYPES_COL), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, FEE_TYPES_COL);
  }
}

export async function updateFeeType(id: string, data: Partial<FeeType>): Promise<void> {
  const path = `${FEE_TYPES_COL}/${id}`;
  try {
    const docRef = doc(db, FEE_TYPES_COL, id);
    await updateDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteFeeType(id: string): Promise<void> {
  const path = `${FEE_TYPES_COL}/${id}`;
  try {
    await deleteDoc(doc(db, FEE_TYPES_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/* =========================================================================
   FEE ASSIGNMENTS OPERATIONS
   ========================================================================= */

export function subscribeFeeAssignments(callback: (assignments: FeeAssignment[]) => void) {
  const q = query(collection(db, FEE_ASSIGNMENTS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as FeeAssignment));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, FEE_ASSIGNMENTS_COL);
    }
  );
}

export async function addFeeAssignment(data: Omit<FeeAssignment, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, FEE_ASSIGNMENTS_COL), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, FEE_ASSIGNMENTS_COL);
  }
}

export async function deleteFeeAssignment(id: string): Promise<void> {
  const path = `${FEE_ASSIGNMENTS_COL}/${id}`;
  try {
    await deleteDoc(doc(db, FEE_ASSIGNMENTS_COL, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/* =========================================================================
   CHALLANS OPERATIONS
   ========================================================================= */

export function subscribeChallans(callback: (challans: Challan[]) => void) {
  const q = query(collection(db, CHALLANS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Challan));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, CHALLANS_COL);
    }
  );
}

export async function createChallan(data: Omit<Challan, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, CHALLANS_COL), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CHALLANS_COL);
  }
}

export async function createBatchChallans(
  students: Student[],
  items: ChallanItem[],
  dueDate: string,
  fine: number = 0,
  discount: number = 0,
  notes?: string
): Promise<number> {
  try {
    const existingSnap = await getDocs(collection(db, CHALLANS_COL));
    let count = existingSnap.size;

    const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalPayable = Math.max(0, subtotal + (Number(fine) || 0) - (Number(discount) || 0));

    let createdCount = 0;
    for (const student of students) {
      count++;
      const challanNumber = generateChallanNumber(count);
      await addDoc(collection(db, CHALLANS_COL), {
        challanNumber,
        studentId: student.id,
        studentName: student.name,
        fatherName: student.fatherName,
        rollNumber: student.rollNumber,
        classId: student.classId,
        className: student.className,
        session: student.section || '2026-27',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate,
        items,
        subtotal,
        fine,
        discount,
        totalPayable,
        paidAmount: 0,
        remainingAmount: totalPayable,
        status: 'UNPAID',
        notes: notes || 'Please pay the fee before the due date.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      createdCount++;
    }
    return createdCount;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, CHALLANS_COL);
  }
}

export async function updateChallan(id: string, data: Partial<Challan>): Promise<void> {
  const path = `${CHALLANS_COL}/${id}`;
  try {
    const docRef = doc(db, CHALLANS_COL, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function cancelChallan(id: string): Promise<void> {
  const path = `${CHALLANS_COL}/${id}`;
  try {
    const docRef = doc(db, CHALLANS_COL, id);
    await updateDoc(docRef, {
      status: 'CANCELLED',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/* =========================================================================
   PAYMENT & RECEIPT OPERATIONS (ATOMIC)
   ========================================================================= */

export function subscribePayments(callback: (payments: Payment[]) => void) {
  const q = query(collection(db, PAYMENTS_COL), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, PAYMENTS_COL);
    }
  );
}

export async function recordPayment(paymentData: {
  challanId: string;
  amountPaid: number;
  paymentMethod: Payment['paymentMethod'];
  transactionId?: string;
  paymentDate: string;
  receivedBy: string;
  notes?: string;
}): Promise<string> {
  const challanRef = doc(db, CHALLANS_COL, paymentData.challanId);
  const paymentsColRef = collection(db, PAYMENTS_COL);

  try {
    const newPaymentId = await runTransaction(db, async (transaction) => {
      const challanDoc = await transaction.get(challanRef);
      if (!challanDoc.exists()) {
        throw new Error('Challan does not exist');
      }

      const challan = challanDoc.data() as Challan;
      const currentPaid = Number(challan.paidAmount) || 0;
      const newPaidTotal = currentPaid + Number(paymentData.amountPaid);
      const remaining = Math.max(0, challan.totalPayable - newPaidTotal);

      let newStatus: Challan['status'] = 'PARTIAL';
      if (remaining === 0) {
        newStatus = 'PAID';
      } else if (newPaidTotal === 0) {
        newStatus = 'UNPAID';
      }

      // Generate receipt number
      const paymentsSnap = await getDocs(paymentsColRef);
      const receiptNumber = generateReceiptNumber(paymentsSnap.size);

      // Create Payment Doc
      const newPaymentDocRef = doc(paymentsColRef);
      transaction.set(newPaymentDocRef, {
        receiptNumber,
        challanId: challanDoc.id,
        challanNumber: challan.challanNumber,
        studentId: challan.studentId,
        studentName: challan.studentName,
        rollNumber: challan.rollNumber,
        className: challan.className,
        amountPaid: Number(paymentData.amountPaid),
        paymentMethod: paymentData.paymentMethod,
        transactionId: paymentData.transactionId || '',
        paymentDate: paymentData.paymentDate,
        receivedBy: paymentData.receivedBy,
        status: 'PAID',
        notes: paymentData.notes || '',
        createdAt: new Date().toISOString()
      });

      // Update Challan
      transaction.update(challanRef, {
        paidAmount: newPaidTotal,
        remainingAmount: remaining,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      return newPaymentDocRef.id;
    });

    return newPaymentId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PAYMENTS_COL);
  }
}

export async function cancelPayment(paymentId: string, challanId: string): Promise<void> {
  const paymentRef = doc(db, PAYMENTS_COL, paymentId);
  const challanRef = doc(db, CHALLANS_COL, challanId);

  try {
    await runTransaction(db, async (transaction) => {
      const paymentDoc = await transaction.get(paymentRef);
      const challanDoc = await transaction.get(challanRef);

      if (!paymentDoc.exists() || !challanDoc.exists()) {
        throw new Error('Record not found');
      }

      const payment = paymentDoc.data() as Payment;
      if (payment.status === 'CANCELLED') {
        return;
      }

      const challan = challanDoc.data() as Challan;
      const currentPaid = Number(challan.paidAmount) || 0;
      const newPaidTotal = Math.max(0, currentPaid - Number(payment.amountPaid));
      const remaining = Math.max(0, challan.totalPayable - newPaidTotal);

      let newStatus: Challan['status'] = 'UNPAID';
      if (newPaidTotal > 0 && remaining > 0) {
        newStatus = 'PARTIAL';
      } else if (remaining === 0) {
        newStatus = 'PAID';
      }

      transaction.update(paymentRef, {
        status: 'CANCELLED',
        notes: `${payment.notes ? payment.notes + ' ' : ''}[Cancelled on ${new Date().toISOString()}]`
      });

      transaction.update(challanRef, {
        paidAmount: newPaidTotal,
        remainingAmount: remaining,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, PAYMENTS_COL);
  }
}

/* =========================================================================
   DEMO DATA SEEDING & RESET
   ========================================================================= */

export async function seedDemoData(): Promise<void> {
  try {
    // 1. Classes
    const class1Ref = await addDoc(collection(db, CLASSES_COL), {
      name: 'Doctor of Physical Therapy (DPT) 1st Sem',
      code: 'DPT-01',
      session: '2026-31',
      description: '5-Year Degree Program in Physical Therapy affiliated with Sarhad University',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const class2Ref = await addDoc(collection(db, CLASSES_COL), {
      name: 'Doctor of Physical Therapy (DPT) 3rd Sem',
      code: 'DPT-03',
      session: '2025-30',
      description: 'Semester 3 Clinical & Musculoskeletal Studies',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const class3Ref = await addDoc(collection(db, CLASSES_COL), {
      name: 'BS Medical Lab Technology (BS-MLT)',
      code: 'MLT-01',
      session: '2026-30',
      description: '4-Year Allied Health Sciences Degree Program',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 2. Fee Types
    const fee1Ref = await addDoc(collection(db, FEE_TYPES_COL), {
      title: 'Monthly Tuition Fee',
      code: 'FEE-MONTHLY',
      description: 'Standard monthly academic tuition fee',
      defaultAmount: 3500,
      frequency: 'Monthly',
      status: 'Active',
      createdAt: new Date().toISOString()
    });

    const fee2Ref = await addDoc(collection(db, FEE_TYPES_COL), {
      title: 'Semester Admission Fee',
      code: 'FEE-ADM',
      description: 'One-time admission & enrollment charge',
      defaultAmount: 15000,
      frequency: 'One Time',
      status: 'Active',
      createdAt: new Date().toISOString()
    });

    const fee3Ref = await addDoc(collection(db, FEE_TYPES_COL), {
      title: 'Clinical Lab & Anatomy Charges',
      code: 'FEE-LAB',
      description: 'Practical lab & dissection kit access',
      defaultAmount: 2000,
      frequency: 'Semester',
      status: 'Active',
      createdAt: new Date().toISOString()
    });

    const fee4Ref = await addDoc(collection(db, FEE_TYPES_COL), {
      title: 'Educational Study Trip Fee',
      code: 'FEE-TRIP',
      description: 'Hospital observation visit to Lahore / Multan',
      defaultAmount: 3000,
      frequency: 'Custom',
      status: 'Active',
      createdAt: new Date().toISOString()
    });

    const fee5Ref = await addDoc(collection(db, FEE_TYPES_COL), {
      title: 'Late Submission Fine',
      code: 'FEE-FINE',
      description: 'Disciplinary surcharge for overdue payments',
      defaultAmount: 500,
      frequency: 'Custom',
      status: 'Active',
      createdAt: new Date().toISOString()
    });

    // 3. Students
    const student1Ref = await addDoc(collection(db, STUDENTS_COL), {
      studentId: 'STU-2026-001',
      rollNumber: 'DPT-01-01',
      registrationNumber: 'SU-MLSI-2026-081',
      name: 'Muhammad Hamza',
      fatherName: 'Tariq Mehmood',
      cnic: '36602-1234567-1',
      dob: '2004-03-12',
      gender: 'Male',
      classId: class1Ref.id,
      className: 'Doctor of Physical Therapy (DPT) 1st Sem',
      section: 'Morning A',
      phone: '0300 7654321',
      parentPhone: '0301 9876543',
      address: 'Near Old Bus Stand, Vehari Road, Mailsi',
      admissionDate: '2026-01-15',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const student2Ref = await addDoc(collection(db, STUDENTS_COL), {
      studentId: 'STU-2026-002',
      rollNumber: 'DPT-01-02',
      registrationNumber: 'SU-MLSI-2026-082',
      name: 'Ayesha Bibi',
      fatherName: 'Muhammad Akram',
      cnic: '36602-7654321-2',
      dob: '2005-07-22',
      gender: 'Female',
      classId: class1Ref.id,
      className: 'Doctor of Physical Therapy (DPT) 1st Sem',
      section: 'Morning A',
      phone: '0312 3456789',
      parentPhone: '0302 1234567',
      address: 'Colony No. 2, Faddah Chungi, Mailsi',
      admissionDate: '2026-01-18',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const student3Ref = await addDoc(collection(db, STUDENTS_COL), {
      studentId: 'STU-2026-003',
      rollNumber: 'DPT-03-05',
      registrationNumber: 'SU-MLSI-2025-045',
      name: 'Zeeshan Ali',
      fatherName: 'Liaquat Ali',
      cnic: '36602-5554321-3',
      dob: '2003-11-05',
      gender: 'Male',
      classId: class2Ref.id,
      className: 'Doctor of Physical Therapy (DPT) 3rd Sem',
      section: 'Section B',
      phone: '0321 8765432',
      parentPhone: '0300 1122334',
      address: 'Main Bazaar Mailsi, District Vehari',
      admissionDate: '2025-02-10',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const student4Ref = await addDoc(collection(db, STUDENTS_COL), {
      studentId: 'STU-2026-004',
      rollNumber: 'MLT-01-09',
      registrationNumber: 'SU-MLSI-2026-104',
      name: 'Fatima Noor',
      fatherName: 'Ghulam Rasool',
      cnic: '36602-9988776-4',
      dob: '2004-09-14',
      gender: 'Female',
      classId: class3Ref.id,
      className: 'BS Medical Lab Technology (BS-MLT)',
      section: 'Morning A',
      phone: '0345 6789012',
      parentPhone: '0323 8899001',
      address: 'Chowk Mitro, Tehsil Mailsi',
      admissionDate: '2026-02-01',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const student5Ref = await addDoc(collection(db, STUDENTS_COL), {
      studentId: 'STU-2026-005',
      rollNumber: 'DPT-01-14',
      registrationNumber: 'SU-MLSI-2026-094',
      name: 'Bilal Hassan',
      fatherName: 'Hassan Raza',
      cnic: '36602-3344556-5',
      dob: '2003-05-30',
      gender: 'Male',
      classId: class1Ref.id,
      className: 'Doctor of Physical Therapy (DPT) 1st Sem',
      section: 'Morning A',
      phone: '0333 4455667',
      parentPhone: '0305 7788990',
      address: 'Quaid-e-Azam Road, Mailsi',
      admissionDate: '2026-01-20',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 4. Sample Challans
    // Challan 1: Muhammad Hamza - Paid
    const challan1Ref = await addDoc(collection(db, CHALLANS_COL), {
      challanNumber: 'CH-2026-000001',
      studentId: student1Ref.id,
      studentName: 'Muhammad Hamza',
      fatherName: 'Tariq Mehmood',
      rollNumber: 'DPT-01-01',
      classId: class1Ref.id,
      className: 'Doctor of Physical Therapy (DPT) 1st Sem',
      session: '2026-31',
      issueDate: '2026-10-01',
      dueDate: '2026-10-15',
      items: [
        { feeTitle: 'Monthly Tuition Fee', description: 'October 2026', amount: 3500 },
        { feeTitle: 'Clinical Lab & Anatomy Charges', description: 'Semester Lab Access', amount: 2000 }
      ],
      subtotal: 5500,
      fine: 0,
      discount: 500,
      totalPayable: 5000,
      paidAmount: 5000,
      remainingAmount: 0,
      status: 'PAID',
      notes: 'Fee deposited via Cash at College Accounts Office.',
      createdAt: '2026-10-01T08:00:00.000Z',
      updatedAt: '2026-10-01T09:30:00.000Z'
    });

    // Payment for Challan 1
    await addDoc(collection(db, PAYMENTS_COL), {
      receiptNumber: 'REC-2026-000001',
      challanId: challan1Ref.id,
      challanNumber: 'CH-2026-000001',
      studentId: student1Ref.id,
      studentName: 'Muhammad Hamza',
      rollNumber: 'DPT-01-01',
      className: 'Doctor of Physical Therapy (DPT) 1st Sem',
      amountPaid: 5000,
      paymentMethod: 'Cash',
      transactionId: 'CSH-1029',
      paymentDate: '2026-10-01',
      receivedBy: 'Accountant Sarhad SSC Mailsi',
      status: 'PAID',
      notes: 'Full payment received against Challan CH-2026-000001.',
      createdAt: '2026-10-01T09:30:00.000Z'
    });

    // Challan 2: Ayesha Bibi - Partial Payment
    const challan2Ref = await addDoc(collection(db, CHALLANS_COL), {
      challanNumber: 'CH-2026-000002',
      studentId: student2Ref.id,
      studentName: 'Ayesha Bibi',
      fatherName: 'Muhammad Akram',
      rollNumber: 'DPT-01-02',
      classId: class1Ref.id,
      className: 'Doctor of Physical Therapy (DPT) 1st Sem',
      session: '2026-31',
      issueDate: '2026-10-01',
      dueDate: '2026-10-15',
      items: [
        { feeTitle: 'Monthly Tuition Fee', description: 'October 2026', amount: 3500 },
        { feeTitle: 'Educational Study Trip Fee', description: 'Multan Hospital Visit', amount: 3000 }
      ],
      subtotal: 6500,
      fine: 0,
      discount: 0,
      totalPayable: 6500,
      paidAmount: 4000,
      remainingAmount: 2500,
      status: 'PARTIAL',
      notes: 'First installment paid via JazzCash.',
      createdAt: '2026-10-01T08:30:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z'
    });

    // Payment for Challan 2
    await addDoc(collection(db, PAYMENTS_COL), {
      receiptNumber: 'REC-2026-000002',
      challanId: challan2Ref.id,
      challanNumber: 'CH-2026-000002',
      studentId: student2Ref.id,
      studentName: 'Ayesha Bibi',
      rollNumber: 'DPT-01-02',
      className: 'Doctor of Physical Therapy (DPT) 1st Sem',
      amountPaid: 4000,
      paymentMethod: 'JazzCash',
      transactionId: 'JC-88392019',
      paymentDate: '2026-10-01',
      receivedBy: 'Admin Office',
      status: 'PAID',
      notes: 'Partial payment received. Remaining balance: Rs. 2,500.',
      createdAt: '2026-10-01T10:00:00.000Z'
    });

    // Challan 3: Zeeshan Ali - Unpaid
    await addDoc(collection(db, CHALLANS_COL), {
      challanNumber: 'CH-2026-000003',
      studentId: student3Ref.id,
      studentName: 'Zeeshan Ali',
      fatherName: 'Liaquat Ali',
      rollNumber: 'DPT-03-05',
      classId: class2Ref.id,
      className: 'Doctor of Physical Therapy (DPT) 3rd Sem',
      session: '2025-30',
      issueDate: '2026-10-01',
      dueDate: '2026-10-12',
      items: [
        { feeTitle: 'Monthly Tuition Fee', description: 'October 2026', amount: 3500 },
        { feeTitle: 'Late Submission Fine', description: 'September Due', amount: 500 }
      ],
      subtotal: 4000,
      fine: 500,
      discount: 0,
      totalPayable: 4500,
      paidAmount: 0,
      remainingAmount: 4500,
      status: 'UNPAID',
      notes: 'Please clear dues before 12th October.',
      createdAt: '2026-10-01T09:00:00.000Z',
      updatedAt: '2026-10-01T09:00:00.000Z'
    });

    // Challan 4: Fatima Noor - Overdue
    await addDoc(collection(db, CHALLANS_COL), {
      challanNumber: 'CH-2026-000004',
      studentId: student4Ref.id,
      studentName: 'Fatima Noor',
      fatherName: 'Ghulam Rasool',
      rollNumber: 'MLT-01-09',
      classId: class3Ref.id,
      className: 'BS Medical Lab Technology (BS-MLT)',
      session: '2026-30',
      issueDate: '2026-09-01',
      dueDate: '2026-09-15',
      items: [
        { feeTitle: 'Monthly Tuition Fee', description: 'September 2026', amount: 3500 }
      ],
      subtotal: 3500,
      fine: 200,
      discount: 0,
      totalPayable: 3700,
      paidAmount: 0,
      remainingAmount: 3700,
      status: 'OVERDUE',
      notes: 'Due date expired. Surcharge added.',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-16T08:00:00.000Z'
    });

    console.log('Demo college data successfully seeded!');
  } catch (error) {
    console.error('Error seeding demo data:', error);
    handleFirestoreError(error, OperationType.WRITE, 'seedDemoData');
  }
}

export async function clearAllData(): Promise<void> {
  const collectionsToClear = [
    STUDENTS_COL,
    CLASSES_COL,
    FEE_TYPES_COL,
    FEE_ASSIGNMENTS_COL,
    CHALLANS_COL,
    PAYMENTS_COL
  ];

  try {
    for (const colName of collectionsToClear) {
      const snap = await getDocs(collection(db, colName));
      const deletePromises = snap.docs.map((docSnap) => deleteDoc(doc(db, colName, docSnap.id)));
      await Promise.all(deletePromises);
    }
    console.log('All dummy data successfully cleared from database!');
  } catch (error) {
    console.error('Error clearing data:', error);
    handleFirestoreError(error, OperationType.DELETE, 'clearAllData');
  }
}

