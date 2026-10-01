import React from 'react';
import { TPCLogo } from './TPCLogo';

interface CollegeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'mark-only' | 'full';
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'mark-only'
}) => {
  return (
    <TPCLogo
      className={className}
      size={size}
      variant={variant}
    />
  );
};
