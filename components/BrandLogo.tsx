
import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md', showText = false }) => {
  const sizes = {
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-16',
    xl: 'h-24',
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizes[size]} aspect-square relative group`}>
        {/* Modern Minimalist SVG Logo */}
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
          {/* Background Clarity Circle */}
          <circle cx="50" cy="50" r="45" stroke="#E2E8F0" strokeWidth="0.5" fill="white" fillOpacity="0.05" />
          
          {/* Transformation Flow Path */}
          <path 
            d="M25 75C25 75 35 45 50 45C65 45 75 15 75 15" 
            stroke="url(#logo-gradient)" 
            strokeWidth="8" 
            strokeLinecap="round" 
            className="animate-pulse"
          />
          
          {/* AI Neural Node */}
          <circle cx="50" cy="45" r="10" fill="#1E1B4B" />
          <circle cx="50" cy="45" r="4" fill="#4F46E5" className="animate-ping" />
          
          <defs>
            <linearGradient id="logo-gradient" x1="25" y1="75" x2="75" y2="15" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E1B4B" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">FOCUS FLOW</span>
          <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase">BLUEPRINT</span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
