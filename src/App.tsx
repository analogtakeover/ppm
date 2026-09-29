import { useState, useEffect } from 'react';
import { RouteId, ShiftStep, Site, SiteLog, ShiftAudit } from './types';
import { generateSitesForRoute } from './data/mockRoutes';
import { calculateRouteAudit } from './utils/healthCalculator';
import { Header } from './components/Header';
import { SetupScreen } from './components/SetupScreen';
import { ChecklistScreen } from './components/ChecklistScreen';
import { FinalizeScreen } from './components/FinalizeScreen';
import { audioFeedback } from './utils/audioHaptics';

export default function App() {
  const [step, setStep] = useState<ShiftStep>('setup');
  
  // Persistent locked operator identity
  const [lockedOperator, setLockedOperator] = useState<string>(() => {
    try {
      return localStorage.getItem('ppm_locked_operator') || '';
    } catch {
      return '';
    }
  });

  const [operator, setOperator] = useState<string>(() => {
    try {
      return localStorage.getItem('ppm_locked_operator') || 'Ben';
    } catch {
      return 'Ben';
    }
  });

  const [selectedRoute, setSelectedRoute] = useState<RouteId>('Route 101');
  const [shiftDate, setShiftDate] = useState<string>('2026-09-29');

  const [sites, setSites] = useState<Site[]>([]);
  const [currentSiteIndex, setCurrentSiteIndex] = useState<number>(0);
  const [siteLogs, setSiteLogs] = useState<SiteLog[]>([]);
  const [audit, setAudit] = useState<ShiftAudit | null>(null);

  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Initialize Route & lock crew leader name
  const handleStartRoute = (op: string, route: RouteId, date: string) => {
    const trimmedOp = op.trim();
    setOperator(trimmedOp);
    
    // Once entered, locked permanently to them
    if (!lockedOperator) {
      setLockedOperator(trimmedOp);
      try {
        localStorage.setItem('ppm_locked_operator', trimmedOp);
      } catch {
        // storage fallback
      }
    }

    setSelectedRoute(route);
    setShiftDate(date);

    const generatedSites = generateSitesForRoute(route);
    setSites(generatedSites);
    setCurrentSiteIndex(0);
    setSiteLogs([]);
    setAudit(null);
    setStep('checklist');
    audioFeedback.playTap();
  };

  // Log site and progress or finalize
  const handleCompleteSite = (log: SiteLog) => {
    const updatedLogs = [...siteLogs, log];
    setSiteLogs(updatedLogs);

    if (currentSiteIndex + 1 < sites.length) {
      setCurrentSiteIndex((prev) => prev + 1);
    } else {
      // Completed all sites in route!
      const finalAudit = calculateRouteAudit(operator, selectedRoute, updatedLogs);
      setAudit(finalAudit);
      setStep('finalized');
    }
  };

  // Reset / Start New Shift (retains locked crew leader identity)
  const handleStartNewShift = () => {
    setStep('setup');
    setSites([]);
    setCurrentSiteIndex(0);
    setSiteLogs([]);
    setAudit(null);
    setShowResetConfirm(false);
    audioFeedback.playTap();
  };

  return (
    <div className="min-h-screen bg-[#0B1622] text-slate-100 flex flex-col relative overflow-x-hidden font-sans w-full max-w-full box-border">
      {/* Background Radial Glow matching PPM Fleet Tracker */}
      <div
        className="fixed inset-0 pointer-events-none -z-0 max-w-full"
        style={{
          background:
            'radial-gradient(circle at 50% 12%, rgba(0, 140, 247, 0.08) 0%, rgba(11, 22, 34, 0.95) 75%)',
        }}
      />

      {/* Main Header */}
      <Header
        step={step}
        operator={lockedOperator || operator}
        routeName={selectedRoute}
        currentSiteIndex={step === 'checklist' ? currentSiteIndex : sites.length}
        totalSites={sites.length}
        onResetRoute={() => setShowResetConfirm(true)}
      />

      {/* Main Dynamic View */}
      <main className="flex-1 flex flex-col justify-center relative z-10 w-full max-w-full overflow-x-hidden box-border">
        {step === 'setup' && (
          <SetupScreen
            initialOperator={lockedOperator || operator}
            isOperatorLocked={Boolean(lockedOperator)}
            initialRoute={selectedRoute}
            initialDate={shiftDate}
            onStartRoute={handleStartRoute}
          />
        )}

        {step === 'checklist' && sites.length > 0 && (
          <ChecklistScreen
            currentSite={sites[currentSiteIndex]}
            currentIndex={currentSiteIndex}
            totalSites={sites.length}
            operator={lockedOperator || operator}
            routeName={selectedRoute}
            onCompleteSite={handleCompleteSite}
            existingLog={siteLogs[currentSiteIndex]}
          />
        )}

        {step === 'finalized' && audit && (
          <FinalizeScreen
            audit={audit}
            logs={siteLogs}
            operator={lockedOperator || operator}
            routeName={selectedRoute}
            shiftDate={shiftDate}
            onStartNewShift={handleStartNewShift}
          />
        )}
      </main>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1b29] border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl font-sans">
            <h3 className="text-white font-black text-lg">Reset Active Shift?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will discard checklist progress recorded for {selectedRoute} and return to setup.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartNewShift}
                className="px-4 py-2 rounded-xl bg-[#FF5252] text-white text-xs font-black hover:bg-red-600 transition-colors cursor-pointer"
              >
                Reset Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
