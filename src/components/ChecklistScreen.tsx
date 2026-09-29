import React, { useState } from 'react';
import { Site, UpperMetric, DownerMetric, SiteLog } from '../types';
import { UPPERS_LIST, DOWNERS_LIST } from '../data/mockRoutes';
import { 
  MapPin, 
  Check, 
  ArrowRight, 
  AlertTriangle, 
  SkipForward, 
  X, 
  AlertOctagon, 
  Navigation,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Wrench,
  Truck,
  CloudRain,
  Clock,
  UserX,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audioFeedback } from '../utils/audioHaptics';

interface ChecklistScreenProps {
  currentSite: Site;
  currentIndex: number;
  totalSites: number;
  operator?: string;
  routeName?: string;
  onCompleteSite: (log: SiteLog) => void;
  onPreviousSite?: () => void;
  existingLog?: SiteLog;
}

const SKIP_REASONS = [
  'Severe Weather / Pouring Rain',
  'Client Locked / Access Denied',
  'Hazardous On-Site Obstruction',
  'Equipment Failure en Route',
  'Other / Custom',
] as const;

// Metric icons mapping for chunky modular visual feedback
const UPPER_ICONS: Record<UpperMetric, React.ReactNode> = {
  'Trailer Inspection': <Wrench className="w-4 h-4" />,
  'Truck Inspection': <Truck className="w-4 h-4" />,
  'Cut': <Flame className="w-4 h-4" />,
  'Trim': <Sparkles className="w-4 h-4" />,
  'Blow': <Navigation className="w-4 h-4" />,
  'Debris Clean-Up': <ShieldCheck className="w-4 h-4" />,
  'PM/FM Wave': <CheckCircle2 className="w-4 h-4" />,
};

const DOWNER_ICONS: Record<DownerMetric, React.ReactNode> = {
  'Bad Weather': <CloudRain className="w-4 h-4" />,
  'Traffic': <Truck className="w-4 h-4" />,
  'Broken Tools/Equipment': <Wrench className="w-4 h-4" />,
  'Truck Failure': <AlertOctagon className="w-4 h-4" />,
  'Unhappy Client': <AlertTriangle className="w-4 h-4" />,
  'Late Staff': <Clock className="w-4 h-4" />,
  'No Shows': <UserX className="w-4 h-4" />,
};

export const ChecklistScreen: React.FC<ChecklistScreenProps> = ({
  currentSite,
  currentIndex,
  totalSites,
  operator = 'Ben',
  routeName = 'Route 101',
  onCompleteSite,
  existingLog,
}) => {
  const isFinalSite = currentIndex === totalSites - 1;

  // Initial state from existing log if user is reviewing or navigating
  const [selectedUppers, setSelectedUppers] = useState<UpperMetric[]>(
    existingLog ? existingLog.uppers : []
  );
  const [selectedDowners, setSelectedDowners] = useState<DownerMetric[]>(
    existingLog ? existingLog.downers : []
  );
  const [notes, setNotes] = useState<string>(existingLog?.notes || '');
  const [showNotes, setShowNotes] = useState<boolean>(false);

  // Skip Modal state
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [selectedSkipReason, setSelectedSkipReason] = useState<string>(SKIP_REASONS[0]);
  const [customReasonText, setCustomReasonText] = useState('');

  const toggleUpper = (item: UpperMetric) => {
    audioFeedback.playTap();
    setSelectedUppers((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleDowner = (item: DownerMetric) => {
    audioFeedback.playAlert();
    setSelectedDowners((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const selectAllCoreUppers = () => {
    audioFeedback.playTap();
    const all = UPPERS_LIST.map((u) => u.id);
    setSelectedUppers(all);
  };

  const clearDowners = () => {
    audioFeedback.playTap();
    setSelectedDowners([]);
  };

  // Complete and advance
  const handleNext = () => {
    audioFeedback.playComplete();
    const siteLog: SiteLog = {
      site: currentSite,
      status: 'COMPLETED',
      uppers: selectedUppers,
      downers: selectedDowners,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: notes.trim() || undefined,
    };
    onCompleteSite(siteLog);
  };

  // Confirm skip and advance
  const handleConfirmSkip = () => {
    audioFeedback.playAlert();
    const finalReason =
      selectedSkipReason === 'Other / Custom'
        ? customReasonText.trim() || 'Operational Exception (Custom)'
        : selectedSkipReason;

    const skipLog: SiteLog = {
      site: currentSite,
      status: 'SKIPPED',
      skipReason: finalReason,
      uppers: [],
      downers: selectedDowners,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      notes: notes.trim() ? `SKIPPED: ${finalReason} | ${notes.trim()}` : `SKIPPED: ${finalReason}`,
    };

    setIsSkipModalOpen(false);
    onCompleteSite(skipLog);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 font-sans space-y-4 sm:space-y-6 box-border overflow-hidden">
      {/* 1. CUSTODIAN ASSIGNMENT & STATUS BAR */}
      <div className="bg-[#0c1825] border border-[#162e47] rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden w-full max-w-full box-border">
        <div className="flex items-center justify-between mb-2.5 sm:mb-3 border-b border-[#14283f] pb-2 sm:pb-2.5 gap-2 min-w-0">
          <div className="flex items-center gap-2 text-[#008CF7] min-w-0 truncate">
            <UserCheck className="w-4 h-4 shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-slate-300 truncate">
              CUSTODIAN ASSIGNMENT & ROUTE PACING
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-[#008CF7] bg-[#008CF7]/15 border border-[#008CF7]/30 px-2 py-0.5 rounded-md uppercase shrink-0">
            EMP-01 · LOCKED
          </span>
        </div>

        <div className="bg-[#07131f] border border-[#14283f] rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full max-w-full box-border min-w-0">
          <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0f2a45] border border-[#008CF7]/40 text-[#008CF7] flex items-center justify-center font-black text-sm sm:text-base shrink-0 shadow-[0_0_10px_rgba(0,140,247,0.2)]">
              {operator.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="text-white font-black text-sm sm:text-base leading-tight flex items-center gap-2 truncate">
                <span className="truncate">{operator}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60 uppercase shrink-0">
                  Foreman
                </span>
              </div>
              <div className="text-slate-400 text-xs mt-0.5 truncate">
                PPM Crew 1 · <strong className="text-slate-200">{routeName}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 border-t sm:border-t-0 border-[#14283f]/60 pt-2 sm:pt-0">
            <div className="text-left sm:text-right">
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Site Sequence</div>
              <div className="text-[#008CF7] font-black text-xs sm:text-sm font-mono">
                Target #{currentIndex + 1} of {totalSites}
              </div>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0c2035] border border-[#173859] flex items-center justify-center font-mono font-bold text-xs text-[#38bdf8] shrink-0">
              {Math.round(((currentIndex) / totalSites) * 100)}%
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSite.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.22 }}
          className="space-y-4 sm:space-y-6 w-full max-w-full box-border"
        >
          {/* 2. ACTIVE DEPLOYMENT TARGET CARD */}
          <div className="bg-[#0c1825] border border-[#162e47] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl relative overflow-hidden w-full max-w-full box-border">
            {/* Soft ambient radial illumination safely bounded */}
            <div className="absolute top-0 right-1/4 w-72 sm:w-80 h-40 bg-[#008CF7]/10 rounded-full blur-3xl pointer-events-none -z-0" />

            <div className="flex items-center justify-between mb-3 sm:mb-4 border-b border-[#14283f] pb-2.5 sm:pb-3 relative z-10 gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 truncate">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#008CF7]/20 border border-[#008CF7]/40 flex items-center justify-center text-[#008CF7] shrink-0">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-300 uppercase truncate">
                  ACTIVE DEPLOYMENT TARGET & GPS
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-[#008CF7] bg-[#008CF7]/15 border border-[#008CF7]/30 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shrink-0">
                ACTIVE SITE
              </span>
            </div>

            {/* Inner Dark Container */}
            <div className="bg-[#07131f] border border-[#14283f] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 relative z-10 w-full max-w-full box-border min-w-0">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 overflow-hidden">
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#0c243b] border border-[#008CF7]/40 text-[#008CF7] font-black text-lg sm:text-2xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,140,247,0.25)] font-mono">
                  #{currentSite.number}
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <h2 className="text-white text-base sm:text-2xl font-black uppercase tracking-wide truncate">
                    {currentSite.name}
                  </h2>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 font-semibold text-xs sm:text-sm mt-0.5 sm:mt-1 flex-wrap min-w-0">
                    <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#008CF7] shrink-0" />
                    <span className="truncate">{currentSite.address}</span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="text-[#38bdf8] font-bold text-[11px] sm:text-xs shrink-0">
                      {currentSite.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 self-start md:self-center flex-wrap shrink-0">
                <button
                  type="button"
                  onClick={selectAllCoreUppers}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#0c2035] hover:bg-[#0f2a45] border border-[#1b3d63] text-[#38bdf8] text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer shrink-0"
                >
                  + All Uppers
                </button>
                {selectedDowners.length > 0 && (
                  <button
                    type="button"
                    onClick={clearDowners}
                    className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#221013] hover:bg-[#2e1419] border border-[#FF5252]/40 text-[#FF5252] text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer shrink-0"
                  >
                    Clear Downers
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowNotes(!showNotes)}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#101b26] hover:bg-[#162738] border border-slate-700/60 text-slate-300 text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer shrink-0"
                >
                  {showNotes ? 'Close Note' : '+ Note'}
                </button>
              </div>
            </div>

            {/* Optional Site Notes */}
            {showNotes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 bg-[#07131f] border border-[#14283f] rounded-xl p-3 w-full max-w-full box-border"
              >
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Operator observations, access notes, or client interactions..."
                  className="w-full max-w-full box-border bg-transparent text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none h-16 font-sans"
                />
              </motion.div>
            )}
          </div>

          {/* 3. PERFORMANCE METRICS (UPPERS) & RISK AUDIT (DOWNERS) COMPARTMENTALIZED CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-full box-border">
            {/* CARD 3A: UPPERS (Positive Performance Metrics) */}
            <div className="bg-[#0c1825] border border-[#162e47] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl space-y-3 sm:space-y-4 w-full max-w-full box-border overflow-hidden">
              {/* Header block with electric blue accent badge */}
              <div className="flex items-center justify-between border-b border-[#14283f] pb-2.5 sm:pb-3 gap-2 min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 truncate">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#008CF7]/20 border border-[#008CF7]/40 flex items-center justify-center text-[#008CF7] shrink-0">
                    <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 truncate">
                    <h3 className="text-white text-sm sm:text-lg font-black tracking-wide uppercase truncate">
                      UPPERS
                    </h3>
                    <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-[#008CF7] uppercase block truncate">
                      PERFORMANCE METRICS
                    </span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#008CF7] bg-[#008CF7]/15 border border-[#008CF7]/30 px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono shrink-0">
                  {selectedUppers.length}/{UPPERS_LIST.length} LOGGED
                </span>
              </div>

              {/* Chunky modular blocks list */}
              <div className="space-y-2 sm:space-y-2.5 w-full max-w-full box-border">
                {UPPERS_LIST.map((item) => {
                  const isChecked = selectedUppers.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleUpper(item.id)}
                      className={`w-full max-w-full box-border min-h-[58px] sm:min-h-[64px] p-2.5 sm:p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 text-left cursor-pointer select-none overflow-hidden ${
                        isChecked
                          ? 'bg-[#008CF7]/15 border-2 border-[#008CF7] shadow-[0_0_16px_rgba(0,140,247,0.35)] text-white'
                          : 'bg-[#0c1b2b] border-[#183552] hover:border-slate-600 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 overflow-hidden">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-[#008CF7] text-white shadow-[0_0_10px_#008CF7]'
                              : 'bg-slate-900 border border-slate-700 text-slate-400'
                          }`}
                        >
                          {isChecked ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" /> : UPPER_ICONS[item.id]}
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="font-black text-xs sm:text-base tracking-wide text-white truncate">
                            {item.label}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400 font-normal truncate">
                            {item.description}
                          </div>
                        </div>
                      </div>

                      {/* Right chunky indicator pill */}
                      <div
                        className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold font-mono tracking-wider transition-colors shrink-0 ${
                          isChecked
                            ? 'bg-[#008CF7] text-white shadow-[0_0_8px_#008CF7]'
                            : 'bg-slate-900/60 border border-slate-700/60 text-slate-500'
                        }`}
                      >
                        {isChecked ? 'VERIFIED' : 'PENDING'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CARD 3B: DOWNERS (Risk & Alert Audit) */}
            <div className="bg-[#0c1825] border border-[#162e47] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl space-y-3 sm:space-y-4 w-full max-w-full box-border overflow-hidden">
              {/* Header block with hazard red accent badge */}
              <div className="flex items-center justify-between border-b border-[#14283f] pb-2.5 sm:pb-3 gap-2 min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 truncate">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#FF5252]/20 border border-[#FF5252]/40 flex items-center justify-center text-[#FF5252] shrink-0">
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 truncate">
                    <h3 className="text-white text-sm sm:text-lg font-black tracking-wide uppercase truncate">
                      DOWNERS
                    </h3>
                    <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-[#FF5252] uppercase block truncate">
                      RISK & ALERT AUDIT
                    </span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#FF5252] bg-[#FF5252]/15 border border-[#FF5252]/30 px-2 sm:px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono shrink-0">
                  {selectedDowners.length} REPORTED
                </span>
              </div>

              {/* Chunky modular blocks list */}
              <div className="space-y-2 sm:space-y-2.5 w-full max-w-full box-border">
                {DOWNERS_LIST.map((item) => {
                  const isChecked = selectedDowners.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleDowner(item.id)}
                      className={`w-full max-w-full box-border min-h-[58px] sm:min-h-[64px] p-2.5 sm:p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between gap-2 text-left cursor-pointer select-none overflow-hidden ${
                        isChecked
                          ? 'bg-[#FF5252]/15 border-2 border-[#FF5252] shadow-[0_0_16px_rgba(255,82,82,0.35)] text-white'
                          : 'bg-[#0c1b2b] border-[#183552] hover:border-slate-600 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 overflow-hidden">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? 'bg-[#FF5252] text-white shadow-[0_0_10px_#FF5252]'
                              : 'bg-slate-900 border border-slate-700 text-slate-400'
                          }`}
                        >
                          {isChecked ? <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" /> : DOWNER_ICONS[item.id]}
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="font-black text-xs sm:text-base tracking-wide text-white truncate">
                            {item.label}
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400 font-normal truncate">
                            {item.description}
                          </div>
                        </div>
                      </div>

                      {/* Right chunky indicator pill */}
                      <div
                        className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold font-mono tracking-wider transition-colors shrink-0 ${
                          isChecked
                            ? 'bg-[#FF5252] text-white shadow-[0_0_8px_#FF5252]'
                            : 'bg-slate-900/60 border border-slate-700/60 text-slate-500'
                        }`}
                      >
                        {isChecked ? 'ALERT' : 'NOMINAL'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. SITE TURNOVER PROGRESSION CONTAINER */}
          <div className="bg-[#0c1825] border border-[#162e47] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xl space-y-3 sm:space-y-4 w-full max-w-full box-border overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#14283f] pb-2.5 sm:pb-3 gap-2 min-w-0">
              <span className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-300 uppercase truncate">
                SITE TURNOVER & PROGRESSION
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold font-mono text-[#008CF7] bg-[#008CF7]/15 border border-[#008CF7]/30 px-2 sm:px-2.5 py-0.5 rounded-full uppercase shrink-0">
                TARGET {currentIndex + 1} OF {totalSites}
              </span>
            </div>

            {/* Chunky modular action triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-4 pt-1 w-full max-w-full box-border">
              {/* Primary Progression Button */}
              <button
                type="button"
                onClick={handleNext}
                className="sm:col-span-8 w-full max-w-full box-border h-13 sm:h-15 bg-[#008CF7] hover:bg-[#007cdb] text-white font-black rounded-xl sm:rounded-2xl text-sm sm:text-base tracking-wider active:scale-[0.99] transition-all duration-200 shadow-[0_0_25px_rgba(0,140,247,0.45)] hover:shadow-[0_0_35px_rgba(0,140,247,0.65)] flex items-center justify-center gap-2 sm:gap-3 cursor-pointer"
              >
                {isFinalSite ? (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                    <span>Finalize Shift & Audit</span>
                  </>
                ) : (
                  <>
                    <span>Complete Site & Next</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  </>
                )}
              </button>

              {/* Skip Site Button */}
              <button
                type="button"
                onClick={() => setIsSkipModalOpen(true)}
                className="sm:col-span-4 w-full max-w-full box-border h-13 sm:h-15 bg-[#FF5252]/15 hover:bg-[#FF5252]/25 border-2 border-[#FF5252] text-[#FF5252] font-black rounded-xl sm:rounded-2xl text-xs sm:text-base tracking-wider hover:shadow-[0_0_20px_rgba(255,82,82,0.35)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <SkipForward className="w-4 h-4 stroke-[2.5]" />
                <span>Skip Site</span>
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip Site Operational Reason Modal with matching structural aesthetics */}
      <AnimatePresence>
        {isSkipModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c1825] border-2 border-[#FF5252] rounded-2xl sm:rounded-3xl p-4 sm:p-8 max-w-lg w-full max-w-full box-border shadow-2xl space-y-4 sm:space-y-6 relative overflow-hidden font-sans my-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4 gap-2 min-w-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 truncate">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#FF5252]/20 border border-[#FF5252]/50 flex items-center justify-center text-[#FF5252] shadow-[0_0_12px_rgba(255,82,82,0.35)] shrink-0">
                    <AlertOctagon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 truncate">
                    <h3 className="text-white font-black text-base sm:text-xl uppercase tracking-wide truncate">
                      Skip Site Protocol
                    </h3>
                    <span className="text-[9px] sm:text-[11px] font-bold text-[#FF5252] tracking-wider uppercase block truncate">
                      OPERATIONAL REASON REQUIRED
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSkipModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Site Details Reminder */}
              <div className="p-3 rounded-xl bg-[#07131f] border border-[#14283f] text-xs w-full max-w-full box-border min-w-0">
                <span className="text-white font-black block text-xs sm:text-sm uppercase truncate">
                  Bypassing #{currentSite.number} {currentSite.name}
                </span>
                <span className="text-slate-400 truncate block">{currentSite.address}</span>
              </div>

              {/* Reasons Selection List */}
              <div className="space-y-2 w-full max-w-full box-border">
                <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase block mb-1">
                  Select Cause of Incompletion:
                </label>
                {SKIP_REASONS.map((reason) => {
                  const isSelected = selectedSkipReason === reason;
                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setSelectedSkipReason(reason)}
                      className={`w-full max-w-full box-border p-3 sm:p-3.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer overflow-hidden ${
                        isSelected
                          ? 'bg-[#FF5252]/20 border-2 border-[#FF5252] text-white shadow-[0_0_12px_rgba(255,82,82,0.3)]'
                          : 'bg-[#07131f] border-[#14283f] text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-bold tracking-wide truncate">
                        {reason}
                      </span>
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-[#FF5252] bg-[#FF5252] text-white'
                            : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Reason Text Field */}
              {selectedSkipReason === 'Other / Custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1 w-full max-w-full box-border"
                >
                  <label className="text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 uppercase block">
                    Specify Custom Reason:
                  </label>
                  <input
                    type="text"
                    required
                    value={customReasonText}
                    onChange={(e) => setCustomReasonText(e.target.value)}
                    placeholder="e.g., Gate code inoperative, police activity..."
                    className="w-full max-w-full box-border h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl bg-[#07131f] border border-slate-700 text-white text-xs focus:outline-none focus:border-[#FF5252] focus:ring-1 focus:ring-[#FF5252]"
                  />
                </motion.div>
              )}

              {/* Impact Warning Notice */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-[#FF5252]/10 border border-[#FF5252]/30 text-[10px] sm:text-[11px] text-[#FF5252] flex items-center gap-2 w-full max-w-full box-border">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Skipping deducts points from the AI Route Health Score.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-1 w-full max-w-full box-border">
                <button
                  type="button"
                  onClick={() => setIsSkipModalOpen(false)}
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSkip}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#FF5252] hover:bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(255,82,82,0.4)] flex items-center gap-1.5 transition-all cursor-pointer font-sans shrink-0"
                >
                  <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Confirm Skip</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
