import { AlgorithmWeights, Depot, GarbageBin, RouteComparison, RoutePlan, RouteStop, Truck } from '../types';
import { calculateHaversineDistance } from './geo';

const CITY_AVERAGE_SPEED_KMH = 26; // Realistic urban commercial truck speed in Hyderabad
const DWELL_TIME_PER_STOP_MIN = 4.5; // Average bin lifting, emptying, and compaction cycle

/**
 * Baseline Route Generator:
 * Models standard municipal fixed-schedule collection.
 * The baseline route traverses stops in static registration sequence (by ID/area)
 * without dynamic spatial clustering or fill urgency filtering.
 */
export function generateBaselineRoute(
  bins: GarbageBin[],
  depot: Depot
): {
  distanceKm: number;
  timeMin: number;
  stopsCount: number;
  stopCoordinates: [number, number][];
} {
  if (bins.length === 0) {
    return { distanceKm: 0, timeMin: 0, stopsCount: 0, stopCoordinates: [] };
  }

  let totalDist = 0;
  const coords: [number, number][] = [[depot.lat, depot.lng]];

  // 1. Depot to first stop
  totalDist += calculateHaversineDistance(depot.lat, depot.lng, bins[0].lat, bins[0].lng);
  coords.push([bins[0].lat, bins[0].lng]);

  // 2. Sequential bin traversal
  for (let i = 0; i < bins.length - 1; i++) {
    const d = calculateHaversineDistance(
      bins[i].lat,
      bins[i].lng,
      bins[i + 1].lat,
      bins[i + 1].lng
    );
    totalDist += d;
    coords.push([bins[i + 1].lat, bins[i + 1].lng]);
  }

  // 3. Return from last stop to depot
  const lastBin = bins[bins.length - 1];
  totalDist += calculateHaversineDistance(lastBin.lat, lastBin.lng, depot.lat, depot.lng);
  coords.push([depot.lat, depot.lng]);

  const travelTimeMin = (totalDist / CITY_AVERAGE_SPEED_KMH) * 60;
  const totalTimeMin = Math.round(travelTimeMin + bins.length * DWELL_TIME_PER_STOP_MIN);

  return {
    distanceKm: Math.round(totalDist * 100) / 100,
    timeMin: totalTimeMin,
    stopsCount: bins.length,
    stopCoordinates: coords,
  };
}

/**
 * 2-Opt Local Search Heuristic:
 * Iteratively untangles crossing paths to improve TSP tour distance.
 */
function apply2OptOptimization(
  tour: GarbageBin[],
  depot: Depot,
  maxIterations = 50
): GarbageBin[] {
  if (tour.length <= 2) return tour;
  let bestTour = [...tour];
  let improved = true;
  let iterations = 0;

  const calculateTourDistance = (t: GarbageBin[]): number => {
    let d = calculateHaversineDistance(depot.lat, depot.lng, t[0].lat, t[0].lng);
    for (let i = 0; i < t.length - 1; i++) {
      d += calculateHaversineDistance(t[i].lat, t[i].lng, t[i + 1].lat, t[i + 1].lng);
    }
    d += calculateHaversineDistance(t[t.length - 1].lat, t[t.length - 1].lng, depot.lat, depot.lng);
    return d;
  };

  let bestDist = calculateTourDistance(bestTour);

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < bestTour.length - 1; i++) {
      for (let k = i + 1; k < bestTour.length; k++) {
        // Reverse segment between i and k
        const candidate = [
          ...bestTour.slice(0, i),
          ...bestTour.slice(i, k + 1).reverse(),
          ...bestTour.slice(k + 1),
        ];

        const candidateDist = calculateTourDistance(candidate);
        if (candidateDist < bestDist - 0.05) {
          bestTour = candidate;
          bestDist = candidateDist;
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  return bestTour;
}

/**
 * EcoRoute AI Capacitated Vehicle Routing & Nearest-Neighbor Engine:
 * 1. Filters candidates by urgency and capacity safety limits.
 * 2. Greedy Nearest Neighbor from depot location.
 * 3. 2-Opt refinement for route smoothness.
 * 4. Full stop metrics with estimated duration and weight accumulation.
 */
export function optimizeRoutePlan(
  candidateBins: GarbageBin[],
  truck: Truck,
  depot: Depot,
  weights: AlgorithmWeights
): {
  routePlan: RoutePlan;
  skippedBins: GarbageBin[];
  capacityExceeded: boolean;
} {
  // Estimated weight per bin based on fill percentage and capacity
  const getBinWeight = (bin: GarbageBin) =>
    Math.round(bin.capacityKg * (bin.fillPercentage / 100));

  // Sort candidate bins primarily by priority score desc to consider most critical first
  const prioritizedCandidates = [...candidateBins].sort(
    (a, b) => b.priorityScore - a.priorityScore
  );

  const selectedForTruck: GarbageBin[] = [];
  const skippedBins: GarbageBin[] = [];
  let currentLoad = truck.currentLoadKg;
  let capacityExceeded = false;

  for (const bin of prioritizedCandidates) {
    const weight = getBinWeight(bin);
    if (currentLoad + weight <= truck.maxCapacityKg) {
      selectedForTruck.push(bin);
      currentLoad += weight;
    } else {
      skippedBins.push(bin);
      capacityExceeded = true;
    }
  }

  if (selectedForTruck.length === 0) {
    return {
      routePlan: {
        id: `ROUTE-${Date.now()}`,
        truckId: truck.id,
        truckName: truck.name,
        depotId: depot.id,
        depotName: depot.name,
        stops: [],
        totalDistanceKm: 0,
        totalEstimatedTimeMin: 0,
        totalWeightCollectedKg: 0,
        capacityUtilizationPct: 0,
        routeCoordinates: [[depot.lat, depot.lng]],
        generatedAt: new Date().toISOString(),
      },
      skippedBins,
      capacityExceeded,
    };
  }

  // 1. Nearest Neighbor construction starting from Depot
  const unvisited = [...selectedForTruck];
  const orderedStops: GarbageBin[] = [];
  let currentLat = depot.lat;
  let currentLng = depot.lng;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateHaversineDistance(
        currentLat,
        currentLng,
        unvisited[i].lat,
        unvisited[i].lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const nextBin = unvisited.splice(nearestIdx, 1)[0];
    orderedStops.push(nextBin);
    currentLat = nextBin.lat;
    currentLng = nextBin.lng;
  }

  // 2. Refine path via 2-Opt local search
  const polishedStops = apply2OptOptimization(orderedStops, depot);

  // 3. Assemble detailed RouteStop records
  let cumulativeDist = 0;
  let prevLat = depot.lat;
  let prevLng = depot.lng;
  const stops: RouteStop[] = [];
  const routeCoords: [number, number][] = [[depot.lat, depot.lng]];

  polishedStops.forEach((bin, idx) => {
    const distFromPrev = calculateHaversineDistance(prevLat, prevLng, bin.lat, bin.lng);
    cumulativeDist += distFromPrev;
    const estWeight = getBinWeight(bin);
    const legDurationMin = (distFromPrev / CITY_AVERAGE_SPEED_KMH) * 60 + DWELL_TIME_PER_STOP_MIN;

    stops.push({
      stopNumber: idx + 1,
      binId: bin.id,
      binName: bin.name,
      area: bin.area,
      lat: bin.lat,
      lng: bin.lng,
      fillPercentage: bin.fillPercentage,
      estimatedWeightKg: estWeight,
      cumulativeDistanceKm: Math.round(cumulativeDist * 100) / 100,
      distanceFromPrevKm: Math.round(distFromPrev * 100) / 100,
      estimatedDurationMin: Math.round(legDurationMin),
      wasteType: bin.wasteType,
    });

    routeCoords.push([bin.lat, bin.lng]);
    prevLat = bin.lat;
    prevLng = bin.lng;
  });

  // Return to Depot leg
  const returnDist = calculateHaversineDistance(prevLat, prevLng, depot.lat, depot.lng);
  cumulativeDist += returnDist;
  routeCoords.push([depot.lat, depot.lng]);

  const totalDriveTimeMin = (cumulativeDist / CITY_AVERAGE_SPEED_KMH) * 60;
  const totalServiceTimeMin = stops.length * DWELL_TIME_PER_STOP_MIN;
  const totalEstimatedTimeMin = Math.round(totalDriveTimeMin + totalServiceTimeMin);

  const totalWeight = stops.reduce((acc, s) => acc + s.estimatedWeightKg, 0);
  const capacityPct = Math.min(100, Math.round((totalWeight / truck.maxCapacityKg) * 100));

  const routePlan: RoutePlan = {
    id: `ROUTE-${Date.now().toString(36).toUpperCase()}`,
    truckId: truck.id,
    truckName: truck.name,
    depotId: depot.id,
    depotName: depot.name,
    stops,
    totalDistanceKm: Math.round(cumulativeDist * 100) / 100,
    totalEstimatedTimeMin,
    totalWeightCollectedKg: totalWeight,
    capacityUtilizationPct: capacityPct,
    routeCoordinates: routeCoords,
    generatedAt: new Date().toISOString(),
  };

  return {
    routePlan,
    skippedBins,
    capacityExceeded,
  };
}

/**
 * Computes comparative metrics between baseline unoptimized route and optimized route.
 * Handles edge cases like zero distances safely.
 */
export function calculateRouteComparison(
  baselineDistanceKm: number,
  baselineTimeMin: number,
  baselineStopsCount: number,
  optimizedDistanceKm: number,
  optimizedTimeMin: number,
  optimizedStopsCount: number,
  weights: AlgorithmWeights
): RouteComparison {
  const safeBaseline = Math.max(0.1, baselineDistanceKm);
  const distanceSavedKm = Math.max(0, Math.round((baselineDistanceKm - optimizedDistanceKm) * 100) / 100);
  const percentageSaved = Math.max(0, Math.min(95, Math.round((distanceSavedKm / safeBaseline) * 1000) / 10));

  // Fuel saved in liters = Distance Saved (km) / Truck fuel efficiency (km/L)
  const fuelSavedLiters = Math.round((distanceSavedKm / weights.dieselKmPerLiter) * 10) / 10;

  // Carbon emissions avoided = Fuel Saved (L) * CO2 emission factor (kg/L)
  const carbonSavedKg = Math.round(fuelSavedLiters * weights.co2KgPerLiter * 10) / 10;

  // Cost saved in INR = Fuel Saved (L) * Fuel Cost per liter
  const costSavedInr = Math.round(fuelSavedLiters * weights.fuelCostPerLiter);

  return {
    baselineDistanceKm: Math.round(baselineDistanceKm * 10) / 10,
    baselineTimeMin,
    baselineStopsCount,
    optimizedDistanceKm: Math.round(optimizedDistanceKm * 10) / 10,
    optimizedTimeMin,
    optimizedStopsCount,
    distanceSavedKm,
    percentageSaved,
    fuelSavedLiters,
    carbonSavedKg,
    costSavedInr,
  };
}

/**
 * Future Extension Point:
 * Integration placeholder for real-world road networks (e.g. OpenStreetMap OSRM / Google Directions API).
 * When active, this will replace straight-line Haversine metrics with turn-by-turn geometry.
 */
export async function fetchRoadNetworkGeometry(
  _coordinates: [number, number][]
): Promise<[number, number][] | null> {
  // Road routing API hook for production deployment
  return null;
}
