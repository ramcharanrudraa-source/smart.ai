import { AlgorithmWeights, GarbageBin, PriorityLevel } from '../types';

export const DEFAULT_ALGORITHM_WEIGHTS: AlgorithmWeights = {
  fillWeight: 0.60,
  waitingTimeWeight: 0.25,
  specialPriorityWeight: 0.15,
  criticalFillThreshold: 85,
  highFillThreshold: 70,
  mediumFillThreshold: 45,
  fuelCostPerLiter: 96, // INR per liter
  dieselKmPerLiter: 3.5, // 3.5 km per liter
  co2KgPerLiter: 2.68, // kg CO2 per liter diesel
};

/**
 * Calculates priority score according to municipal smart-waste heuristic:
 * Score = w_f * Fill + w_w * WaitingTime + w_s * SpecialPriority
 * 
 * Overflow Override: Bins with fill >= criticalFillThreshold (default 85%)
 * are automatically elevated to Critical priority level regardless of wait time.
 */
export function calculateBinPriority(
  bin: Omit<GarbageBin, 'priorityScore' | 'priorityLevel' | 'scoreBreakdown'>,
  weights: AlgorithmWeights = DEFAULT_ALGORITHM_WEIGHTS,
  referenceNow: Date = new Date()
): {
  priorityScore: number;
  priorityLevel: PriorityLevel;
  scoreBreakdown: GarbageBin['scoreBreakdown'];
} {
  // 1. Fill Score: normalized 0-100 directly from current fill %
  const fillScore = Math.max(0, Math.min(100, Math.round(bin.fillPercentage)));

  // 2. Waiting-Time Score: hours since collection * 10, capped at 100
  const lastColDate = new Date(bin.lastCollectionTime);
  const diffMs = Math.max(0, referenceNow.getTime() - lastColDate.getTime());
  const hoursSinceCollection = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
  const waitingScore = Math.min(100, Math.round(hoursSinceCollection * 10));

  // 3. Special-Priority Score: 100 for designated high-risk public zones (schools, hospitals, market hubs), 0 otherwise
  const specialScore = bin.isSpecialPriority ? 100 : 0;

  // Weighted raw composite score
  const rawScore =
    weights.fillWeight * fillScore +
    weights.waitingTimeWeight * waitingScore +
    weights.specialPriorityWeight * specialScore;

  const priorityScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Determination of priority level with critical overflow override
  let priorityLevel: PriorityLevel;
  let explanation = '';

  if (fillScore >= weights.criticalFillThreshold) {
    priorityLevel = 'critical';
    explanation = `Immediate overflow hazard: ${fillScore}% capacity exceeded critical ceiling (${weights.criticalFillThreshold}%).`;
  } else if (priorityScore >= 75 || fillScore >= weights.highFillThreshold) {
    priorityLevel = 'high';
    explanation = `Elevated accumulation: ${fillScore}% fill with ${hoursSinceCollection}h wait-time index.`;
  } else if (priorityScore >= 45 || fillScore >= weights.mediumFillThreshold) {
    priorityLevel = 'medium';
    explanation = `Moderate status: regular service queue recommended within 6 hours.`;
  } else {
    priorityLevel = 'low';
    explanation = `Nominal level: adequate spare volume (${100 - fillScore}% available).`;
  }

  // If marked special priority and high wait, adjust explanation
  if (bin.isSpecialPriority && priorityLevel !== 'critical') {
    explanation += ' Designated high-priority civic facility.';
  }

  return {
    priorityScore,
    priorityLevel,
    scoreBreakdown: {
      fillScore,
      waitingScore,
      specialScore,
      hoursSinceCollection,
      explanation,
    },
  };
}
