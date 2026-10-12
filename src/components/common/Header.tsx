import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuthModal } from './AuthModal';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  AlertTriangle,
  Truck,
  TrendingDown,
  ExternalLink,
  LayoutDashboard,
  User,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    activeView,
    setActiveView,
    isSimulationRunning,
    startSimulation,
    pauseSimulation,
    stepSimulation,
    resetSimulation,
    alerts,
    trucks,
    routeComparison,
    supabaseStatus,
    currentUser,
  } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);

  const activeAlertsCount = alerts.filter((a) => !a.resolved && a.severity === 'critical').length;
  const activeTrucksCount = trucks.filter((t) => t.status === 'en-route').length;

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    landing: { title: 'Home', subtitle: 'Public Portal & Innovation Overview' },
    dashboard: { title: 'Overview Dashboard', subtitle: 'Real-time Municipal Waste Operations' },
    monitoring: { title: 'Bin Monitoring System', subtitle: 'IoT Fill Levels, Urgent Thresholds & Details' },
    optimizer: { title: 'Route Optimizer', subtitle: 'Capacitated Vehicle Routing & TSP Engine' },
    map: { title: 'Interactive Map View', subtitle: 'Hyderabad City Geospatial Route & Bin Markers' },
    fleet: { title: 'Fleet Management', subtitle: 'Vehicle Capacities, Status & Dispatch Controls' },
    alerts: { title: 'Alerts & Notifications', subtitle: 'Automated Rule-Based Overflow Warnings' },
    analytics: { title: 'Analytics & Reports', subtitle: 'Mileage Savings, Waste Volume & Environmental ROI' },
    settings: { title: 'Algorithm Calibration', subtitle: 'Scoring Weights & Heuristic Parameters' },
  };

  const currentInfo = viewTitles[activeView] || viewTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-[#0B1220]/95 px-6 py-3.5 backdrop-blur-md">
      {/* Left: Section Title & Breadcrumb */}
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-slate-400 transition-colors hover:border-slate-700 hover:text-white lg:hidden"
            aria-label="Toggle navigation"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>EcoRoute AI</span>
            <span aria-hidden="true">/</span>
            <span className="text-emerald-400 font-medium">{currentInfo.title}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500 font-mono text-[11px]">Hyderabad Civic Grid</span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-white">{currentInfo.title}</h1>
        </div>
      </div>

      {/* Center/Right: Simulation Control Bar */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Simulation Demo Controller */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/80 p-1 shadow-sm">
          <span className="px-2.5 text-xs font-medium text-slate-400">Simulation:</span>
          {isSimulationRunning ? (
            <button
              onClick={pauseSimulation}
              className="flex items-center gap-1.5 rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/30"
              title="Pause Live Waste Generation"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={startSimulation}
              className="flex items-center gap-1.5 rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/30"
              title="Run Automated Waste Accumulation"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Run Simulation</span>
            </button>
          )}

          <button
            onClick={stepSimulation}
            className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
            title="Step waste fill forward by 1 tick"
          >
            <FastForward className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Step</span>
          </button>

          <button
            onClick={resetSimulation}
            className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-800/80 px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
            title="Reset Simulation Data"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Quick Operational Telemetry Badges */}
        <div className="hidden xl:flex items-center gap-2">
          {activeAlertsCount > 0 ? (
            <button
              onClick={() => setActiveView('alerts')}
              className="flex items-center gap-1.5 rounded-lg border border-red-900/60 bg-red-950/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900/40 transition-colors"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span>{activeAlertsCount} Critical</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-1.5 text-xs text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Normal Grid</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
            <Truck className="h-3.5 w-3.5 text-slate-400" />
            <span>{activeTrucksCount} En Route</span>
          </div>

          {routeComparison && (
            <div className="flex items-center gap-1.5 rounded-lg border border-emerald-900/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-300">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>{routeComparison.percentageSaved}% Saved</span>
            </div>
          )}

          {/* Supabase Cloud Sync Status */}
          <button
            onClick={() => setActiveView('settings')}
            title="Supabase Cloud Database Integration"
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              supabaseStatus === 'connected'
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40'
                : supabaseStatus === 'table-missing'
                ? 'border-amber-500/40 bg-amber-950/40 text-amber-300 hover:bg-amber-900/40'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                supabaseStatus === 'connected'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : supabaseStatus === 'table-missing'
                  ? 'bg-amber-400'
                  : 'bg-slate-500'
              }`}
            />
            <span className="font-mono text-[11px]">
              {supabaseStatus === 'connected'
                ? 'Supabase: Live'
                : supabaseStatus === 'table-missing'
                ? 'Supabase: Ready'
                : 'Supabase'}
            </span>
          </button>
        </div>

        {/* Portal / Landing Switcher */}
        {activeView === 'landing' ? (
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-medium text-slate-950 shadow-sm transition-colors hover:bg-emerald-400"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Open Dashboard</span>
          </button>
        ) : (
          <button
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Home Portal</span>
          </button>
        )}

        {/* User Account / Google Sign-In Button */}
        {currentUser ? (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-white hover:border-slate-700 transition-colors"
            title="Municipal Account Settings"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              {currentUser.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="max-w-[110px] truncate hidden md:inline text-[11px] text-slate-300">
              {currentUser.email?.split('@')[0]}
            </span>
          </button>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 hover:text-white transition-colors"
            title="Continue with Google via Supabase OAuth"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.54 0 2.93.56 4.02 1.48l3.02-3.02C17.21 1.76 14.77 1 12 1 7.5 1 3.67 3.58 1.8 7.34l3.66 2.84C6.34 7.36 8.94 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.82-.07-1.6-.2-2.3H12v4.6h6.48c-.28 1.48-1.12 2.73-2.38 3.58l3.68 2.86c2.15-1.99 3.72-4.92 3.72-8.74z"
              />
              <path
                fill="#FBBC05"
                d="M5.46 14.82c-.24-.72-.38-1.49-.38-2.32 0-.83.14-1.6.38-2.32L1.8 7.34C.66 9.62 0 12.22 0 15s.66 5.38 1.8 7.66l3.66-2.84z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.24 0 5.96-1.07 7.96-2.92l-3.68-2.86c-1.08.73-2.46 1.18-4.28 1.18-3.06 0-5.66-2.36-6.54-5.18L1.8 16c1.87 3.76 5.7 6.34 10.2 6.34z"
              />
            </svg>
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
};
