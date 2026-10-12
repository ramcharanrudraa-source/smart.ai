export type WasteType = 'organic' | 'recyclable' | 'general';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export type TruckStatus = 'available' | 'en-route' | 'maintenance';

export interface GarbageBin {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  fillPercentage: number;
  capacityKg: number; // Maximum waste weight in kg
  wasteType: WasteType;
  lastCollectionTime: string; // ISO string
  isSpecialPriority: boolean; // Schools, hospitals, tourist hubs
  priorityScore: number; // 0 - 100
  priorityLevel: PriorityLevel;
  assignedTruckId?: string | null;
  scoreBreakdown: {
    fillScore: number;
    waitingScore: number;
    specialScore: number;
    hoursSinceCollection: number;
    explanation: string;
  };
}

export interface Truck {
  id: string;
  name: string;
  plateNumber: string;
  driverName: string;
  driverPhone: string;
  maxCapacityKg: number;
  currentLoadKg: number;
  status: TruckStatus;
  currentLat: number;
  currentLng: number;
  assignedStops: string[]; // bin IDs
  routeProgress: number; // 0 to 100%
  fuelEfficiencyKmPerLiter: number;
}

export interface Depot {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface RouteStop {
  stopNumber: number;
  binId: string;
  binName: string;
  area: string;
  lat: number;
  lng: number;
  fillPercentage: number;
  estimatedWeightKg: number;
  cumulativeDistanceKm: number;
  distanceFromPrevKm: number;
  estimatedDurationMin: number;
  wasteType: WasteType;
}

export interface RoutePlan {
  id: string;
  truckId: string;
  truckName: string;
  depotId: string;
  depotName: string;
  stops: RouteStop[];
  totalDistanceKm: number;
  totalEstimatedTimeMin: number;
  totalWeightCollectedKg: number;
  capacityUtilizationPct: number;
  routeCoordinates: [number, number][]; // lat, lng pairs
  generatedAt: string;
}

export interface RouteComparison {
  baselineDistanceKm: number;
  baselineTimeMin: number;
  baselineStopsCount: number;
  optimizedDistanceKm: number;
  optimizedTimeMin: number;
  optimizedStopsCount: number;
  distanceSavedKm: number;
  percentageSaved: number;
  fuelSavedLiters: number;
  carbonSavedKg: number;
  costSavedInr: number;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface AlertNotification {
  id: string;
  binId?: string;
  truckId?: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
}

export interface AlgorithmWeights {
  fillWeight: number; // default 0.60
  waitingTimeWeight: number; // default 0.25
  specialPriorityWeight: number; // default 0.15
  criticalFillThreshold: number; // default 85%
  highFillThreshold: number; // default 70%
  mediumFillThreshold: number; // default 45%
  fuelCostPerLiter: number; // ₹96
  dieselKmPerLiter: number; // 3.5
  co2KgPerLiter: number; // 2.68 kg CO2 per liter
}
