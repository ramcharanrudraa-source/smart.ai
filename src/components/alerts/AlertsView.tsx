import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertSeverity } from '../../types';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Clock,
  RotateCcw,
  Trash2,
  Navigation,
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const {
    alerts,
    bins,
    trucks,
    acknowledgeAlert,
    resolveAlert,
    clearAllResolvedAlerts,
    setActiveView,
    markBinCollected,
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<'all' | AlertSeverity>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchSev = severityFilter === 'all' || a.severity === severityFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !a.resolved) ||
        (statusFilter === 'resolved' && a.resolved);
      return matchSev && matchStatus;
    });
  }, [alerts, severityFilter, statusFilter]);

  const activeCount = alerts.filter((a) => !a.resolved).length;
  const criticalCount = alerts.filter((a) => !a.resolved && a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => !a.resolved && a.severity === 'warning').length;

  return (
    <div className="space-y-6 p-6">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div>
          <h2 className="text-base font-semibold text-white">Alerts &amp; Operational Warnings</h2>
          <p className="text-xs text-slate-400">
            Real-time threshold triggers: Ultrasonic overflow warnings, payload spikes, and unserviced civic hubs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearAllResolvedAlerts}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear Resolved</span>
          </button>
        </div>
      </div>

      {/* Metric Counters Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Unresolved</span>
            <Bell className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-white">{activeCount}</p>
          <p className="mt-1 text-[11px] text-slate-500">Requires dispatcher review</p>
        </div>

        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4">
          <div className="flex items-center justify-between text-red-300">
            <span className="text-xs font-semibold">Critical Overflows</span>
            <ShieldAlert className="h-4 w-4 text-red-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-red-400">{criticalCount}</p>
          <p className="mt-1 text-[11px] text-red-300/80">&gt;85% sensor fullness</p>
        </div>

        <div className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-xs font-semibold">Warnings / Capacity</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-amber-400">{warningCount}</p>
          <p className="mt-1 text-[11px] text-amber-300/80">Elevated collection priority</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'active' ? 'bg-slate-800 text-emerald-400 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1 rounded-md transition-colors ${
              statusFilter === 'resolved' ? 'bg-slate-800 text-slate-300 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved ({alerts.filter((a) => a.resolved).length})
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="rounded-lg border border-slate-800 bg-slate-950/80 py-1.5 px-3 text-slate-300 focus:outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="warning">Warning Only</option>
            <option value="info">Info Only</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">No Matching Alerts</h3>
            <p className="mt-1 text-xs text-slate-400">All municipal alerts in this filter have been satisfied.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const linkedBin = alert.binId ? bins.find((b) => b.id === alert.binId) : null;

            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  alert.resolved
                    ? 'border-slate-800/60 bg-slate-900/30 opacity-75'
                    : alert.severity === 'critical'
                    ? 'border-red-900/60 bg-red-950/20'
                    : 'border-amber-900/50 bg-amber-950/20'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        alert.severity === 'critical'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">{alert.id}</span>
                    <span className="text-slate-500 text-xs">·</span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{alert.message}</p>

                  {linkedBin && (
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Area: <strong className="text-slate-200">{linkedBin.area}</strong></span>
                      <span>·</span>
                      <span>Fill: <strong className="text-red-400 font-mono">{linkedBin.fillPercentage}%</strong></span>
                      <span>·</span>
                      <span>Assigned Truck: <strong className="text-slate-200">{linkedBin.assignedTruckId || 'None'}</strong></span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {linkedBin && !alert.resolved && (
                    <button
                      onClick={() => markBinCollected(linkedBin.id)}
                      className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                      title="Dispatch truck to empty bin immediately"
                    >
                      Quick Collect
                    </button>
                  )}

                  {!alert.acknowledged && !alert.resolved && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}

                  {!alert.resolved ? (
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors"
                    >
                      Resolve
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium font-mono">
                      <CheckCircle2 className="h-4 w-4" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
