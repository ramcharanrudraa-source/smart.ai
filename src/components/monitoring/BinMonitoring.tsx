import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { GarbageBin, PriorityLevel, WasteType } from '../../types';
import {
  Search,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Clock,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  MapPin,
  Truck,
} from 'lucide-react';

export const BinMonitoring: React.FC = () => {
  const { bins, updateBinFill, markBinCollected, weights } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [wasteTypeFilter, setWasteTypeFilter] = useState<'all' | WasteType>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PriorityLevel>('all');
  const [sortBy, setSortBy] = useState<'fill-desc' | 'fill-asc' | 'priority-desc' | 'priority-asc' | 'id'>('priority-desc');
  const [selectedBinForModal, setSelectedBinForModal] = useState<GarbageBin | null>(null);

  // Filter & Sort
  const filteredBins = useMemo(() => {
    return bins
      .filter((bin) => {
        const matchesSearch =
          bin.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bin.area.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesType = wasteTypeFilter === 'all' || bin.wasteType === wasteTypeFilter;
        const matchesPriority = priorityFilter === 'all' || bin.priorityLevel === priorityFilter;

        return matchesSearch && matchesType && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === 'fill-desc') return b.fillPercentage - a.fillPercentage;
        if (sortBy === 'fill-asc') return a.fillPercentage - b.fillPercentage;
        if (sortBy === 'priority-desc') return b.priorityScore - a.priorityScore;
        if (sortBy === 'priority-asc') return a.priorityScore - b.priorityScore;
        if (sortBy === 'id') return a.id.localeCompare(b.id);
        return 0;
      });
  }, [bins, searchTerm, wasteTypeFilter, priorityFilter, sortBy]);

  // Color mappings
  const priorityBadge = (level: PriorityLevel, score: number) => {
    switch (level) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Critical ({score})
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-orange-500/15 px-2.5 py-0.5 text-xs font-semibold text-orange-400">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            High ({score})
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/15 px-2.5 py-0.5 text-xs font-semibold text-yellow-400">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
            Medium ({score})
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Low ({score})
          </span>
        );
    }
  };

  const wasteTypeBadge = (type: WasteType) => {
    switch (type) {
      case 'organic':
        return (
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            Organic
          </span>
        );
      case 'recyclable':
        return (
          <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-400 border border-sky-500/20">
            Recyclable
          </span>
        );
      case 'general':
        return (
          <span className="rounded bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/20">
            General
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Controls Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Garbage Bin Sensor Monitoring</h2>
            <p className="text-xs text-slate-400">
              Interactive simulator: Adjust fill levels with sliders to test real-time priority scoring &amp; overflow alarms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredBins.length} of {bins.length} containers
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, Area, or Name..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Waste Type Filter */}
          <div>
            <select
              value={wasteTypeFilter}
              onChange={(e) => setWasteTypeFilter(e.target.value as any)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Waste Types</option>
              <option value="organic">Organic Waste</option>
              <option value="recyclable">Recyclable Waste</option>
              <option value="general">General Waste</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical (&gt;85% or Overflows)</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
            >
              <option value="priority-desc">Sort by Urgency (Highest First)</option>
              <option value="priority-asc">Sort by Urgency (Lowest First)</option>
              <option value="fill-desc">Sort by Fill % (Highest First)</option>
              <option value="fill-asc">Sort by Fill % (Lowest First)</option>
              <option value="id">Sort by Bin ID</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                <th className="py-3 px-4 font-semibold">Bin ID &amp; Location</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Live Fill Adjustment</th>
                <th className="py-3 px-4 font-semibold">Urgency &amp; Priority Score</th>
                <th className="py-3 px-4 font-semibold">Last Collected</th>
                <th className="py-3 px-4 font-semibold">Truck Assignment</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredBins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No garbage bins matched your search or filters.
                  </td>
                </tr>
              ) : (
                filteredBins.map((bin) => (
                  <tr key={bin.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Bin ID & Location */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white">{bin.id}</span>
                            {bin.isSpecialPriority && (
                              <span className="rounded bg-indigo-500/20 px-1.5 py-0.2 text-[10px] text-indigo-300 font-medium border border-indigo-500/30">
                                Civic Hub
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 font-medium text-xs mt-0.5">{bin.name}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span>{bin.area}</span>
                            <span>·</span>
                            <span className="font-mono">{bin.lat.toFixed(4)}, {bin.lng.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      {wasteTypeBadge(bin.wasteType)}
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">
                        {bin.capacityKg} kg cap
                      </p>
                    </td>

                    {/* Live Fill Adjustment (Slider + Input) */}
                    <td className="py-3 px-4">
                      <div className="w-48 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Fullness:</span>
                          <span
                            className={`font-mono font-bold ${
                              bin.fillPercentage >= 85
                                ? 'text-red-400'
                                : bin.fillPercentage >= 70
                                ? 'text-orange-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {bin.fillPercentage}%
                          </span>
                        </div>
                        {/* Interactive Slider */}
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={bin.fillPercentage}
                            onChange={(e) => updateBinFill(bin.id, Number(e.target.value))}
                            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
                          />
                        </div>
                      </div>
                    </td>

                    {/* Priority & Score */}
                    <td className="py-3 px-4">
                      <div>
                        {priorityBadge(bin.priorityLevel, bin.priorityScore)}
                        <p className="text-[11px] text-slate-400 mt-1 truncate max-w-xs" title={bin.scoreBreakdown.explanation}>
                          {bin.scoreBreakdown.explanation}
                        </p>
                      </div>
                    </td>

                    {/* Last Collected */}
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        <span>{bin.scoreBreakdown.hoursSinceCollection}h ago</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(bin.lastCollectionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Truck Assignment */}
                    <td className="py-3 px-4 font-mono text-xs">
                      {bin.assignedTruckId ? (
                        <span className="inline-flex items-center gap-1 rounded bg-cyan-500/10 px-2 py-0.5 text-cyan-300 border border-cyan-500/20">
                          <Truck className="h-3 w-3" />
                          {bin.assignedTruckId}
                        </span>
                      ) : (
                        <span className="text-slate-500">Unassigned</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedBinForModal(bin)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300 hover:border-slate-600 hover:text-white transition-colors"
                          title="View mathematical score breakdown"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => markBinCollected(bin.id)}
                          className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                          title="Mark bin as collected right now"
                        >
                          Collect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bin Details Modal */}
      {selectedBinForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0B1220] p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-white">{selectedBinForModal.id}</span>
                  {priorityBadge(selectedBinForModal.priorityLevel, selectedBinForModal.priorityScore)}
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mt-1">{selectedBinForModal.name}</h3>
              </div>
              <button
                onClick={() => setSelectedBinForModal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-5 space-y-4 text-xs">
              {/* Formula Explanation Callout */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-1">
                  <Sparkles className="h-4 w-4" />
                  <span>Heuristic Priority Scoring Formula</span>
                </div>
                <p className="text-slate-300 font-mono text-[11px] leading-relaxed">
                  Priority Score = (0.60 &times; Fill) + (0.25 &times; Wait-Time) + (0.15 &times; Civic Priority)
                </p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Prototype municipal heuristic calibrated for Hyderabad IT Corridor demo.
                </p>
              </div>

              {/* Breakdown Rows */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-semibold text-white">Fill Component</span>
                    <p className="text-[11px] text-slate-400">
                      {selectedBinForModal.fillPercentage}% &times; {weights.fillWeight} weight
                    </p>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    +{(selectedBinForModal.fillPercentage * weights.fillWeight).toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-semibold text-white">Waiting Time Component</span>
                    <p className="text-[11px] text-slate-400">
                      {selectedBinForModal.scoreBreakdown.hoursSinceCollection}h wait (index: {selectedBinForModal.scoreBreakdown.waitingScore}) &times; {weights.waitingTimeWeight}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    +{(selectedBinForModal.scoreBreakdown.waitingScore * weights.waitingTimeWeight).toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-semibold text-white">Civic Zone Priority</span>
                    <p className="text-[11px] text-slate-400">
                      {selectedBinForModal.isSpecialPriority ? 'High civic risk (100)' : 'Standard zone (0)'} &times; {weights.specialPriorityWeight}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-indigo-400 text-sm">
                    +{(selectedBinForModal.scoreBreakdown.specialScore * weights.specialPriorityWeight).toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-white text-sm">Composite Priority Score</span>
                  <span className="font-mono font-extrabold text-white text-lg">
                    {selectedBinForModal.priorityScore} / 100
                  </span>
                </div>
              </div>

              {/* Reason Explanation */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                <span className="font-semibold text-slate-300">Decision Reason:</span>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  {selectedBinForModal.scoreBreakdown.explanation}
                </p>
              </div>

              {/* Slider inside modal for convenient test */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Simulate Fill Change for this Bin ({selectedBinForModal.fillPercentage}%):
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedBinForModal.fillPercentage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    updateBinFill(selectedBinForModal.id, val);
                    setSelectedBinForModal((prev) => (prev ? { ...prev, fillPercentage: val } : null));
                  }}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-emerald-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                onClick={() => setSelectedBinForModal(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  markBinCollected(selectedBinForModal.id);
                  setSelectedBinForModal(null);
                }}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
              >
                Mark Collected
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
