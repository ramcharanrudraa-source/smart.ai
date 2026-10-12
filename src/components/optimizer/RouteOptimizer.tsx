import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Navigation,
  RotateCcw,
  Play,
  Truck,
  MapPin,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency, formatDistance, formatDuration } from '../../utils/geo';

export const RouteOptimizer: React.FC = () => {
  const {
    bins,
    trucks,
    depots,
    selectedDepotId,
    setSelectedDepotId,
    selectedTruckId,
    setSelectedTruckId,
    activeRoutePlan,
    baselineRoute,
    routeComparison,
    runOptimization,
    resetRoute,
    setActiveView,
    weights,
  } = useApp();

  // State for candidate bin selection
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(() => {
    // Default selection: Bins needing service
    return bins
      .filter((b) => b.priorityLevel === 'critical' || b.priorityLevel === 'high' || b.fillPercentage >= 65)
      .map((b) => b.id);
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'warn'; text: string } | null>(null);

  const currentDepot = useMemo(
    () => depots.find((d) => d.id === selectedDepotId) || depots[0],
    [depots, selectedDepotId]
  );

  const currentTruck = useMemo(
    () => trucks.find((t) => t.id === selectedTruckId) || trucks[0],
    [trucks, selectedTruckId]
  );

  // Toggle single bin
  const toggleBinSelection = (binId: string) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(binId) ? prev.filter((id) => id !== binId) : [...prev, binId]
    );
  };

  // Select all urgent
  const selectAllUrgent = () => {
    const urgent = bins
      .filter((b) => b.priorityLevel === 'critical' || b.priorityLevel === 'high' || b.fillPercentage >= 65)
      .map((b) => b.id);
    setSelectedCandidateIds(urgent);
  };

  const selectAll = () => {
    setSelectedCandidateIds(bins.map((b) => b.id));
  };

  const clearSelection = () => {
    setSelectedCandidateIds([]);
  };

  // Run Solver
  const handleOptimize = () => {
    if (selectedCandidateIds.length === 0) {
      setNotification({ type: 'warn', text: 'Please select at least 1 bin container to optimize.' });
      return;
    }
    const result = runOptimization(selectedCandidateIds);
    setNotification({ type: 'success', text: result.message });
  };

  // Estimated total candidate weight
  const estimatedCandidateWeight = useMemo(() => {
    return bins
      .filter((b) => selectedCandidateIds.includes(b.id))
      .reduce((acc, b) => acc + Math.round(b.capacityKg * (b.fillPercentage / 100)), 0);
  }, [bins, selectedCandidateIds]);

  const isOverweight = estimatedCandidateWeight > currentTruck.maxCapacityKg;

  return (
    <div className="space-y-6 p-6">
      {/* Disclaimer / Integration notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            Distance calculations use Haversine Great-Circle coordinates with Hyderabad urban road curvature approximations (+18%). Ready for OSRM / Google Directions API hook.
          </span>
        </div>
        {activeRoutePlan && (
          <button
            onClick={() => setActiveView('map')}
            className="flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 underline"
          >
            <span>View Polyline on Map</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between rounded-xl border p-3.5 text-xs ${
            notification.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-200'
              : 'border-amber-500/40 bg-amber-950/20 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            )}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Top Configuration & Control Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 1. Depot & Truck Parameters */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">1. Depot &amp; Vehicle Setup</h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Starting Municipal Depot:</label>
            <select
              value={selectedDepotId}
              onChange={(e) => setSelectedDepotId(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              {depots.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.address.split(',')[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Collection Compactor Unit:</label>
            <select
              value={selectedTruckId}
              onChange={(e) => setSelectedTruckId(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              {trucks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.plateNumber}) · Cap: {t.maxCapacityKg} kg [{t.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Truck Capacity Indicator */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Truck Max Capacity:</span>
              <span className="font-mono font-bold text-white">{currentTruck.maxCapacityKg} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Selected Candidate Load:</span>
              <span
                className={`font-mono font-bold ${
                  isOverweight ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {estimatedCandidateWeight} kg
              </span>
            </div>
            {isOverweight && (
              <p className="text-[11px] text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                Algorithm will prioritize top critical stops and defer excess payload.
              </p>
            )}
          </div>
        </div>

        {/* 2. Candidate Stop Selection */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-3 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">2. Select Bins to Collect</h2>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={selectAllUrgent}
                  className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:text-white"
                >
                  Select Urgent
                </button>
                <button
                  onClick={selectAll}
                  className="rounded bg-slate-800 px-2 py-1 text-slate-300 hover:text-white"
                >
                  All ({bins.length})
                </button>
                <button
                  onClick={clearSelection}
                  className="rounded bg-slate-800 px-2 py-1 text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Click individual bins to toggle inclusion in the route solver:
            </p>

            {/* Quick Chips of Bins */}
            <div className="mt-3 flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {bins.map((bin) => {
                const isSelected = selectedCandidateIds.includes(bin.id);
                return (
                  <button
                    key={bin.id}
                    onClick={() => toggleBinSelection(bin.id)}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                      isSelected
                        ? 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-mono font-bold">{bin.id}</span>
                    <span className="text-[11px] truncate max-w-[100px]">{bin.area}</span>
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        bin.fillPercentage >= 85
                          ? 'text-red-400'
                          : bin.fillPercentage >= 70
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {bin.fillPercentage}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
            <span className="text-xs text-slate-400 font-mono">
              Selected: <strong>{selectedCandidateIds.length}</strong> containers (~{estimatedCandidateWeight} kg)
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={resetRoute}
                className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleOptimize}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-all hover:scale-[1.01]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Optimize Route</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Metrics Section */}
      {routeComparison && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">
                Algorithmic Route Comparison &amp; Savings Report
              </h2>
            </div>
            <span className="rounded bg-emerald-500/20 px-2.5 py-1 font-mono text-xs font-bold text-emerald-300">
              {routeComparison.percentageSaved}% Tour Distance Reduction
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[11px] text-slate-400">Baseline Distance</span>
              <p className="mt-1 font-mono text-lg font-bold text-slate-400 line-through">
                {routeComparison.baselineDistanceKm} km
              </p>
              <p className="text-[10px] text-slate-500">Unordered fixed loop</p>
            </div>

            <div className="rounded-lg border border-emerald-500/40 bg-slate-900/80 p-3">
              <span className="text-[11px] text-emerald-400 font-semibold">Optimized Distance</span>
              <p className="mt-1 font-mono text-lg font-bold text-emerald-400">
                {routeComparison.optimizedDistanceKm} km
              </p>
              <p className="text-[10px] text-emerald-500/80">Nearest-Neighbor + 2-Opt</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[11px] text-slate-400">Mileage Saved</span>
              <p className="mt-1 font-mono text-lg font-bold text-white">
                {routeComparison.distanceSavedKm} km
              </p>
              <p className="text-[10px] text-slate-500">Direct road savings</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[11px] text-slate-400">Fuel Conserved</span>
              <p className="mt-1 font-mono text-lg font-bold text-cyan-400">
                {routeComparison.fuelSavedLiters} L
              </p>
              <p className="text-[10px] text-slate-500">@{weights.dieselKmPerLiter} km/L diesel</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[11px] text-slate-400">CO2 Emissions Prevented</span>
              <p className="mt-1 font-mono text-lg font-bold text-teal-400">
                {routeComparison.carbonSavedKg} kg
              </p>
              <p className="text-[10px] text-slate-500">Carbon offset</p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[11px] text-slate-400">Estimated Cost Saved</span>
              <p className="mt-1 font-mono text-lg font-bold text-emerald-300">
                {formatCurrency(routeComparison.costSavedInr)}
              </p>
              <p className="text-[10px] text-slate-500">This dispatch shift</p>
            </div>
          </div>
        </div>
      )}

      {/* Generated Stop Sequence Table */}
      {activeRoutePlan && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">
                  Generated Route Itinerary · {activeRoutePlan.truckName}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Depot: {activeRoutePlan.depotName} · Total Stops: {activeRoutePlan.stops.length} · Payload: {activeRoutePlan.totalWeightCollectedKg} kg ({activeRoutePlan.capacityUtilizationPct}% utilized)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveView('map')}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" />
                <span>Show On Map</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                  <th className="py-2.5 px-3 font-semibold">Sequence</th>
                  <th className="py-2.5 px-3 font-semibold">Location &amp; Coordinates</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold">Fill &amp; Weight</th>
                  <th className="py-2.5 px-3 font-semibold">Leg Distance</th>
                  <th className="py-2.5 px-3 font-semibold">Cumulative Distance</th>
                  <th className="py-2.5 px-3 font-semibold">Est. Leg Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {/* Depot Start Row */}
                <tr className="bg-slate-950/20 font-sans text-slate-400">
                  <td className="py-2 px-3 font-mono text-cyan-400 font-bold">START</td>
                  <td className="py-2 px-3 font-semibold text-white">
                    {currentDepot.name} <span className="text-[11px] text-slate-500 font-mono">({currentDepot.lat}, {currentDepot.lng})</span>
                  </td>
                  <td className="py-2 px-3 text-slate-500">Depot Base</td>
                  <td className="py-2 px-3 text-slate-500">0 kg</td>
                  <td className="py-2 px-3 text-slate-500">0.0 km</td>
                  <td className="py-2 px-3 text-slate-500">0.0 km</td>
                  <td className="py-2 px-3 text-slate-500">0 min</td>
                </tr>

                {activeRoutePlan.stops.map((stop) => (
                  <tr key={stop.binId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      #{stop.stopNumber}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-semibold text-white">{stop.binName}</span>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {stop.binId} · {stop.area} ({stop.lat.toFixed(4)}, {stop.lng.toFixed(4)})
                      </p>
                    </td>
                    <td className="py-2.5 px-3 capitalize font-sans text-slate-300">
                      {stop.wasteType}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-white font-bold">{stop.fillPercentage}%</span>
                      <span className="text-slate-500 text-[11px] ml-1.5">({stop.estimatedWeightKg} kg)</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{stop.distanceFromPrevKm} km</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{stop.cumulativeDistanceKm} km</td>
                    <td className="py-2.5 px-3 text-slate-400">{stop.estimatedDurationMin} min</td>
                  </tr>
                ))}

                {/* Depot Return Row */}
                <tr className="bg-slate-950/20 font-sans text-slate-400">
                  <td className="py-2 px-3 font-mono text-cyan-400 font-bold">FINISH</td>
                  <td className="py-2 px-3 font-semibold text-white">
                    {currentDepot.name} <span className="text-[11px] text-slate-500 font-mono">(Unload &amp; Depot Return)</span>
                  </td>
                  <td className="py-2 px-3 text-slate-500">Depot Base</td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-400">
                    {activeRoutePlan.totalWeightCollectedKg} kg
                  </td>
                  <td className="py-2 px-3 text-slate-400 font-mono">Return leg</td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-400">
                    {activeRoutePlan.totalDistanceKm} km
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-white">
                    {activeRoutePlan.totalEstimatedTimeMin} min total
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
