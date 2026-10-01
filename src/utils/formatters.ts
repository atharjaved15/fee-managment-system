import { PaymentStatus } from '../types';

export function formatCurrency(amount: number = 0): string {
  return `Rs. ${Number(amount || 0).toLocaleString('en-PK', {
    maximumFractionDigits: 0
  })}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

export function generateChallanNumber(existingCount = 0): string {
  const year = new Date().getFullYear();
  const sequence = String(existingCount + 1).padStart(6, '0');
  return `CH-${year}-${sequence}`;
}

export function generateReceiptNumber(existingCount = 0): string {
  const year = new Date().getFullYear();
  const sequence = String(existingCount + 1).padStart(6, '0');
  return `REC-${year}-${sequence}`;
}

export function getStatusBadgeClass(status: PaymentStatus): { bg: string; text: string; border: string; dot: string } {
  switch (status) {
    case 'PAID':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      };
    case 'UNPAID':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500'
      };
    case 'PARTIAL':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500'
      };
    case 'OVERDUE':
      return {
        bg: 'bg-red-100 dark:bg-red-950',
        text: 'text-red-800 dark:text-red-200 font-semibold',
        border: 'border-red-300 dark:border-red-800',
        dot: 'bg-red-700'
      };
    case 'CANCELLED':
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-300 dark:border-slate-700',
        dot: 'bg-slate-400'
      };
  }
}
