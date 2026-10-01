/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { COLLEGE_CONFIG } from './config/collegeConfig';
import {
  CollegeConfig,
  CollegeClass,
  Student,
  FeeType,
  FeeAssignment,
  Challan,
  Payment
} from './types';
import {
  getCollegeSettings,
  subscribeClasses,
  subscribeStudents,
  subscribeFeeTypes,
  subscribeFeeAssignments,
  subscribeChallans,
  subscribePayments,
  seedDemoData,
  clearAllData
} from './services/dbService';
import { testConnection } from './firebase/config';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { ClassesView } from './components/ClassesView';
import { FeeTypesView } from './components/FeeTypesView';
import { FeeAssignmentsView } from './components/FeeAssignmentsView';
import { ChallansView } from './components/ChallansView';
import { PaymentsView } from './components/PaymentsView';
import { ReceiptsView } from './components/ReceiptsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { PrintableChallan } from './components/PrintableChallan';
import { PrintableReceipt } from './components/PrintableReceipt';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { ChallanGeneratorModal } from './components/ChallanGeneratorModal';

function MainApp() {
  const { currentUser, loading: authLoading } = useAuth();

  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // College config & data states
  const [config, setConfig] = useState<CollegeConfig>(COLLEGE_CONFIG);
  const [classes, setClasses] = useState<CollegeClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [feeAssignments, setFeeAssignments] = useState<FeeAssignment[]>([]);
  const [challans, setChallans] = useState<Challan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Modals & Overlays
  const [viewingChallan, setViewingChallan] = useState<Challan | null>(null);
  const [viewingReceiptPayment, setViewingReceiptPayment] = useState<Payment | null>(null);
  const [payingChallan, setPayingChallan] = useState<Challan | null>(null);
  const [isGenerateChallanOpen, setIsGenerateChallanOpen] = useState<boolean>(false);
  const [generateChallanInitialStudentId, setGenerateChallanInitialStudentId] = useState<string | undefined>(undefined);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Test Firestore connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  // Load college config
  useEffect(() => {
    getCollegeSettings().then((cfg) => {
      setConfig(cfg);
    });
  }, []);

  // Setup Firestore real-time listeners only when authenticated
  useEffect(() => {
    if (!currentUser) return;

    const unsubClasses = subscribeClasses(setClasses);
    const unsubStudents = subscribeStudents(setStudents);
    const unsubFeeTypes = subscribeFeeTypes(setFeeTypes);
    const unsubAssignments = subscribeFeeAssignments(setFeeAssignments);
    const unsubChallans = subscribeChallans(setChallans);
    const unsubPayments = subscribePayments(setPayments);

    return () => {
      unsubClasses();
      unsubStudents();
      unsubFeeTypes();
      unsubAssignments();
      unsubChallans();
      unsubPayments();
    };
  }, [currentUser]);

  // Seed demo data handler
  const handleSeedDemoData = async () => {
    try {
      setIsSeeding(true);
      await seedDemoData();
      setIsSeeding(false);
      showToast('Sample college data (Classes, Students, Fee Types, Challans) loaded successfully!');
    } catch (err) {
      setIsSeeding(false);
      console.error(err);
      showToast('Failed to load sample data.');
    }
  };

  // Clear demo data handler
  const handleClearAllData = async () => {
    try {
      setIsClearing(true);
      await clearAllData();
      setIsClearing(false);
      showToast('All dummy records removed! System is clean for real college operations.');
    } catch (err) {
      setIsClearing(false);
      console.error(err);
      showToast('Failed to clear data.');
    }
  };

  // If auth is still resolving, show loader
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-400 rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide">Connecting to Sarhad &amp; Physio College Portal...</p>
      </div>
    );
  }

  // If not logged in, render the official college login view
  if (!currentUser) {
    return <LoginView config={config} onShowToast={showToast} />;
  }

  // Find challan for the payment being viewed as a receipt
  const paymentChallan = viewingReceiptPayment
    ? challans.find((c) => c.id === viewingReceiptPayment.challanId)
    : undefined;

  const hasData = classes.length > 0 || students.length > 0 || challans.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-orange-500/40 text-orange-200 px-4 py-3 rounded-xl shadow-2xl text-xs flex items-center gap-3 animate-fade-in no-print">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* Main College Header */}
      <Navbar
        config={config}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onSeedDemoData={handleSeedDemoData}
        isSeeding={isSeeding}
        onClearData={handleClearAllData}
        isClearing={isClearing}
        hasData={hasData}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          onOpenGenerateChallan={() => {
            setGenerateChallanInitialStudentId(undefined);
            setIsGenerateChallanOpen(true);
          }}
        />

        {/* Content View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView
              students={students}
              classes={classes}
              challans={challans}
              payments={payments}
              feeTypes={feeTypes}
              config={config}
              onSelectTab={setActiveTab}
              onOpenGenerateChallan={() => {
                setGenerateChallanInitialStudentId(undefined);
                setIsGenerateChallanOpen(true);
              }}
              onViewReceipt={(p) => setViewingReceiptPayment(p)}
              onViewChallan={(c) => setViewingChallan(c)}
              onRecordPayment={(c) => setPayingChallan(c)}
              onSeedDemoData={handleSeedDemoData}
              isSeeding={isSeeding}
              onClearData={handleClearAllData}
              isClearing={isClearing}
            />
          )}

          {activeTab === 'students' && (
            <StudentsView
              students={students}
              classes={classes}
              challans={challans}
              payments={payments}
              config={config}
              onViewChallan={(c) => setViewingChallan(c)}
              onViewReceipt={(p) => setViewingReceiptPayment(p)}
              onRecordPayment={(c) => setPayingChallan(c)}
              onOpenGenerateChallan={(studentId) => {
                setGenerateChallanInitialStudentId(studentId);
                setIsGenerateChallanOpen(true);
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'classes' && (
            <ClassesView
              classes={classes}
              students={students}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'feeTypes' && (
            <FeeTypesView
              feeTypes={feeTypes}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'feeAssignments' && (
            <FeeAssignmentsView
              assignments={feeAssignments}
              classes={classes}
              students={students}
              feeTypes={feeTypes}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'challans' && (
            <ChallansView
              challans={challans}
              classes={classes}
              onViewChallan={(c) => setViewingChallan(c)}
              onRecordPayment={(c) => setPayingChallan(c)}
              onOpenGenerateChallan={() => {
                setGenerateChallanInitialStudentId(undefined);
                setIsGenerateChallanOpen(true);
              }}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              payments={payments}
              challans={challans}
              onViewReceipt={(p) => setViewingReceiptPayment(p)}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'receipts' && (
            <ReceiptsView
              payments={payments}
              onViewReceipt={(p) => setViewingReceiptPayment(p)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              challans={challans}
              payments={payments}
              classes={classes}
              students={students}
              feeTypes={feeTypes}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              config={config}
              onUpdateConfig={(newConfig) => setConfig(newConfig)}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Modal: Printable Challan */}
      {viewingChallan && (
        <PrintableChallan
          challan={viewingChallan}
          config={config}
          onClose={() => setViewingChallan(null)}
          onRecordPayment={(c) => {
            setViewingChallan(null);
            setPayingChallan(c);
          }}
        />
      )}

      {/* Modal: Printable Receipt */}
      {viewingReceiptPayment && (
        <PrintableReceipt
          payment={viewingReceiptPayment}
          challan={paymentChallan}
          config={config}
          onClose={() => setViewingReceiptPayment(null)}
        />
      )}

      {/* Modal: Record Payment */}
      {payingChallan && (
        <RecordPaymentModal
          challan={payingChallan}
          onClose={() => setPayingChallan(null)}
          onSuccess={(paymentId) => {
            setPayingChallan(null);
            showToast('Payment recorded and official receipt generated!');
            const newlyCreated = payments.find((p) => p.id === paymentId);
            if (newlyCreated) {
              setViewingReceiptPayment(newlyCreated);
            }
          }}
        />
      )}

      {/* Modal: Generate Challan */}
      {isGenerateChallanOpen && (
        <ChallanGeneratorModal
          classes={classes}
          students={students}
          feeTypes={feeTypes}
          initialStudentId={generateChallanInitialStudentId}
          onClose={() => {
            setIsGenerateChallanOpen(false);
            setGenerateChallanInitialStudentId(undefined);
          }}
          onSuccess={(msg) => {
            showToast(msg);
            setActiveTab('challans');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
