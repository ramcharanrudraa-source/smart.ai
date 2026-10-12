import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, TruckStatus } from '../../types';
import {
  Truck as TruckIcon,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Battery,
  Shield,
  X,
  Gauge,
  Phone,
  ArrowRight,
} from 'lucide-react';

export const FleetManagement: React.FC = () => {
  const {
    trucks,
    bins,
    addTruck,
    updateTruck,
    assignTruckToRoute,
    setActiveView,
    setSelectedTruckId,
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [assigningTruck, setAssigningTruck] = useState<Truck | null>(null);
  const [selectedStopsForAssignment, setSelectedStopsForAssignment] = useState<string[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formPlate, setFormPlate] = useState('');
  const [formDriver, setFormDriver] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCapacity, setFormCapacity] = useState('2500');
  const [formEfficiency, setFormEfficiency] = useState('3.5');

  const openAddModal = () => {
    setFormName('');
    setFormPlate('');
    setFormDriver('');
    setFormPhone('+91 98');
    setFormCapacity('2500');
    setFormEfficiency('3.5');
    setModalError(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (truck: Truck) => {
    setEditingTruck(truck);
    setFormName(truck.name);
    setFormPlate(truck.plateNumber);
    setFormDriver(truck.driverName);
    setFormPhone(truck.driverPhone);
    setFormCapacity(truck.maxCapacityKg.toString());
    setFormEfficiency(truck.fuelEfficiencyKmPerLiter.toString());
    setModalError(null);
  };

  const handleSaveTruck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formPlate || !formDriver) {
      setModalError('Please fill in vehicle name, plate number, and driver name.');
      return;
    }

    const cap = parseInt(formCapacity, 10);
    const eff = parseFloat(formEfficiency);

    if (editingTruck) {
      updateTruck(editingTruck.id, {
        name: formName,
        plateNumber: formPlate,
        driverName: formDriver,
        driverPhone: formPhone,
        maxCapacityKg: isNaN(cap) ? 2500 : cap,
        fuelEfficiencyKmPerLiter: isNaN(eff) ? 3.5 : eff,
      });
      setEditingTruck(null);
    } else {
      addTruck({
        name: formName,
        plateNumber: formPlate,
        driverName: formDriver,
        driverPhone: formPhone,
        maxCapacityKg: isNaN(cap) ? 2500 : cap,
        status: 'available',
        currentLat: 17.4474,
        currentLng: 78.3762,
        fuelEfficiencyKmPerLiter: isNaN(eff) ? 3.5 : eff,
      });
      setIsAddModalOpen(false);
    }
  };

  // Assign Stops Handlers
  const openAssignModal = (truck: Truck) => {
    setAssigningTruck(truck);
    setSelectedStopsForAssignment(truck.assignedStops.length > 0 ? [...truck.assignedStops] : []);
    setModalError(null);
  };

  const toggleStopInAssignment = (binId: string) => {
    setSelectedStopsForAssignment((prev) =>
      prev.includes(binId) ? prev.filter((id) => id !== binId) : [...prev, binId]
    );
  };

  const calculatedAssignmentWeight = bins
    .filter((b) => selectedStopsForAssignment.includes(b.id))
    .reduce((acc, b) => acc + Math.round(b.capacityKg * (b.fillPercentage / 100)), 0);

  const handleConfirmAssignment = () => {
    if (!assigningTruck) return;
    const res = assignTruckToRoute(assigningTruck.id, selectedStopsForAssignment);
    if (!res.success) {
      setModalError(res.message);
    } else {
      setAssigningTruck(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <div>
          <h2 className="text-base font-semibold text-white">Municipal Fleet Management</h2>
          <p className="text-xs text-slate-400">
            Real-time payload utilization, status overrides, and driver dispatch records.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Truck</span>
        </button>
      </div>

      {/* Truck Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trucks.map((truck) => {
          const loadPct = Math.round((truck.currentLoadKg / truck.maxCapacityKg) * 100);
          const isNearCap = loadPct >= 85;

          return (
            <div
              key={truck.id}
              className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <TruckIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">{truck.id}</span>
                        <span className="text-[11px] font-mono text-slate-400">{truck.plateNumber}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white">{truck.name}</h3>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={truck.status}
                    onChange={(e) => updateTruck(truck.id, { status: e.target.value as TruckStatus })}
                    className={`rounded-lg border px-2 py-1 text-xs font-semibold focus:outline-none ${
                      truck.status === 'en-route'
                        ? 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300'
                        : truck.status === 'maintenance'
                        ? 'border-red-500/40 bg-red-950/40 text-red-300'
                        : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                    }`}
                  >
                    <option value="available">Available</option>
                    <option value="en-route">En Route</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Driver Info */}
                <div className="mt-4 rounded-lg border border-slate-800/80 bg-slate-950/40 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Driver:</span>
                    <span className="font-semibold text-white">{truck.driverName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span>Phone:</span>
                    <span>{truck.driverPhone}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span>Fuel Rating:</span>
                    <span>{truck.fuelEfficiencyKmPerLiter} km/L</span>
                  </div>
                </div>

                {/* Payload Capacity Gauge */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Payload Load:</span>
                    <span className={`font-mono font-bold ${isNearCap ? 'text-red-400' : 'text-slate-200'}`}>
                      {truck.currentLoadKg} / {truck.maxCapacityKg} kg ({loadPct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isNearCap ? 'bg-red-500' : loadPct >= 65 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, loadPct)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Estimated based on bin density calculation.</p>
                </div>

                {/* Route Progress (if en-route) */}
                {truck.status === 'en-route' && (
                  <div className="mt-3 rounded-lg border border-cyan-900/40 bg-cyan-950/20 p-2.5 text-xs">
                    <div className="flex items-center justify-between text-cyan-300">
                      <span>Shift Progress:</span>
                      <span className="font-mono font-bold">{truck.routeProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 mt-1.5">
                      <div
                        className="h-1.5 rounded-full bg-cyan-400 transition-all duration-300"
                        style={{ width: `${truck.routeProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Assigned Stops Count */}
                <div className="mt-3 text-xs text-slate-400">
                  <span>Assigned Stops: </span>
                  <strong className="text-white font-mono">{truck.assignedStops.length} bins</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-800 pt-3">
                <button
                  onClick={() => openEditModal(truck)}
                  className="rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  Edit Vehicle
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAssignModal(truck)}
                    className="rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
                  >
                    Assign Stops
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTruckId(truck.id);
                      setActiveView('optimizer');
                    }}
                    className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
                  >
                    Solve Route
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Truck Modal */}
      {(isAddModalOpen || editingTruck) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0B1220] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white">
                {editingTruck ? `Edit Truck · ${editingTruck.id}` : 'Add New Municipal Truck'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingTruck(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-3 rounded-lg border border-red-500/30 bg-red-950/20 p-2.5 text-xs text-red-300">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveTruck} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Vehicle Model / Fleet Name:</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. EcoCompactor Delta"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">License Plate Number:</label>
                <input
                  type="text"
                  value={formPlate}
                  onChange={(e) => setFormPlate(e.target.value)}
                  placeholder="e.g. TS 08 UE 9012"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Driver Name:</label>
                  <input
                    type="text"
                    value={formDriver}
                    onChange={(e) => setFormDriver(e.target.value)}
                    placeholder="e.g. Ravi Teja"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Driver Phone:</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 98490 00000"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Payload Capacity (kg):</label>
                  <input
                    type="number"
                    min="500"
                    max="10000"
                    step="100"
                    value={formCapacity}
                    onChange={(e) => setFormCapacity(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-white focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Fuel Economy (km/L):</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.1"
                    value={formEfficiency}
                    onChange={(e) => setFormEfficiency(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/80 py-2 px-3 text-white focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingTruck(null);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  {editingTruck ? 'Save Changes' : 'Create Truck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Stops Modal with Strict Capacity Checking */}
      {assigningTruck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0B1220] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Assign Stops · {assigningTruck.name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Gross limit: <strong className="text-white font-mono">{assigningTruck.maxCapacityKg} kg</strong>
                </p>
              </div>
              <button onClick={() => setAssigningTruck(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-3 rounded-lg border border-red-500/40 bg-red-950/20 p-2.5 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Selected Load Weight:</span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      calculatedAssignmentWeight > assigningTruck.maxCapacityKg
                        ? 'text-red-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {calculatedAssignmentWeight} / {assigningTruck.maxCapacityKg} kg
                  </span>
                </div>
                {calculatedAssignmentWeight > assigningTruck.maxCapacityKg && (
                  <p className="mt-1 text-red-400 text-[11px]">
                    Warning: Cannot save assignment exceeding max vehicle payload.
                  </p>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                {bins.map((bin) => {
                  const isChecked = selectedStopsForAssignment.includes(bin.id);
                  const estWeight = Math.round(bin.capacityKg * (bin.fillPercentage / 100));

                  return (
                    <label
                      key={bin.id}
                      className={`flex items-center justify-between rounded-lg border p-2.5 cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStopInAssignment(bin.id)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 accent-emerald-500"
                        />
                        <div>
                          <span className="font-mono font-bold text-white mr-2">{bin.id}</span>
                          <span className="font-medium text-slate-200">{bin.name}</span>
                          <span className="text-slate-500 ml-2">({bin.area})</span>
                        </div>
                      </div>

                      <div className="text-right font-mono text-[11px]">
                        <span className="text-white font-bold">{bin.fillPercentage}%</span>
                        <span className="text-slate-500 ml-1">(~{estWeight} kg)</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setAssigningTruck(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssignment}
                disabled={calculatedAssignmentWeight > assigningTruck.maxCapacityKg}
                className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
