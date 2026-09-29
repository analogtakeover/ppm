import React, { useState } from 'react';
import { ShiftAudit, SiteLog, AirtableConfig } from '../types';
import { 
  syncLogsToAirtable, 
  getStoredAirtableConfig, 
  saveAirtableConfig 
} from '../utils/airtableService';
import { 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  CheckCircle2,
  Database,
  CloudUpload,
  Loader2,
  Settings2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { AirtableConfigModal } from './AirtableConfigModal';
import { audioFeedback } from '../utils/audioHaptics';

interface FinalizeScreenProps {
  audit: ShiftAudit;
  logs: SiteLog[];
  operator: string;
  routeName: string;
  shiftDate: string;
  onStartNewShift: () => void;
}

export const FinalizeScreen: React.FC<FinalizeScreenProps> = ({
  audit,
  logs,
  operator,
  routeName,
  shiftDate,
  onStartNewShift,
}) => {
  const [expandedSiteId, setExpandedSiteId] = useState<string | null>(null);
  
  // Airtable connection state
  const [airtableConfig, setAirtableConfig] = useState<AirtableConfig>(getStoredAirtableConfig);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  const totalSites = logs.length;

  const handleSaveConfig = (newConfig: AirtableConfig) => {
    setAirtableConfig(newConfig);
    saveAirtableConfig(newConfig);
    setSyncError(null);
  };

  const handleSyncToAirtable = async () => {
    // If bearer token or credentials are not yet set, prompt with config modal
    if (!airtableConfig.bearerToken.trim()) {
      setIsConfigOpen(true);
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);

    try {
      const result = await syncLogsToAirtable(
        airtableConfig,
        operator,
        routeName,
        shiftDate,
        audit.score,
        logs
      );

      if (result.success) {
        setSyncSuccess(true);
        setSyncedCount(result.totalSynced);
        audioFeedback.playComplete();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to synchronize with Airtable API.';
      setSyncError(msg);
      audioFeedback.playAlert();
    } finally {
      setIsSyncing(false);
    }
  };

  // SVG Gauge calculations
  const strokeWidth = 10;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (audit.score / 100) * circumference;

  let gaugeColor = '#008CF7';
  if (audit.score >= 90) gaugeColor = '#008CF7';
  else if (audit.score >= 70) gaugeColor = '#38bdf8';
  else if (audit.score >= 50) gaugeColor = '#f59e0b';
  else gaugeColor = '#FF5252';

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 font-sans box-border overflow-hidden">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1.5 w-full max-w-full box-border"
      >
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-wide text-white uppercase font-sans truncate">
          SHIFT FINALIZED
        </h2>
        <div className="text-xs sm:text-sm font-black text-[#008CF7] tracking-widest uppercase font-sans truncate">
          ALL {totalSites} {totalSites === 1 ? 'SITE' : 'SITES'} VERIFIED
        </div>
      </motion.div>

      {/* 1. ROUTE PERFORMANCE AUDIT Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-[#0e1b29]/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden w-full max-w-full box-border"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 sm:pb-4 mb-4 sm:mb-6 gap-2 min-w-0">
          <span className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-400 uppercase font-sans truncate">
            ROUTE PERFORMANCE AUDIT
          </span>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold tracking-wider text-[#008CF7] uppercase font-sans shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#008CF7] animate-pulse shadow-[0_0_8px_#008CF7]" />
            <span>SUMMARY AVAILABLE</span>
          </div>
        </div>

        {/* Card Content: Gauge + 2-Sentence Quote + Warnings */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Left: Health Gauge Ring */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  className="stroke-slate-800/80"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke={gaugeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={progressOffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: `drop-shadow(0 0 8px ${gaugeColor}88)`,
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono leading-none">
                  {audit.score}
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1 font-sans">
                  HEALTH
                </span>
              </div>
            </div>

            <div className="mt-2 text-center">
              <span
                className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full font-sans"
                style={{
                  backgroundColor: `${gaugeColor}20`,
                  color: gaugeColor,
                  border: `1px solid ${gaugeColor}40`,
                }}
              >
                {audit.grade} Execution
              </span>
            </div>
          </div>

          {/* Right: 2-Sentence Quote Summary & Warning Pills */}
          <div className="md:col-span-8 space-y-4">
            <blockquote className="text-sm sm:text-base font-semibold italic text-slate-100 leading-relaxed border-l-2 border-[#008CF7]/60 pl-3 font-sans">
              {audit.summary}
            </blockquote>

            {audit.warnings.length > 0 && (
              <div className="space-y-2 pt-1">
                {audit.warnings.map((warn) => (
                  <div
                    key={warn.id}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#FF5252]/10 border border-[#FF5252]/30 text-[#FF5252] shadow-sm font-sans"
                  >
                    <span className="w-5 h-5 rounded-md bg-[#FF5252]/20 flex items-center justify-center font-black text-xs shrink-0">
                      !
                    </span>
                    <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase leading-tight">
                      {warn.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {audit.warnings.length === 0 && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#008CF7]/10 border border-[#008CF7]/30 text-[#008CF7] font-sans">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Zero critical friction points detected during route execution.
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* 2. SITE MANIFEST Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#0e1b29]/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-xl backdrop-blur-md space-y-3.5 sm:space-y-4 font-sans w-full max-w-full box-border overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-2 min-w-0">
          <span className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-400 uppercase font-sans truncate">
            SITE MANIFEST
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] sm:text-xs font-black font-mono tracking-wider text-[#008CF7] uppercase">
              {logs.filter(l => l.status !== 'SKIPPED').length}/{totalSites} DONE
            </span>
            {audit.totalSkipped > 0 && (
              <span className="text-[10px] sm:text-xs font-black font-mono tracking-wider text-[#FF5252] uppercase bg-[#FF5252]/10 px-2 py-0.5 rounded border border-[#FF5252]/30">
                {audit.totalSkipped} SKIPPED
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2.5 sm:space-y-3 w-full max-w-full box-border">
          {logs.map((log) => {
            const isExpanded = expandedSiteId === log.site.id;
            const isSkipped = log.status === 'SKIPPED';
            return (
              <div
                key={log.site.id}
                className={`border rounded-xl overflow-hidden transition-all w-full max-w-full box-border ${
                  isSkipped
                    ? 'bg-[#141217] border-[#FF5252]/40'
                    : 'bg-[#101b26] border-slate-800/80'
                }`}
              >
                <div
                  onClick={() => setExpandedSiteId(isExpanded ? null : log.site.id)}
                  className="p-3 sm:p-4 flex items-center justify-between gap-2.5 sm:gap-3 cursor-pointer hover:bg-slate-800/20 transition-colors select-none font-sans w-full max-w-full box-border min-w-0"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 overflow-hidden">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSkipped
                          ? 'bg-[#FF5252]/20 border border-[#FF5252]/50 text-[#FF5252]'
                          : 'bg-[#008CF7]/20 border border-[#008CF7]/40 text-[#008CF7]'
                      }`}
                    >
                      {isSkipped ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <ShieldCheck className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-white font-black text-xs sm:text-base tracking-wide uppercase font-sans truncate">
                          {log.site.name}
                        </span>
                        {isSkipped && (
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FF5252]/20 text-[#FF5252] border border-[#FF5252]/30 shrink-0">
                            Bypassed
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 text-[11px] sm:text-xs font-medium font-sans flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="truncate">{log.site.address}</span>
                        <span>•</span>
                        {isSkipped ? (
                          <span className="text-[#FF5252] font-bold truncate">
                            {log.skipReason}
                          </span>
                        ) : (
                          <span>Logged at {log.completedAt}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 font-sans shrink-0">
                    {isSkipped ? (
                      <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-[#FF5252]/15 border border-[#FF5252]/40 font-mono font-bold text-[10px] sm:text-xs text-[#FF5252]">
                        SKIPPED
                      </div>
                    ) : (
                      <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-slate-900 border border-slate-700/60 font-mono font-bold text-[10px] sm:text-xs text-slate-300">
                        <span className="text-[#008CF7]">{log.uppers.length}U</span>
                        <span className="text-slate-500 mx-1">/</span>
                        <span className={log.downers.length > 0 ? 'text-[#FF5252]' : 'text-slate-500'}>
                          {log.downers.length}D
                        </span>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-slate-800/80 p-4 bg-[#0a1420]/80 space-y-3 text-xs font-sans"
                  >
                    {isSkipped ? (
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-lg bg-[#FF5252]/10 border border-[#FF5252]/30 text-[#FF5252]">
                          <strong className="block uppercase text-[10px] tracking-wider mb-0.5">
                            Operational Skip Justification:
                          </strong>
                          <span className="text-white text-xs">{log.skipReason}</span>
                        </div>
                        {log.downers.length > 0 && (
                          <div>
                            <div className="text-[#FF5252] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-sans">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Downers Recorded on Approach ({log.downers.length}):
                            </div>
                            <div className="flex flex-wrap gap-1.5 font-sans">
                              {log.downers.map((d) => (
                                <span
                                  key={d}
                                  className="px-2 py-0.5 rounded bg-[#FF5252]/15 text-[#FF5252] border border-[#FF5252]/30 font-medium"
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="text-[#008CF7] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-sans">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Completed Uppers ({log.uppers.length}):
                          </div>
                          <div className="flex flex-wrap gap-1.5 font-sans">
                            {log.uppers.length === 0 ? (
                              <span className="text-slate-500 italic">None logged</span>
                            ) : (
                              log.uppers.map((u) => (
                                <span
                                  key={u}
                                  className="px-2 py-0.5 rounded bg-[#008CF7]/15 text-[#38bdf8] border border-[#008CF7]/30 font-medium"
                                >
                                  {u}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-[#FF5252] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-sans">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Logged Downers ({log.downers.length}):
                          </div>
                          <div className="flex flex-wrap gap-1.5 font-sans">
                            {log.downers.length === 0 ? (
                              <span className="text-emerald-400 italic">No operational issues logged</span>
                            ) : (
                              log.downers.map((d) => (
                                <span
                                  key={d}
                                  className="px-2 py-0.5 rounded bg-[#FF5252]/15 text-[#FF5252] border border-[#FF5252]/30 font-medium"
                                >
                                  {d}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {log.notes && (
                      <div className="pt-1 text-slate-400 border-t border-slate-800 font-sans">
                        <span className="text-slate-300 font-bold">Notes:</span> {log.notes}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 3. Direct Airtable Synchronization Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4 pt-2 font-sans"
      >
        {/* Connection status bar */}
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Database className="w-3.5 h-3.5 text-[#008CF7]" />
            <span>Target: <strong className="text-slate-200">{airtableConfig.baseId}</strong> / <strong className="text-slate-200">{airtableConfig.tableName}</strong></span>
          </div>
          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-[#008CF7] hover:text-[#38bdf8] uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Config Connection</span>
          </button>
        </div>

        {/* Error notification banner if sync failed */}
        {syncError && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-[#FF5252]/15 border border-[#FF5252]/40 text-[#FF5252] flex items-start justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block uppercase tracking-wider">Airtable Sync Error</span>
                <span className="text-slate-200">{syncError}</span>
              </div>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="text-xs underline font-bold shrink-0 text-white hover:text-slate-200"
            >
              Check Token
            </button>
          </motion.div>
        )}

        {/* Primary Action Button: Direct Sync to Airtable */}
        <button
          type="button"
          disabled={isSyncing}
          onClick={handleSyncToAirtable}
          className={`w-full h-14 font-black rounded-xl sm:rounded-2xl text-base tracking-wider transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer font-sans select-none ${
            syncSuccess
              ? 'bg-emerald-500 text-white shadow-[0_4px_25px_rgba(16,185,129,0.35)]'
              : isSyncing
              ? 'bg-slate-200 text-slate-800 opacity-90 cursor-wait'
              : 'bg-white text-slate-950 hover:bg-slate-100 active:scale-[0.99] shadow-[0_4px_25px_rgba(0,140,247,0.35)] hover:shadow-[0_4px_35px_rgba(0,140,247,0.55)]'
          }`}
        >
          {isSyncing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[#008CF7]" />
              <span>Pushing Records to Airtable REST API...</span>
            </>
          ) : syncSuccess ? (
            <>
              <Check className="w-5 h-5 stroke-[3] text-white" />
              <span>Synced to Airtable Successfully! ({syncedCount} Records)</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-5 h-5 stroke-[2.5] text-slate-950" />
              <span>Sync to Airtable</span>
            </>
          )}
        </button>

        {/* Reset / Start New Shift action */}
        <div className="flex items-center justify-center pt-1">
          <button
            type="button"
            onClick={onStartNewShift}
            className="w-full sm:w-auto px-6 h-12 bg-[#101b26] hover:bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white font-bold rounded-xl text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Start New Shift</span>
          </button>
        </div>
      </motion.div>

      {/* Airtable Settings Modal */}
      <AirtableConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={airtableConfig}
        onSave={handleSaveConfig}
      />
    </div>
  );
};
