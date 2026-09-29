import React from 'react';
import { PpmLogo } from './PpmLogo';
import { ShiftStep } from '../types';
import { RotateCcw } from 'lucide-react';

interface HeaderProps {
  step: ShiftStep;
  operator: string;
  routeName: string;
  currentSiteIndex: number;
  totalSites: number;
  onResetRoute?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  step,
  operator,
  routeName,
  currentSiteIndex,
  totalSites,
  onResetRoute,
}) => {
  let subtitle = 'SYSTEM STANDBY';
  if (step === 'checklist') {
    subtitle = `ROUTE DEPLOYMENT: ${routeName.toUpperCase()}`;
  } else if (step === 'finalized') {
    subtitle = 'SHIFT FINALIZED';
  }

  const progressPercent = totalSites > 0 ? (currentSiteIndex / totalSites) * 100 : 0;

  return (
    <header className="w-full max-w-full box-border bg-[#0B1622]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-8 py-3 sticky top-0 z-30 overflow-hidden">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4 w-full min-w-0 box-border">
        {/* Left Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 overflow-hidden">
          <PpmLogo size="md" />
          <div className="flex flex-col min-w-0 overflow-hidden">
            <h1 className="text-white text-sm sm:text-lg font-black tracking-wide leading-none truncate">
              Mike: Site Assistant
            </h1>
            <span className="text-[10px] sm:text-xs font-bold tracking-widest text-[#008CF7] uppercase mt-0.5 truncate">
              {subtitle}
            </span>
          </div>
        </div>

        {/* Right Status / Progress */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {step === 'checklist' && (
            <div className="flex flex-col items-end w-24 sm:w-40 shrink-0">
              <div className="flex items-center justify-between w-full text-[10px] sm:text-[11px] font-bold tracking-wider mb-1">
                <span className="text-slate-400 uppercase hidden sm:inline">PROGRESS</span>
                <span className="text-white font-mono ml-auto">
                  {currentSiteIndex}/{totalSites} SITES
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800/90 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#008CF7] transition-all duration-300 shadow-[0_0_8px_#008CF7]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {step !== 'setup' && onResetRoute && (
            <button
              onClick={onResetRoute}
              title="Reset or abort shift"
              className="px-2 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 text-xs font-semibold flex items-center gap-1 border border-slate-700/40 transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {operator && step === 'setup' && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/40 border border-slate-700/50 text-xs font-medium text-slate-300 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#008CF7]" />
              <span className="text-slate-400 uppercase text-[10px] tracking-wider">CREW:</span>
              <span className="text-white font-bold">{operator}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
