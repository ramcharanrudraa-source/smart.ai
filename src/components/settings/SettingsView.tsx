import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_ALGORITHM_WEIGHTS } from '../../utils/priority';
import { SUPABASE_SQL_SCHEMA } from '../../lib/supabase';
import {
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Fuel,
  Sparkles,
  Shield,
  Save,
  Database,
  Cloud,
  CloudUpload,
  CloudDownload,
  Copy,
  Check,
  Code2,
  X,
  ExternalLink,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    weights,
    updateWeights,
    resetToDefaultData,
    supabaseStatus,
    isSyncingToCloud,
    lastCloudSyncTime,
    syncBinsToSupabase,
    fetchBinsFromSupabase,
  } = useApp();

  const [fillWeight, setFillWeight] = useState(weights.fillWeight);
  const [waitingWeight, setWaitingWeight] = useState(weights.waitingTimeWeight);
  const [specialWeight, setSpecialWeight] = useState(weights.specialPriorityWeight);

  const [critThreshold, setCritThreshold] = useState(weights.criticalFillThreshold);
  const [highThreshold, setHighThreshold] = useState(weights.highFillThreshold);
  const [medThreshold, setMedThreshold] = useState(weights.mediumFillThreshold);

  const [fuelCost, setFuelCost] = useState(weights.fuelCostPerLiter);
  const [dieselKm, setDieselKm] = useState(weights.dieselKmPerLiter);
  const [co2Factor, setCo2Factor] = useState(weights.co2KgPerLiter);

  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [cloudMessage, setCloudMessage] = useState<{ type: 'success' | 'warn'; text: string } | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCloudSync = async () => {
    const res = await syncBinsToSupabase();
    setCloudMessage({ type: res.success ? 'success' : 'warn', text: res.message });
    setTimeout(() => setCloudMessage(null), 6000);
  };

  const handleCloudFetch = async () => {
    const res = await fetchBinsFromSupabase();
    setCloudMessage({ type: res.success ? 'success' : 'warn', text: res.message });
    setTimeout(() => setCloudMessage(null), 6000);
  };

  const totalWeight = Math.round((fillWeight + waitingWeight + specialWeight) * 100) / 100;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWeights({
      fillWeight,
      waitingTimeWeight: waitingWeight,
      specialPriorityWeight: specialWeight,
      criticalFillThreshold: critThreshold,
      highFillThreshold: highThreshold,
      mediumFillThreshold: medThreshold,
      fuelCostPerLiter: fuelCost,
      dieselKmPerLiter: dieselKm,
      co2KgPerLiter: co2Factor,
    });
    setSavedMessage('Algorithm parameters and thresholds updated successfully! All bin priorities recalculated.');
    setTimeout(() => setSavedMessage(null), 4000);
  };

  const handleRestoreDefaults = () => {
    setFillWeight(DEFAULT_ALGORITHM_WEIGHTS.fillWeight);
    setWaitingWeight(DEFAULT_ALGORITHM_WEIGHTS.waitingTimeWeight);
    setSpecialWeight(DEFAULT_ALGORITHM_WEIGHTS.specialPriorityWeight);
    setCritThreshold(DEFAULT_ALGORITHM_WEIGHTS.criticalFillThreshold);
    setHighThreshold(DEFAULT_ALGORITHM_WEIGHTS.highFillThreshold);
    setMedThreshold(DEFAULT_ALGORITHM_WEIGHTS.mediumFillThreshold);
    setFuelCost(DEFAULT_ALGORITHM_WEIGHTS.fuelCostPerLiter);
    setDieselKm(DEFAULT_ALGORITHM_WEIGHTS.dieselKmPerLiter);
    setCo2Factor(DEFAULT_ALGORITHM_WEIGHTS.co2KgPerLiter);

    updateWeights(DEFAULT_ALGORITHM_WEIGHTS);
    setSavedMessage('Restored default algorithm weights and economic parameters.');
    setTimeout(() => setSavedMessage(null), 3500);
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      {/* Top Header Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-base font-semibold text-white">Algorithm Calibration &amp; Heuristic Weights</h2>
        <p className="text-xs text-slate-400 mt-1">
          Tune the multi-criteria optimization weights, overflow alert thresholds, and municipal fuel cost factors.
        </p>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3.5 text-xs text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {cloudMessage && (
        <div
          className={`flex items-center justify-between rounded-xl border p-3.5 text-xs ${
            cloudMessage.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
              : 'border-amber-500/40 bg-amber-950/20 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {cloudMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            )}
            <span>{cloudMessage.text}</span>
          </div>
          <button onClick={() => setCloudMessage(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Supabase Cloud Integration Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Supabase Cloud Database</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    supabaseStatus === 'connected'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : supabaseStatus === 'table-missing'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {supabaseStatus === 'connected'
                    ? 'Connected & Live'
                    : supabaseStatus === 'table-missing'
                    ? 'Schema Setup Required'
                    : 'Disconnected'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Centralized PostgreSQL data storage, realtime sync, and municipal state persistence
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSqlModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Code2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>SQL Schema Migration</span>
          </button>
        </div>

        {/* Project Endpoint & Key */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Supabase Project URL:</span>
            <p className="font-mono text-emerald-300 text-xs truncate">
              https://qvojeargwguulydefwuv.supabase.co
            </p>
          </div>
          <div className="rounded-lg border border-slate-800/80 bg-slate-950/60 p-3 space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Publishable / Anon Key:</span>
            <p className="font-mono text-slate-300 text-xs truncate">
              sb_publishable_IPYZReEcFYX8Bf91G01Z_Q_Lf2Lyi7t
            </p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
          <div className="text-xs text-slate-400">
            {lastCloudSyncTime ? (
              <span>Last cloud sync: <strong className="text-white font-mono">{lastCloudSyncTime}</strong></span>
            ) : (
              <span>Cloud state is ready for synchronization.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCloudFetch}
              disabled={isSyncingToCloud}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white disabled:opacity-50 transition-colors"
            >
              <CloudDownload className="h-3.5 w-3.5 text-cyan-400" />
              <span>Fetch from Cloud</span>
            </button>

            <button
              onClick={handleCloudSync}
              disabled={isSyncingToCloud}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-sm"
            >
              <CloudUpload className="h-3.5 w-3.5" />
              <span>{isSyncingToCloud ? 'Syncing...' : 'Sync Bins to Cloud'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SQL Migration Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0B1220] p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">Supabase PostgreSQL Schema Migration</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-300">
              Copy and execute this script once in your Supabase SQL Editor to provision the tables for bins, trucks, alerts, and collection logs:
            </p>

            <div className="relative mt-3 flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs">
              <button
                onClick={handleCopySql}
                className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
              <pre className="h-64 overflow-y-auto text-slate-300 text-[11px] leading-relaxed pr-24">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-3">
              <a
                href="https://supabase.com/dashboard/project/qvojeargwguulydefwuv/sql"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
              >
                <span>Open Supabase SQL Editor</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <button
                onClick={() => setShowSqlModal(false)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Heuristic Notice */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-amber-300">
          <Info className="h-4 w-4" />
          <span>Notice on Heuristic Model Calibration</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          The scoring formula is a prototype heuristic engineered for hackathon simulation. In production municipal deployments,
          these weights must be calibrated using historical telemetry, road congestion, and ward sanitation SLAs.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Priority Formula Weights */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">1. Priority Score Component Weights</h3>
              <p className="text-xs text-slate-400">Score = (w_f &times; Fill) + (w_w &times; WaitingTime) + (w_s &times; Special)</p>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-slate-400">Sum:</span>
              <span className={`font-bold ${totalWeight === 1.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {totalWeight.toFixed(2)} / 1.00
              </span>
            </div>
          </div>

          {/* Weight 1: Fill */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Fill Percentage Weight (w_f):</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{(fillWeight * 100).toFixed(0)}% ({fillWeight.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={fillWeight}
              onChange={(e) => setFillWeight(parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer accent-emerald-500"
            />
            <p className="text-[11px] text-slate-400">Influence of ultrasonic sensor fullness reading.</p>
          </div>

          {/* Weight 2: Waiting Time */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Waiting-Time Score Weight (w_w):</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{(waitingWeight * 100).toFixed(0)}% ({waitingWeight.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.05"
              value={waitingWeight}
              onChange={(e) => setWaitingWeight(parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer accent-amber-500"
            />
            <p className="text-[11px] text-slate-400">Hours since last service (&times; 10, capped at 100).</p>
          </div>

          {/* Weight 3: Special Civic Priority */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Special Civic Zone Priority Weight (w_s):</span>
              <span className="font-mono font-bold text-indigo-400 text-sm">{(specialWeight * 100).toFixed(0)}% ({specialWeight.toFixed(2)})</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.05"
              value={specialWeight}
              onChange={(e) => setSpecialWeight(parseFloat(e.target.value))}
              className="h-2 w-full cursor-pointer accent-indigo-500"
            />
            <p className="text-[11px] text-slate-400">Fixed boost for hospitals, transit hubs, and schools.</p>
          </div>
        </div>

        {/* Section 2: Alert Thresholds */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">2. Overflow Risk Alert Thresholds (%)</h3>
            <p className="text-xs text-slate-400">Defines when bins trigger critical alerts or high priority urgency tags</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Critical Overflow (%):</label>
              <input
                type="number"
                min="50"
                max="95"
                value={critThreshold}
                onChange={(e) => setCritThreshold(parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-red-500/40 bg-slate-950/80 py-2 px-3 text-red-300 font-mono font-bold focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default: 85%</span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">High Urgency (%):</label>
              <input
                type="number"
                min="40"
                max="85"
                value={highThreshold}
                onChange={(e) => setHighThreshold(parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-orange-500/40 bg-slate-950/80 py-2 px-3 text-orange-300 font-mono font-bold focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default: 70%</span>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Medium Urgency (%):</label>
              <input
                type="number"
                min="20"
                max="60"
                value={medThreshold}
                onChange={(e) => setMedThreshold(parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-yellow-500/40 bg-slate-950/80 py-2 px-3 text-yellow-300 font-mono font-bold focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default: 45%</span>
            </div>
          </div>
        </div>

        {/* Section 3: Fuel & Cost Assumptions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white">3. Economic &amp; Environmental Factors</h3>
            <p className="text-xs text-slate-400">Used for fuel savings and carbon offset estimates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Diesel Fuel Price (₹ / Liter):</label>
              <input
                type="number"
                min="50"
                max="200"
                step="1"
                value={fuelCost}
                onChange={(e) => setFuelCost(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Fleet Fuel Rating (km / Liter):</label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={dieselKm}
                onChange={(e) => setDieselKm(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">CO2 Emission (kg / Liter):</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.01"
                value={co2Factor}
                onChange={(e) => setCo2Factor(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Restore Default Calibration</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save &amp; Recalculate Grid</span>
          </button>
        </div>
      </form>
    </div>
  );
};
