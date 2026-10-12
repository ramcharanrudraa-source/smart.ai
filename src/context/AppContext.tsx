import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  AlertNotification,
  AlgorithmWeights,
  Depot,
  GarbageBin,
  RouteComparison,
  RoutePlan,
  Truck,
} from '../types';
import {
  getInitialBins,
  INITIAL_ALERTS,
  INITIAL_DEPOTS,
  INITIAL_TRUCKS,
} from '../data/mockData';
import { calculateBinPriority, DEFAULT_ALGORITHM_WEIGHTS } from '../utils/priority';
import {
  calculateRouteComparison,
  generateBaselineRoute,
  optimizeRoutePlan,
} from '../utils/optimizer';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'monitoring'
  | 'optimizer'
  | 'map'
  | 'fleet'
  | 'alerts'
  | 'analytics'
  | 'settings';

export interface CollectionHistoryRecord {
  id: string;
  binId: string;
  binName: string;
  area: string;
  wasteType: string;
  weightKg: number;
  truckId: string;
  collectedAt: string;
  fillAtCollection: number;
}

interface AppContextType {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  bins: GarbageBin[];
  trucks: Truck[];
  depots: Depot[];
  selectedDepotId: string;
  setSelectedDepotId: (id: string) => void;
  selectedTruckId: string;
  setSelectedTruckId: (id: string) => void;
  activeRoutePlan: RoutePlan | null;
  baselineRoute: {
    distanceKm: number;
    timeMin: number;
    stopsCount: number;
    stopCoordinates: [number, number][];
  } | null;
  routeComparison: RouteComparison | null;
  alerts: AlertNotification[];
  weights: AlgorithmWeights;
  collectionHistory: CollectionHistoryRecord[];
  isSimulationRunning: boolean;
  simulationTick: number;

  // Supabase Cloud State
  supabaseStatus: 'connected' | 'checking' | 'disconnected' | 'table-missing';
  isSyncingToCloud: boolean;
  lastCloudSyncTime: string | null;
  syncBinsToSupabase: () => Promise<{ success: boolean; message: string }>;
  fetchBinsFromSupabase: () => Promise<{ success: boolean; message: string }>;

  // Actions
  updateBinFill: (binId: string, fillPct: number) => void;
  markBinCollected: (binId: string, truckId?: string) => void;
  updateWeights: (newWeights: Partial<AlgorithmWeights>) => void;
  runOptimization: (candidateBinIds?: string[]) => { success: boolean; message: string };
  resetRoute: () => void;
  assignTruckToRoute: (truckId: string, stopIds: string[]) => { success: boolean; message: string };
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  clearAllResolvedAlerts: () => void;
  addTruck: (newTruck: Omit<Truck, 'id' | 'currentLoadKg' | 'assignedStops' | 'routeProgress'>) => void;
  updateTruck: (truckId: string, updates: Partial<Truck>) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  stepSimulation: () => void;
  resetSimulation: () => void;
  resetToDefaultData: () => void;
  exportBinsToCsv: () => void;
  exportCollectionsToCsv: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ecoroute_ai_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<AppView>('landing');
  const [bins, setBins] = useState<GarbageBin[]>(() => getInitialBins());
  const [trucks, setTrucks] = useState<Truck[]>(() => INITIAL_TRUCKS);
  const [depots] = useState<Depot[]>(INITIAL_DEPOTS);
  const [selectedDepotId, setSelectedDepotId] = useState<string>(INITIAL_DEPOTS[0].id);
  const [selectedTruckId, setSelectedTruckId] = useState<string>(INITIAL_TRUCKS[0].id);
  const [activeRoutePlan, setActiveRoutePlan] = useState<RoutePlan | null>(null);
  const [baselineRoute, setBaselineRoute] = useState<{
    distanceKm: number;
    timeMin: number;
    stopsCount: number;
    stopCoordinates: [number, number][];
  } | null>(null);
  const [routeComparison, setRouteComparison] = useState<RouteComparison | null>(null);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);
  const [weights, setWeights] = useState<AlgorithmWeights>(DEFAULT_ALGORITHM_WEIGHTS);
  const [collectionHistory, setCollectionHistory] = useState<CollectionHistoryRecord[]>([
    {
      id: 'COL-1',
      binId: 'BIN-108',
      binName: 'Bio-Diversity Park North Gate',
      area: 'Gachibowli',
      wasteType: 'organic',
      weightKg: 85,
      truckId: 'TRK-01',
      collectedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      fillAtCollection: 88,
    },
    {
      id: 'COL-2',
      binId: 'BIN-111',
      binName: 'Gachibowli Athletic Complex',
      area: 'Gachibowli',
      wasteType: 'general',
      weightKg: 110,
      truckId: 'TRK-02',
      collectedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      fillAtCollection: 92,
    },
    {
      id: 'COL-3',
      binId: 'BIN-110',
      binName: 'IKEA Boulevard Service Bay',
      area: 'HITEC City',
      wasteType: 'recyclable',
      weightKg: 140,
      truckId: 'TRK-01',
      collectedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      fillAtCollection: 84,
    },
    {
      id: 'COL-4',
      binId: 'BIN-114',
      binName: 'Financial District North Circle',
      area: 'Nanakramguda',
      wasteType: 'recyclable',
      weightKg: 105,
      truckId: 'TRK-03',
      collectedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      fillAtCollection: 79,
    },
  ]);

  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);
  const [simulationTick, setSimulationTick] = useState<number>(0);

  // Supabase Cloud State
  const [supabaseStatus, setSupabaseStatus] = useState<'connected' | 'checking' | 'disconnected' | 'table-missing'>('checking');
  const [isSyncingToCloud, setIsSyncingToCloud] = useState<boolean>(false);
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<string | null>(null);

  // Check Supabase connection on mount
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSupabaseStatus('disconnected');
      return;
    }

    const checkSupabase = async () => {
      try {
        const { error } = await supabase.from('bins').select('id').limit(1);
        if (error) {
          if (
            error.code === '42P01' ||
            error.message.includes('relation "public.bins" does not exist') ||
            error.message.includes('does not exist')
          ) {
            setSupabaseStatus('table-missing');
          } else {
            // Connection reached Supabase (API key and URL valid)
            setSupabaseStatus('connected');
          }
        } else {
          setSupabaseStatus('connected');
        }
      } catch (err) {
        setSupabaseStatus('disconnected');
      }
    };

    checkSupabase();
  }, []);

  // Sync Bins to Supabase Cloud
  const syncBinsToSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return { success: false, message: 'Supabase credentials are not configured.' };
    }
    setIsSyncingToCloud(true);
    try {
      const payload = bins.map((b) => ({
        id: b.id,
        name: b.name,
        area: b.area,
        lat: b.lat,
        lng: b.lng,
        fill_percentage: b.fillPercentage,
        capacity_kg: b.capacityKg,
        waste_type: b.wasteType,
        last_collection_time: b.lastCollectionTime,
        is_special_priority: b.isSpecialPriority,
        priority_score: b.priorityScore,
        priority_level: b.priorityLevel,
        assigned_truck_id: b.assignedTruckId || null,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('bins').upsert(payload);
      if (error) {
        if (
          error.code === '42P01' ||
          error.message.includes('relation "public.bins" does not exist') ||
          error.message.includes('does not exist')
        ) {
          setSupabaseStatus('table-missing');
          return {
            success: false,
            message: 'Supabase is connected, but "bins" table is not created yet. Please run the SQL schema in your Supabase SQL Editor.',
          };
        }
        return { success: false, message: error.message };
      }

      setSupabaseStatus('connected');
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastCloudSyncTime(timeStr);
      return { success: true, message: `Successfully synchronized ${bins.length} bins to Supabase cloud database!` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to sync with Supabase cloud.' };
    } finally {
      setIsSyncingToCloud(false);
    }
  }, [bins]);

  // Fetch Bins from Supabase Cloud
  const fetchBinsFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return { success: false, message: 'Supabase credentials are not configured.' };
    }
    setIsSyncingToCloud(true);
    try {
      const { data, error } = await supabase.from('bins').select('*');
      if (error) {
        if (
          error.code === '42P01' ||
          error.message.includes('relation "public.bins" does not exist') ||
          error.message.includes('does not exist')
        ) {
          setSupabaseStatus('table-missing');
          return {
            success: false,
            message: 'Table "bins" does not exist yet. Please run the SQL schema in Supabase.',
          };
        }
        return { success: false, message: error.message };
      }

      if (data && data.length > 0) {
        const loaded: GarbageBin[] = data.map((row: any) => {
          const raw = {
            id: row.id,
            name: row.name,
            area: row.area,
            lat: row.lat,
            lng: row.lng,
            fillPercentage: row.fill_percentage,
            capacityKg: row.capacity_kg,
            wasteType: row.waste_type,
            lastCollectionTime: row.last_collection_time,
            isSpecialPriority: row.is_special_priority,
          };
          const p = calculateBinPriority(raw, weights);
          return {
            ...raw,
            priorityScore: p.priorityScore,
            priorityLevel: p.priorityLevel,
            scoreBreakdown: p.scoreBreakdown,
            assignedTruckId: row.assigned_truck_id || null,
          };
        });

        setBins(loaded);
        setSupabaseStatus('connected');
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastCloudSyncTime(timeStr);
        return { success: true, message: `Loaded ${loaded.length} bins from Supabase cloud database.` };
      }

      return {
        success: true,
        message: 'Connected to Supabase, but "bins" table is currently empty. Run "Sync to Cloud" to populate initial records.',
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to fetch from Supabase.' };
    } finally {
      setIsSyncingToCloud(false);
    }
  }, [weights]);

  // Re-evaluate priorities whenever weights change
  const recalculateAllBins = useCallback((binsToRecalc: GarbageBin[], currentWeights: AlgorithmWeights) => {
    return binsToRecalc.map((bin) => {
      const { priorityScore, priorityLevel, scoreBreakdown } = calculateBinPriority(
        bin,
        currentWeights
      );
      return {
        ...bin,
        priorityScore,
        priorityLevel,
        scoreBreakdown,
      };
    });
  }, []);

  // Update single bin fill percentage
  const updateBinFill = useCallback((binId: string, fillPct: number) => {
    const clampedFill = Math.max(0, Math.min(100, Math.round(fillPct)));

    setBins((prevBins) => {
      const updated = prevBins.map((bin) => {
        if (bin.id !== binId) return bin;
        const candidate = { ...bin, fillPercentage: clampedFill };
        const { priorityScore, priorityLevel, scoreBreakdown } = calculateBinPriority(
          candidate,
          weights
        );
        return {
          ...candidate,
          priorityScore,
          priorityLevel,
          scoreBreakdown,
        };
      });

      // Check alert condition
      const targetBin = updated.find((b) => b.id === binId);
      if (targetBin && targetBin.fillPercentage >= weights.criticalFillThreshold) {
        setAlerts((currAlerts) => {
          const exists = currAlerts.some(
            (a) => a.binId === binId && !a.resolved && a.severity === 'critical'
          );
          if (!exists) {
            return [
              {
                id: `ALT-${Date.now()}`,
                binId,
                title: 'Immediate Overflow Alert',
                message: `${targetBin.name} has crossed critical threshold (${targetBin.fillPercentage}%). Urgent dispatch needed.`,
                severity: 'critical',
                timestamp: new Date().toISOString(),
                acknowledged: false,
                resolved: false,
              },
              ...currAlerts,
            ];
          }
          return currAlerts;
        });
      }

      return updated;
    });
  }, [weights]);

  // Mark bin collected
  const markBinCollected = useCallback((binId: string, truckId = 'TRK-01') => {
    setBins((prev) => {
      const target = prev.find((b) => b.id === binId);
      if (!target) return prev;

      const collectedWeight = Math.round(target.capacityKg * (target.fillPercentage / 100));

      // Append to history
      setCollectionHistory((hist) => [
        {
          id: `COL-${Date.now()}`,
          binId: target.id,
          binName: target.name,
          area: target.area,
          wasteType: target.wasteType,
          weightKg: collectedWeight,
          truckId,
          collectedAt: new Date().toISOString(),
          fillAtCollection: target.fillPercentage,
        },
        ...hist,
      ]);

      // Resolve alerts for this bin
      setAlerts((alts) =>
        alts.map((a) => (a.binId === binId ? { ...a, resolved: true, acknowledged: true } : a))
      );

      // Reset bin to 0% and update collection time
      return prev.map((bin) => {
        if (bin.id !== binId) return bin;
        const fresh = {
          ...bin,
          fillPercentage: 0,
          lastCollectionTime: new Date().toISOString(),
          assignedTruckId: null,
        };
        const { priorityScore, priorityLevel, scoreBreakdown } = calculateBinPriority(
          fresh,
          weights
        );
        return {
          ...fresh,
          priorityScore,
          priorityLevel,
          scoreBreakdown,
        };
      });
    });
  }, [weights]);

  // Update configurable weights
  const updateWeights = useCallback((newWeights: Partial<AlgorithmWeights>) => {
    setWeights((prev) => {
      const merged = { ...prev, ...newWeights };
      setBins((currentBins) => recalculateAllBins(currentBins, merged));
      return merged;
    });
  }, [recalculateAllBins]);

  // Selected depot and truck objects
  const activeDepot = useMemo(
    () => depots.find((d) => d.id === selectedDepotId) || depots[0],
    [depots, selectedDepotId]
  );
  const activeTruck = useMemo(
    () => trucks.find((t) => t.id === selectedTruckId) || trucks[0],
    [trucks, selectedTruckId]
  );

  // Run Route Optimization
  const runOptimization = useCallback(
    (candidateBinIds?: string[]) => {
      let targets: GarbageBin[] = [];

      if (candidateBinIds && candidateBinIds.length > 0) {
        targets = bins.filter((b) => candidateBinIds.includes(b.id));
      } else {
        // Urgent bins: Critical, High, or >= 65% fill
        targets = bins.filter(
          (b) =>
            b.priorityLevel === 'critical' ||
            b.priorityLevel === 'high' ||
            b.fillPercentage >= weights.mediumFillThreshold
        );
      }

      if (targets.length === 0) {
        // Fallback to top 5 urgent bins
        targets = [...bins].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5);
      }

      // Compute Baseline
      const baseline = generateBaselineRoute(targets, activeDepot);
      setBaselineRoute(baseline);

      // Compute Optimized Route
      const { routePlan, skippedBins, capacityExceeded } = optimizeRoutePlan(
        targets,
        activeTruck,
        activeDepot,
        weights
      );

      setActiveRoutePlan(routePlan);

      // Compute comparative metrics
      const comparison = calculateRouteComparison(
        baseline.distanceKm,
        baseline.timeMin,
        baseline.stopsCount,
        routePlan.totalDistanceKm,
        routePlan.totalEstimatedTimeMin,
        routePlan.stops.length,
        weights
      );
      setRouteComparison(comparison);

      // Update truck stop assignments in state
      setTrucks((prev) =>
        prev.map((t) =>
          t.id === activeTruck.id
            ? {
                ...t,
                assignedStops: routePlan.stops.map((s) => s.binId),
                currentLoadKg: routePlan.totalWeightCollectedKg,
                status: 'en-route',
              }
            : t
        )
      );

      let msg = `Optimized route generated with ${routePlan.stops.length} stops (${routePlan.totalDistanceKm} km).`;
      if (capacityExceeded && skippedBins.length > 0) {
        msg += ` ${skippedBins.length} bin(s) deferred due to vehicle capacity limits (${activeTruck.maxCapacityKg} kg).`;
      }

      return { success: true, message: msg };
    },
    [bins, activeTruck, activeDepot, weights]
  );

  const resetRoute = useCallback(() => {
    setActiveRoutePlan(null);
    setBaselineRoute(null);
    setRouteComparison(null);
    setTrucks((prev) =>
      prev.map((t) => (t.id === selectedTruckId ? { ...t, assignedStops: [], currentLoadKg: 0, status: 'available', routeProgress: 0 } : t))
    );
  }, [selectedTruckId]);

  // Assign Truck To Route with capacity check
  const assignTruckToRoute = useCallback(
    (truckId: string, stopIds: string[]) => {
      const targetTruck = trucks.find((t) => t.id === truckId);
      if (!targetTruck) return { success: false, message: 'Truck not found.' };

      const selectedBins = bins.filter((b) => stopIds.includes(b.id));
      const totalWeight = selectedBins.reduce(
        (acc, b) => acc + Math.round(b.capacityKg * (b.fillPercentage / 100)),
        0
      );

      if (totalWeight > targetTruck.maxCapacityKg) {
        return {
          success: false,
          message: `Capacity exceeded! Selected load is ${totalWeight} kg, but ${targetTruck.name} limit is ${targetTruck.maxCapacityKg} kg.`,
        };
      }

      setTrucks((prev) =>
        prev.map((t) =>
          t.id === truckId
            ? {
                ...t,
                assignedStops: stopIds,
                currentLoadKg: totalWeight,
                status: 'en-route',
              }
            : t
        )
      );

      setBins((prev) =>
        prev.map((b) => (stopIds.includes(b.id) ? { ...b, assignedTruckId: truckId } : b))
      );

      return {
        success: true,
        message: `${targetTruck.name} successfully assigned to ${stopIds.length} stops (${totalWeight} kg load).`,
      };
    },
    [trucks, bins]
  );

  // Alert management
  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true, acknowledged: true } : a))
    );
  }, []);

  const clearAllResolvedAlerts = useCallback(() => {
    setAlerts((prev) => prev.filter((a) => !a.resolved));
  }, []);

  // Truck CRUD
  const addTruck = useCallback(
    (newTruck: Omit<Truck, 'id' | 'currentLoadKg' | 'assignedStops' | 'routeProgress'>) => {
      const id = `TRK-${(trucks.length + 1).toString().padStart(2, '0')}`;
      const truck: Truck = {
        ...newTruck,
        id,
        currentLoadKg: 0,
        assignedStops: [],
        routeProgress: 0,
      };
      setTrucks((prev) => [...prev, truck]);
    },
    [trucks.length]
  );

  const updateTruck = useCallback((truckId: string, updates: Partial<Truck>) => {
    setTrucks((prev) => prev.map((t) => (t.id === truckId ? { ...t, ...updates } : t)));
  }, []);

  // Step Simulation: advances waste accumulation deterministically
  const stepSimulation = useCallback(() => {
    setSimulationTick((t) => t + 1);

    setBins((prevBins) => {
      // Deterministic cycle: increases bins realistically
      const updated = prevBins.map((bin, index) => {
        // High traffic areas grow faster
        const rate = (index % 3 === 0 ? 5 : index % 2 === 0 ? 3 : 2);
        const newFill = Math.min(100, bin.fillPercentage + rate);
        const candidate = { ...bin, fillPercentage: newFill };
        const { priorityScore, priorityLevel, scoreBreakdown } = calculateBinPriority(
          candidate,
          weights
        );
        return {
          ...candidate,
          priorityScore,
          priorityLevel,
          scoreBreakdown,
        };
      });

      // Scan for new overflows
      const newlyCritical = updated.filter(
        (b) => b.fillPercentage >= weights.criticalFillThreshold
      );

      if (newlyCritical.length > 0) {
        setAlerts((currAlerts) => {
          const fresh = [...currAlerts];
          newlyCritical.forEach((b) => {
            const alreadyAlerted = fresh.some(
              (a) => a.binId === b.id && !a.resolved && a.severity === 'critical'
            );
            if (!alreadyAlerted) {
              fresh.unshift({
                id: `ALT-SIM-${Date.now()}-${b.id}`,
                binId: b.id,
                title: 'Simulation: Urgent Overflow Detected',
                message: `${b.name} reached ${b.fillPercentage}% during peak waste accumulation.`,
                severity: 'critical',
                timestamp: new Date().toISOString(),
                acknowledged: false,
                resolved: false,
              });
            }
          });
          return fresh;
        });
      }

      return updated;
    });

    // Advance truck progress if en route
    setTrucks((prev) =>
      prev.map((t) => {
        if (t.status === 'en-route') {
          const nextProg = Math.min(100, t.routeProgress + 20);
          return {
            ...t,
            routeProgress: nextProg,
            status: nextProg >= 100 ? 'available' : 'en-route',
          };
        }
        return t;
      })
    );
  }, [weights]);

  // Simulation timer loop
  useEffect(() => {
    if (!isSimulationRunning) return;
    const interval = setInterval(() => {
      stepSimulation();
    }, 2800);
    return () => clearInterval(interval);
  }, [isSimulationRunning, stepSimulation]);

  const startSimulation = useCallback(() => setIsSimulationRunning(true), []);
  const pauseSimulation = useCallback(() => setIsSimulationRunning(false), []);

  const resetSimulation = useCallback(() => {
    setIsSimulationRunning(false);
    setSimulationTick(0);
    setBins(getInitialBins());
    setAlerts(INITIAL_ALERTS);
    setTrucks(INITIAL_TRUCKS);
    setActiveRoutePlan(null);
    setBaselineRoute(null);
    setRouteComparison(null);
  }, []);

  const resetToDefaultData = useCallback(() => {
    setIsSimulationRunning(false);
    setSimulationTick(0);
    setBins(getInitialBins());
    setTrucks(INITIAL_TRUCKS);
    setAlerts(INITIAL_ALERTS);
    setWeights(DEFAULT_ALGORITHM_WEIGHTS);
    setActiveRoutePlan(null);
    setBaselineRoute(null);
    setRouteComparison(null);
  }, []);

  // CSV Export utility
  const exportBinsToCsv = useCallback(() => {
    const headers = [
      'Bin ID',
      'Name',
      'Area',
      'Latitude',
      'Longitude',
      'Fill %',
      'Capacity (kg)',
      'Waste Type',
      'Priority Score',
      'Priority Level',
      'Special Civic Zone',
      'Last Collection',
      'Assigned Truck',
    ];

    const rows = bins.map((b) => [
      b.id,
      `"${b.name.replace(/"/g, '""')}"`,
      b.area,
      b.lat,
      b.lng,
      b.fillPercentage,
      b.capacityKg,
      b.wasteType,
      b.priorityScore,
      b.priorityLevel,
      b.isSpecialPriority ? 'YES' : 'NO',
      b.lastCollectionTime,
      b.assignedTruckId || 'None',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecoroute_bins_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [bins]);

  const exportCollectionsToCsv = useCallback(() => {
    const headers = [
      'Record ID',
      'Bin ID',
      'Bin Name',
      'Area',
      'Waste Type',
      'Weight Collected (kg)',
      'Truck ID',
      'Collected Timestamp',
      'Fill Level at Collection %',
    ];

    const rows = collectionHistory.map((c) => [
      c.id,
      c.binId,
      `"${c.binName.replace(/"/g, '""')}"`,
      c.area,
      c.wasteType,
      c.weightKg,
      c.truckId,
      c.collectedAt,
      c.fillAtCollection,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecoroute_collection_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [collectionHistory]);

  const value = {
    activeView,
    setActiveView,
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
    alerts,
    weights,
    collectionHistory,
    isSimulationRunning,
    simulationTick,
    updateBinFill,
    markBinCollected,
    updateWeights,
    runOptimization,
    resetRoute,
    assignTruckToRoute,
    acknowledgeAlert,
    resolveAlert,
    clearAllResolvedAlerts,
    addTruck,
    updateTruck,
    startSimulation,
    pauseSimulation,
    stepSimulation,
    resetSimulation,
    resetToDefaultData,
    exportBinsToCsv,
    exportCollectionsToCsv,
    supabaseStatus,
    isSyncingToCloud,
    lastCloudSyncTime,
    syncBinsToSupabase,
    fetchBinsFromSupabase,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
