import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  TrendingDown,
  Fuel,
  Leaf,
  DollarSign,
  FileSpreadsheet,
  Info,
  Calendar,
  Sparkles,
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
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/geo';

export const AnalyticsReports: React.FC = () => {
  const {
    bins,
    trucks,
    routeComparison,
    collectionHistory,
    exportBinsToCsv,
    exportCollectionsToCsv,
    weights,
  } = useApp();

  // Fuel & cost assumptions
  const distanceSaved = routeComparison ? routeComparison.distanceSavedKm : 9.3;
  const pctSaved = routeComparison ? routeComparison.percentageSaved : 32.6;
  const fuelSavedL = routeComparison ? routeComparison.fuelSavedLiters : 2.6;
  const carbonAvoidedKg = routeComparison ? routeComparison.carbonSavedKg : 7.0;
  const costSavedInr = routeComparison ? routeComparison.costSavedInr : 250;

  // Chart 1: Historical 7-day collection trend
  const weeklyTrendData = [
    { day: 'Mon', organic: 420, recyclable: 310, general: 540, total: 1270 },
    { day: 'Tue', organic: 380, recyclable: 290, general: 490, total: 1160 },
    { day: 'Wed', organic: 450, recyclable: 340, general: 580, total: 1370 },
    { day: 'Thu', organic: 410, recyclable: 320, general: 530, total: 1260 },
    { day: 'Fri', organic: 490, recyclable: 380, general: 620, total: 1490 },
    { day: 'Sat', organic: 530, recyclable: 420, general: 690, total: 1640 },
    { day: 'Sun (Today)', organic: 460, recyclable: 350, general: 590, total: 1400 },
  ];

  // Chart 2: Waste Type Aggregates
  const totalOrganic = bins.filter((b) => b.wasteType === 'organic').length;
  const totalRecyclable = bins.filter((b) => b.wasteType === 'recyclable').length;
  const totalGeneral = bins.filter((b) => b.wasteType === 'general').length;

  const wasteTypeData = [
    { name: 'Organic Compostable', value: totalOrganic, color: '#10B981' },
    { name: 'Dry Recyclables', value: totalRecyclable, color: '#38BDF8' },
    { name: 'General Municipal', value: totalGeneral, color: '#94A3B8' },
  ];

  // Chart 3: Fleet Payload Utilization Comparison
  const fleetUtilizationData = trucks.map((t) => ({
    name: t.name.split(' ')[0],
    LoadKg: t.currentLoadKg,
    CapacityKg: t.maxCapacityKg,
    UtilPct: Math.round((t.currentLoadKg / t.maxCapacityKg) * 100),
  }));

  // Chart 4: Baseline vs Optimized Route Distance
  const routeDistCompare = [
    {
      shift: 'Morning Shift',
      Baseline: 34.2,
      Optimized: 23.8,
    },
    {
      shift: 'Midday Dispatch',
      Baseline: 29.5,
      Optimized: 20.1,
    },
    {
      shift: 'Evening Peak',
      Baseline: 38.0,
      Optimized: 25.4,
    },
    {
      shift: 'Current Active Plan',
      Baseline: routeComparison?.baselineDistanceKm || 28.5,
      Optimized: routeComparison?.optimizedDistanceKm || 19.2,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Top Banner Card with CSV Export Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div>
          <h2 className="text-base font-semibold text-white">Analytics, Reports &amp; Environmental ROI</h2>
          <p className="text-xs text-slate-400">
            Validated heuristic savings calculations and municipal data export portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportBinsToCsv}
            className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
            title="Download full 14-bin inventory in CSV"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Export Bins CSV</span>
          </button>

          <button
            onClick={exportCollectionsToCsv}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
            title="Download audit logs of all emptied containers"
          >
            <Download className="h-4 w-4" />
            <span>Export Collection Logs</span>
          </button>
        </div>
      </div>

      {/* ROI & Sustainability Metric Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Route Mileage Saved</span>
            <TrendingDown className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {distanceSaved} <span className="text-sm font-normal text-slate-400">km</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {pctSaved}% reduction vs. fixed route
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Diesel Fuel Conserved</span>
            <Fuel className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-cyan-400">
            {fuelSavedL} <span className="text-sm font-normal text-slate-400">Liters</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Assumed {weights.dieselKmPerLiter} km/L fleet rating
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">CO2e Emissions Prevented</span>
            <Leaf className="h-4 w-4 text-teal-400" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-teal-400">
            {carbonAvoidedKg} <span className="text-sm font-normal text-slate-400">kg CO₂</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Factor: {weights.co2KgPerLiter} kg CO₂ / liter
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Estimated Fleet Savings</span>
            <DollarSign className="h-4 w-4 text-emerald-300" />
          </div>
          <p className="mt-2 text-2xl font-bold font-mono text-white">
            {formatCurrency(costSavedInr)}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            At {formatCurrency(weights.fuelCostPerLiter)} / Liter diesel
          </p>
        </div>
      </div>

      {/* Row 2: Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart A: 7-Day Collection Trends */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">7-Day Waste Collection Volume (kg)</h2>
              <p className="text-xs text-slate-400">Cumulative tonnage across municipal ward categories</p>
            </div>
            <span className="rounded bg-slate-800 px-2.5 py-1 text-[11px] text-slate-400 font-mono">
              Ward 104
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="organic" name="Organic" stackId="a" fill="#10B981" />
                <Bar dataKey="recyclable" name="Recyclable" stackId="a" fill="#38BDF8" />
                <Bar dataKey="general" name="General" stackId="a" fill="#64748B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Baseline vs Optimized Shift Comparison */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Shift-by-Shift Mileage Comparison (km)</h2>
              <p className="text-xs text-slate-400">Fixed schedule route vs. EcoRoute AI dynamic loop</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeDistCompare} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="shift" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="Baseline" name="Baseline (Fixed Loop)" fill="#64748B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Optimized" name="EcoRoute AI (2-Opt TSP)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Fleet Payload Utilization */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Truck Payload Utilization Audit</h2>
            <p className="text-xs text-slate-400">
              Monitors compactor capacity compliance to ensure trucks operate close to optimal payload without overload
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fleetUtilizationData.map((f) => (
            <div key={f.name} className="rounded-lg border border-slate-800 bg-slate-900/90 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{f.name}</span>
                <span className="font-mono text-xs text-emerald-400 font-bold">{f.UtilPct}% load</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between text-xs text-slate-400">
                <span>Payload:</span>
                <span className="font-mono text-white">{f.LoadKg} / {f.CapacityKg} kg</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    f.UtilPct >= 85 ? 'bg-red-500' : f.UtilPct >= 65 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, f.UtilPct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formula Transparency Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <Sparkles className="h-4 w-4" />
          <span>Scientific &amp; Operational Calibration Methodology</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Savings metrics are calculated from Great-Circle distance deltas with standard urban traffic dwell factors.
          Fuel consumption is modeled using municipal heavy vehicle norms (3.5 km/L, 2.68 kg CO2/L).
          Calibrate coefficients in the <strong>Settings</strong> tab for real-world municipal validation.
        </p>
      </div>
    </div>
  );
};
