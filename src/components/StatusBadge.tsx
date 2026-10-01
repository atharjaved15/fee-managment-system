import React from 'react';
import { PaymentStatus } from '../types';
import { getStatusBadgeClass } from '../utils/formatters';

interface StatusBadgeProps {
  status: PaymentStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true
}) => {
  const styles = getStatusBadgeClass(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-bold px-3 py-1.5'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs font-medium uppercase tracking-wider ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`} />}
      {status}
    </span>
  );
};
