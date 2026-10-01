import React from 'react';

interface TPCLogoProps {
  className?: string;
  variant?: 'full' | 'mark-only';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  height?: number | string;
  width?: number | string;
}

export const TPCLogo: React.FC<TPCLogoProps> = ({
  className = '',
  variant = 'full',
  size = 'md',
  height,
  width
}) => {
  if (variant === 'mark-only') {
    const markDimension = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-24 h-24',
      custom: ''
    }[size];

    return (
      <div
        className={`inline-flex items-center justify-center shrink-0 ${markDimension} ${className}`}
        style={{ width: width || undefined, height: height || undefined }}
      >
        <svg
          viewBox="0 0 540 500"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Orange Swoosh / Arc */}
          <path
            d="M 175 90 C 230 45, 340 35, 420 80 C 495 125, 530 215, 515 300 C 500 380, 430 445, 345 460 C 265 475, 185 450, 135 410"
            stroke="#f97316"
            strokeWidth="38"
            strokeLinecap="round"
            fill="none"
          />

          {/* Inner Navy Swoosh / Arc */}
          <path
            d="M 230 115 C 290 85, 370 85, 430 120 C 485 155, 510 220, 500 280 C 490 340, 440 395, 375 415 C 310 435, 235 425, 180 375"
            stroke="#0a2540"
            strokeWidth="24"
            strokeLinecap="round"
            fill="none"
          />

          {/* Human Head */}
          <circle cx="195" cy="155" r="46" fill="#0a2540" />

          {/* Outstretched Stylized Human Body */}
          <path
            d="M 195 210
               C 210 210, 245 200, 280 185
               C 315 170, 360 145, 395 115
               C 375 140, 335 185, 295 215
               C 260 240, 235 255, 225 275
               C 220 290, 215 320, 215 345
               C 220 370, 240 405, 275 440
               C 305 468, 345 488, 370 495
               C 335 490, 285 465, 250 430
               C 225 405, 215 380, 210 405
               C 205 435, 195 480, 180 500
               C 180 470, 185 430, 190 395
               C 192 375, 190 350, 180 325
               C 170 300, 155 270, 140 250
               C 115 220, 80 195, 45 180
               C 20 170, 0 165, 0 165
               C 35 175, 80 195, 120 205
               C 150 212, 175 212, 195 210 Z"
            fill="#0a2540"
          />
        </svg>
      </div>
    );
  }

  // Full horizontal logo with exact typography and colors
  const fullDimension = {
    xs: 'h-6',
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-13',
    lg: 'h-16 sm:h-20',
    xl: 'h-24 sm:h-28',
    custom: ''
  }[size];

  return (
    <div
      className={`inline-flex items-center shrink-0 ${fullDimension} ${className}`}
      style={{ width: width || undefined, height: height || undefined }}
    >
      <svg
        viewBox="0 0 1020 520"
        className="h-full w-auto max-w-full drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Orange Swoosh / Arc */}
        <path
          d="M 185 95 C 240 50, 360 40, 440 85 C 520 130, 560 220, 545 310 C 530 395, 455 465, 365 480 C 280 495, 195 470, 140 425"
          stroke="#f97316"
          strokeWidth="38"
          strokeLinecap="round"
          fill="none"
        />

        {/* Inner Navy Swoosh / Arc */}
        <path
          d="M 240 120 C 300 90, 390 90, 455 125 C 510 160, 540 230, 530 290 C 520 350, 465 410, 395 430 C 325 450, 245 440, 190 390"
          stroke="#0a2540"
          strokeWidth="24"
          strokeLinecap="round"
          fill="none"
        />

        {/* Human Head */}
        <circle cx="205" cy="155" r="46" fill="#0a2540" />

        {/* Outstretched Stylized Human Body */}
        <path
          d="M 205 210
             C 220 210, 255 200, 290 185
             C 325 170, 370 145, 405 115
             C 385 140, 345 185, 305 215
             C 270 240, 245 255, 235 275
             C 230 290, 225 320, 225 345
             C 230 370, 250 405, 285 440
             C 315 468, 355 488, 380 495
             C 345 490, 295 465, 260 430
             C 235 405, 225 380, 220 405
             C 215 435, 205 480, 190 500
             C 190 470, 195 430, 200 395
             C 202 375, 200 350, 190 325
             C 180 300, 165 270, 150 250
             C 125 220, 90 195, 55 180
             C 30 170, 10 165, 10 165
             C 45 175, 90 195, 130 205
             C 160 212, 185 212, 205 210 Z"
          fill="#0a2540"
        />

        {/* Text: THE PHYSIO */}
        <text
          x="280"
          y="320"
          fill="#f97316"
          fontSize="108"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="-0.02em"
        >
          THE PHYSIO
        </text>

        {/* Text: COLLEGES */}
        <text
          x="620"
          y="410"
          fill="#0a2540"
          fontSize="72"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="0.05em"
        >
          COLLEGES
        </text>
      </svg>
    </div>
  );
};
