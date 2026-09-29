import React from 'react';

interface PpmLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PpmLogo: React.FC<PpmLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  }[size];

  return (
    <div
      className={`relative overflow-hidden bg-[#0c1825] border border-white/10 shadow-lg shadow-black/40 flex flex-col justify-between shrink-0 ${sizeClasses} ${className}`}
    >
      {/* Top sensor region with two white eyes/dots */}
      <div className="flex-1 flex items-center justify-center gap-1.5 pt-2">
        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] animate-pulse" />
        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] animate-pulse" />
      </div>

      {/* Blue stratified bottom wave / stripes representing PPM fleet clean finish */}
      <div className="w-full flex flex-col">
        <div className="h-1 bg-[#008CF7]/60" />
        <div className="h-2.5 bg-gradient-to-r from-[#0060b8] via-[#008CF7] to-[#00b4ff]" />
        <div className="h-1.5 bg-[#004e9a]" />
      </div>
    </div>
  );
};
