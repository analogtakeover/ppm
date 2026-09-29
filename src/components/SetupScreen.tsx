import React, { useState } from 'react';
import { RouteId } from '../types';
import { ROUTES } from '../data/mockRoutes';
import { Route as RouteIcon, Calendar, ChevronDown, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface SetupScreenProps {
  initialOperator: string;
  isOperatorLocked: boolean;
  initialRoute: RouteId;
  initialDate: string;
  onStartRoute: (operator: string, route: RouteId, date: string) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  initialOperator,
  isOperatorLocked,
  initialRoute,
  initialDate,
  onStartRoute,
}) => {
  const [operator, setOperator] = useState(initialOperator || '');
  const [selectedRoute, setSelectedRoute] = useState<RouteId>(initialRoute || 'Route 101');
  const [shiftDate, setShiftDate] = useState(initialDate || '2026-09-29');

  const currentRouteConfig = ROUTES.find((r) => r.id === selectedRoute) || ROUTES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operator.trim()) return;
    onStartRoute(operator.trim(), selectedRoute, shiftDate);
  };

  // Format date display for input (e.g. MM/DD/YYYY)
  const formatDisplayDate = (isoDate: string) => {
    try {
      const [year, month, day] = isoDate.split('-');
      return `${month}/${day}/${year}`;
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-12 box-border overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-full box-border"
      >
        {/* Protocol Card */}
        <div className="bg-[#0e1b29]/90 border border-slate-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden w-full max-w-full box-border">
          {/* Subtle decorative radial accent safely bounded inside overflow-hidden */}
          <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-64 bg-[#008CF7]/10 rounded-full blur-3xl pointer-events-none -z-0" />

          {/* Card Header matching Screenshot 1 */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-10 relative z-10 w-full min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#0c253d] border border-[#008CF7]/50 flex items-center justify-center text-[#008CF7] shadow-[0_0_15px_rgba(0,140,247,0.25)] shrink-0">
              <RouteIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#008CF7]" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#38bdf8] uppercase truncate">
                SETUP PROTOCOL
              </div>
              <h2 className="text-lg sm:text-2xl font-black italic tracking-wide text-white uppercase font-sans truncate">
                INITIALIZE DAILY ROUTE
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 relative z-10 w-full max-w-full box-border">
            {/* Input Row: 3 columns matching screenshot 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full box-border">
              {/* CREW LEADER */}
              <div className="flex flex-col min-w-0 w-full box-border">
                <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
                  <label className="text-[11px] font-bold tracking-wider text-[#38bdf8] uppercase truncate">
                    CREW LEADER
                  </label>
                  {isOperatorLocked && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 uppercase tracking-wider shrink-0">
                      <Lock className="w-3 h-3" />
                      Locked
                    </span>
                  )}
                </div>
                <div className="relative w-full min-w-0">
                  <input
                    type="text"
                    required
                    disabled={isOperatorLocked}
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    placeholder="Enter leader name"
                    className={`w-full max-w-full box-border h-12 sm:h-13 px-3.5 sm:px-4 rounded-xl border text-white font-bold text-sm sm:text-base focus:outline-none transition-all placeholder:text-slate-600 ${
                      isOperatorLocked
                        ? 'bg-[#0a121a] border-slate-800 text-slate-200 cursor-not-allowed select-none opacity-90'
                        : 'bg-[#121c27] border-slate-700/70 focus:border-[#008CF7] focus:ring-2 focus:ring-[#008CF7]/20'
                    }`}
                  />
                  {isOperatorLocked && (
                    <div className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">Locked to field terminal</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ASSIGNED ROUTE */}
              <div className="flex flex-col min-w-0 w-full box-border">
                <label className="text-[11px] font-bold tracking-wider text-[#38bdf8] uppercase mb-1.5 sm:mb-2 truncate">
                  ASSIGNED ROUTE
                </label>
                <div className="relative w-full min-w-0">
                  <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value as RouteId)}
                    className="w-full max-w-full box-border h-12 sm:h-13 px-3.5 sm:px-4 pr-10 rounded-xl bg-[#121c27] border border-slate-700/70 text-white font-bold text-sm sm:text-base appearance-none focus:outline-none focus:border-[#008CF7] focus:ring-2 focus:ring-[#008CF7]/20 transition-all cursor-pointer"
                  >
                    {ROUTES.map((route) => (
                      <option key={route.id} value={route.id} className="bg-[#121c27] text-white">
                        {route.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 sm:top-4 pointer-events-none" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between gap-2">
                  <span className="truncate">Scope: {currentRouteConfig.siteCount} {currentRouteConfig.siteCount === 1 ? 'Site' : 'Sites'}</span>
                  <span className="text-slate-500 shrink-0">{currentRouteConfig.category}</span>
                </div>
              </div>

              {/* SHIFT DATE */}
              <div className="flex flex-col min-w-0 w-full box-border">
                <label className="text-[11px] font-bold tracking-wider text-[#38bdf8] uppercase mb-1.5 sm:mb-2 truncate">
                  SHIFT DATE
                </label>
                <div className="relative w-full min-w-0">
                  <input
                    type="date"
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                    className="w-full max-w-full box-border h-12 sm:h-13 px-3.5 sm:px-4 pr-10 rounded-xl bg-[#121c27] border border-slate-700/70 text-white font-bold text-sm sm:text-base focus:outline-none focus:border-[#008CF7] focus:ring-2 focus:ring-[#008CF7]/20 transition-all cursor-pointer [color-scheme:dark]"
                  />
                  <Calendar className="w-5 h-5 text-slate-400 absolute right-3.5 top-3.5 sm:top-4 pointer-events-none" />
                </div>
                <div className="text-[10px] text-slate-400 mt-1.5 truncate">
                  Formatted: {formatDisplayDate(shiftDate)}
                </div>
              </div>
            </div>

            {/* Solid White Action Button matching Screenshot 1 */}
            <div className="pt-2 w-full max-w-full box-border">
              <button
                type="submit"
                className="w-full max-w-full box-border h-13 sm:h-14 bg-white text-slate-950 font-black rounded-xl sm:rounded-2xl text-sm sm:text-base tracking-wider hover:bg-slate-100 active:scale-[0.99] transition-all duration-200 shadow-[0_0_25px_rgba(0,140,247,0.35)] hover:shadow-[0_0_35px_rgba(0,140,247,0.55)] flex items-center justify-center gap-2 cursor-pointer font-sans"
              >
                <span>INITIALIZE ROUTE</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
