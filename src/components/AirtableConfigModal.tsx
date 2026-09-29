import React, { useState } from 'react';
import { AirtableConfig } from '../types';
import { Database, Key, Table, X, Check, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AirtableConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AirtableConfig;
  onSave: (config: AirtableConfig) => void;
}

export const AirtableConfigModal: React.FC<AirtableConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [baseId, setBaseId] = useState(config.baseId || 'appPPMOperations');
  const [tableName, setTableName] = useState(config.tableName || 'Site Logs');
  const [bearerToken, setBearerToken] = useState(config.bearerToken || '');
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      baseId: baseId.trim(),
      tableName: tableName.trim(),
      bearerToken: bearerToken.trim(),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0e1b29] border border-slate-700/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#008CF7]/20 border border-[#008CF7]/40 flex items-center justify-center text-[#008CF7]">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg sm:text-xl uppercase tracking-wide">
                  Airtable Connection
                </h3>
                <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                  REST API CONFIGURATION
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Base ID */}
            <div>
              <label className="text-[11px] font-bold tracking-wider text-[#38bdf8] uppercase block mb-1.5 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Airtable Base ID
              </label>
              <input
                type="text"
                required
                value={baseId}
                onChange={(e) => setBaseId(e.target.value)}
                placeholder="e.g. appXXXXXXXXXXXXXX"
                className="w-full h-11 px-3.5 rounded-xl bg-[#121c27] border border-slate-700/80 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-[#008CF7] focus:ring-1 focus:ring-[#008CF7]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Found in your Airtable API docs or base URL (starts with "app").
              </span>
            </div>

            {/* Table Name */}
            <div>
              <label className="text-[11px] font-bold tracking-wider text-[#38bdf8] uppercase block mb-1.5 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5" />
                Table Name
              </label>
              <input
                type="text"
                required
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="e.g. Site Logs"
                className="w-full h-11 px-3.5 rounded-xl bg-[#121c27] border border-slate-700/80 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-[#008CF7] focus:ring-1 focus:ring-[#008CF7]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                The exact name of the table in your base (e.g. "Site Logs").
              </span>
            </div>

            {/* Bearer Token */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold tracking-wider text-[#38bdf8] uppercase flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5" />
                  Bearer Token (Personal Access Token)
                </label>
                <a
                  href="https://airtable.com/create/tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-[#008CF7] hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Get Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  required
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  placeholder="pat..."
                  className="w-full h-11 px-3.5 pr-10 rounded-xl bg-[#121c27] border border-slate-700/80 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-[#008CF7] focus:ring-1 focus:ring-[#008CF7]"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Requires <code className="text-slate-400">data.records:write</code> scope for the target base.
              </span>
            </div>

            {/* Field mapping confirmation */}
            <div className="rounded-xl bg-[#0a141f] border border-slate-800 p-3 text-[11px] space-y-1">
              <span className="text-slate-400 font-bold block uppercase tracking-wider text-[10px]">
                Target Fields Mapped:
              </span>
              <p className="text-slate-500 font-mono text-[10px] leading-relaxed">
                Site Name, Address, Crew Leader Name, Assigned Route, Shift Date, Site Status, Skip Reason, Uppers, Downers, AI Route Health Score
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#008CF7] hover:bg-[#007cdb] text-white text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(0,140,247,0.4)] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
