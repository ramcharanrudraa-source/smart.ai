import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trash2,
  AlertTriangle,
  Truck,
  TrendingDown,
  Navigation,
  Fuel,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

export const OverviewDashboard: React.FC = () => {
  const {
    bins,
    trucks,
    alerts,
    routeComparison,
    activeRoutePlan,
    collectionHistory,
    setActiveView,
    updateBinFill,
    markBinCollected,
  } = useApp();

  // Metrics
  const totalBins = bins.length;
  const binsRequiringCollection = bins.filter(
    (b) => b.priorityLevel === 'critical' || b.priorityLevel === 'high' || b.fillPercentage >= 70
  ).length;
  const criticalOverflowAlerts = alerts.filter(
    (a) => !a.resolved && a.severity === 'critical'
  ).length;
  const activeTrucks = trucks.filter((t) => t.status === 'en-route').length;
  const totalRouteDistKm = activeRoutePlan
    ? activeRoutePlan.totalDistanceKm
    : routeComparison
    ? routeComparison.optimizedDistanceKm
    : 18.4;
  const fuelSavedPct = routeComparison ? routeComparison.percentageSaved : 31.8;
  const fuelSavedLiters = routeComparison ? routeComparison.fuelSavedLiters : 2.4;

  // Chart 1: Fill level distribution buckets
  const fillDistribution = [
    { range: '0-25%', count: bins.filter((b) => b.fillPercentage <= 25).length, fill: '#10B981' },
    { range: '26-50%', count: bins.filter((b) => b.fillPercentage > 25 && b.fillPercentage <= 50).length, fill: '#34D399' },
    { range: '51-70%', count: bins.filter((b) => b.fillPercentage > 50 && b.fillPercentage <= 70).length, fill: '#FBBF24' },
    { range: '71-85%', count: bins.filter((b) => b.fillPercentage > 70 && b.fillPercentage <= 85).length, fill: '#F97316' },
    { range: '>85% (Crit)', count: bins.filter((b) => b.fillPercentage > 85).length, fill: '#EF4444' },
  ];

  // Chart 2: Waste Type Distribution
  const wasteTypeData = [
    {
      name: 'Organic',
      value: bins.filter((b) => b.wasteType === 'organic').length,
      color: '#10B981',
    },
    {
      name: 'Recyclable',
      value: bins.filter((b) => b.wasteType === 'recyclable').length,
      color: '#38BDF8',
    },
    {
      name: 'General',
      value: bins.filter((b) => b.wasteType === 'general').length,
      color: '#94A3B8',
    },
  ];

  // Chart 3: Hourly simulated collection throughput
  const hourlyActivity = [
    { time: '06:00', weightKg: 320, bins: 2 },
    { time: '08:00', weightKg: 580, bins: 4 },
    { time: '10:00', weightKg: 490, bins: 3 },
    { time: '12:00', weightKg: 640, bins: 5 },
    { time: '14:00', weightKg: 410, bins: 3 },
    { time: '16:00', weightKg: 520, bins: 4 },
    { time: 'Now', weightKg: 280, bins: 2 },
  ];

  // Chart 4: Baseline vs Optimized comparison
  const comparisonChartData = [
    {
      name: 'Distance (km)',
      Baseline: routeComparison?.baselineDistanceKm || 28.5,
      Optimized: routeComparison?.optimizedDistanceKm || 19.2,
    },
    {
      name: 'Est. Time (min)',
      Baseline: routeComparison?.baselineTimeMin || 94,
      Optimized: routeComparison?.optimizedTimeMin || 68,
    },
  ];

  // Top urgent bins for quick action
  const urgentBins = [...bins]
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 4);

  // Active alerts (first 4)
  const activeAlerts = alerts.filter((a) => !a.resolved).slice(0, 4);

  return (
    <div className="space-y-6 p-6">
      {/* Simulation Banner Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            Demonstration mode enabled: All sensor telemetry and truck coordinates in Hyderabad are simulated for hackathon presentation.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('optimizer')}
            className="font-semibold text-emerald-400 hover:text-emerald-300 underline"
          >
            Launch Route Solver →
          </button>
        </div>
      </div>

      {/* KPI Cards Row (6 metrics) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* KPI 1 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Monitored Bins</span>
            <Trash2 className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-white">{totalBins}</p>
          <p className="mt-1 text-[11px] text-slate-400">Hyderabad Metro Grid</p>
        </div>

        {/* KPI 2 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Need Collection</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {binsRequiringCollection}
          </p>
          <p className="mt-1 text-[11px] text-amber-500/80">&ge;70% or High Priority</p>
        </div>

        {/* KPI 3 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Critical Overflows</span>
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-red-400">
            {criticalOverflowAlerts}
          </p>
          <p className="mt-1 text-[11px] text-red-400/80">&ge;85% threshold risks</p>
        </div>

        {/* KPI 4 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Trucks</span>
            <Truck className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-cyan-400">
            {activeTrucks} <span className="text-sm font-normal text-slate-500">/ {trucks.length}</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Assigned &amp; en-route</p>
        </div>

        {/* KPI 5 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Route Distance</span>
            <Navigation className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            {totalRouteDistKm} <span className="text-xs font-normal text-slate-400">km</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Depot round trip</p>
        </div>

        {/* KPI 6 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all hover:border-slate-700">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Fuel Conserved</span>
            <Fuel className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {fuelSavedPct}%
          </p>
          <p className="mt-1 text-[11px] text-emerald-500/80">~{fuelSavedLiters} L diesel saved</p>
        </div>
      </div>

      {/* Row 2: Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart A: Daily Activity Area Chart */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Daily Waste Collection Activity</h2>
              <p className="text-xs text-slate-400">Hourly payload volume collected (kg)</p>
            </div>
            <span className="rounded bg-slate-800 px-2.5 py-1 font-mono text-[11px] text-slate-300">
              Shift: 06:00 - 18:00
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="kgGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                  formatter={(val: any) => [`${val} kg`, 'Waste Weight']}
                />
                <Area
                  type="monotone"
                  dataKey="weightKg"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#kgGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Waste Type Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Waste Type Distribution</h2>
              <p className="text-xs text-slate-400">Segregation across civic containers</p>
            </div>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wasteTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {wasteTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-800 pt-3 text-center text-xs">
            {wasteTypeData.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400">{item.name}</span>
                </div>
                <p className="mt-1 font-mono font-bold text-white">{item.value} bins</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Fill Levels Histogram & Route Efficiency Comparison */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bin Fill Level Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Bin Fill-Level Distribution</h2>
              <p className="text-xs text-slate-400">Current sensor fullness bracket counts</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fillDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="range" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {fillDistribution.map((entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Baseline vs Optimized Comparison */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Route Efficiency: Baseline vs Optimized</h2>
              <p className="text-xs text-slate-400">Fixed schedule vs. EcoRoute AI algorithmic solver</p>
            </div>
            <button
              onClick={() => setActiveView('optimizer')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Configure →
            </button>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Baseline" fill="#64748B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Optimized" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex items-center justify-around border-t border-slate-800 pt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-slate-500" />
              <span className="text-slate-400">Baseline (Legacy Schedule)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-emerald-500" />
              <span className="text-emerald-400 font-semibold">EcoRoute AI (Nearest-Neighbor + 2-Opt)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Urgent Action Items & Recent Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Urgent Bins Requiring Action */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Urgent Bins Needing Dispatch</h2>
              <p className="text-xs text-slate-400">Sorted by dynamic priority score formula</p>
            </div>
            <button
              onClick={() => setActiveView('monitoring')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              View All 14 Bins →
            </button>
          </div>

          <div className="space-y-3">
            {urgentBins.map((bin) => (
              <div
                key={bin.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/90 p-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-white">{bin.id}</span>
                    <span className="text-xs text-slate-300 font-medium">{bin.name}</span>
                    {bin.isSpecialPriority && (
                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300">
                        Hospital/Civic
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                    <span>{bin.area}</span>
                    <span>·</span>
                    <span>Type: <strong className="text-slate-200 capitalize">{bin.wasteType}</strong></span>
                    <span>·</span>
                    <span>Priority Score: <strong className="text-white font-mono">{bin.priorityScore}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span
                      className={`font-mono text-sm font-bold ${
                        bin.fillPercentage >= 85
                          ? 'text-red-400'
                          : bin.fillPercentage >= 70
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {bin.fillPercentage}%
                    </span>
                    <div className="h-1.5 w-16 rounded-full bg-slate-800 mt-1">
                      <div
                        className={`h-1.5 rounded-full ${
                          bin.fillPercentage >= 85
                            ? 'bg-red-500'
                            : bin.fillPercentage >= 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${bin.fillPercentage}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => markBinCollected(bin.id)}
                    className="rounded-lg bg-emerald-500/20 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                    title="Mark collected now"
                  >
                    Collect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts Feed */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Operational System Alerts</h2>
              <p className="text-xs text-slate-400">Automated municipal warnings</p>
            </div>
            <button
              onClick={() => setActiveView('alerts')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Alerts Console ({alerts.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {activeAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-800 p-8 text-center">
                <ShieldCheck className="h-8 w-8 text-emerald-400 mb-2" />
                <p className="text-xs font-semibold text-slate-300">All alerts resolved</p>
                <p className="text-[11px] text-slate-500">Grid is operating within nominal thresholds</p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-3 text-xs ${
                    alert.severity === 'critical'
                      ? 'border-red-900/60 bg-red-950/20 text-red-200'
                      : 'border-amber-900/50 bg-amber-950/20 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <AlertTriangle
                        className={`h-3.5 w-3.5 ${
                          alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                        }`}
                      />
                      {alert.title}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-300 leading-relaxed">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 5: Recent Collection Logs */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Recent Waste Collection Manifest</h2>
            <p className="text-xs text-slate-400">Auditable municipal collection timestamp logs</p>
          </div>
          <button
            onClick={() => setActiveView('analytics')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            Export Complete History (CSV) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3 font-semibold">Manifest ID</th>
                <th className="py-2 px-3 font-semibold">Bin Location</th>
                <th className="py-2 px-3 font-semibold">Category</th>
                <th className="py-2 px-3 font-semibold">Payload Cleared</th>
                <th className="py-2 px-3 font-semibold">Assigned Truck</th>
                <th className="py-2 px-3 font-semibold">Collection Time</th>
                <th className="py-2 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {collectionHistory.slice(0, 4).map((record) => (
                <tr key={record.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-300">{record.id}</td>
                  <td className="py-2.5 px-3 font-sans text-white font-medium">{record.binName}</td>
                  <td className="py-2.5 px-3 capitalize font-sans text-slate-300">{record.wasteType}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{record.weightKg} kg</td>
                  <td className="py-2.5 px-3 text-cyan-300">{record.truckId}</td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(record.collectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Audited
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
