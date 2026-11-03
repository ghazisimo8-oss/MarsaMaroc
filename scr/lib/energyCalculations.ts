/**
 * CALCULS ÉNERGÉTIQUES ET MÉTIER NORMALISÉS
 * SME Marsa Maroc — Port d'Agadir (Réf. 12/DEPA/2026)
 */

import { DataQuality, FreshnessState, Measurement } from '../types';

/**
 * Calcule la puissance apparente S = sqrt(P² + Q²) en kVA
 */
export function calculateApparentPower(activePowerKw: number, reactivePowerKvar: number): number {
  if (activePowerKw === 0 && reactivePowerKvar === 0) return 0;
  return Math.round(Math.sqrt(Math.pow(activePowerKw, 2) + Math.pow(reactivePowerKvar, 2)) * 100) / 100;
}

/**
 * Calcule le facteur de puissance (cosinus phi)
 * cos phi = P / S
 */
export function calculatePowerFactor(activePowerKw: number, reactivePowerKvar: number): number {
  const apparentPower = calculateApparentPower(activePowerKw, reactivePowerKvar);
  if (apparentPower === 0) return 1.0;
  const pf = Math.abs(activePowerKw) / apparentPower;
  return Math.min(1.0, Math.round(pf * 1000) / 1000);
}

/**
 * Évalue la fraîcheur d'une mesure selon l'écart temporel en secondes
 */
export function evaluateFreshness(measurementTimestamp: string, referenceTime: Date = new Date()): FreshnessState {
  const mesTime = new Date(measurementTimestamp).getTime();
  const now = referenceTime.getTime();
  if (isNaN(mesTime)) return 'MISSING';

  const diffSeconds = Math.max(0, Math.floor((now - mesTime) / 1000));

  if (diffSeconds < 60) {
    return 'FRESH';
  } else if (diffSeconds < 300) {
    return 'DELAYED';
  } else if (diffSeconds < 3600) {
    return 'OBSOLETE';
  }
  return 'MISSING';
}

/**
 * Calcule le score global de qualité des données (0 à 100%)
 */
export function calculateDataQualityScore(measurements: Array<{ quality: DataQuality }>): number {
  if (!measurements || measurements.length === 0) return 0;

  const weights: Record<DataQuality, number> = {
    GOOD: 100,
    ESTIMATED: 80,
    STALE: 50,
    INVALID: 20,
    COMM_ERROR: 0,
    MISSING: 0,
  };

  const totalPoints = measurements.reduce((acc, m) => acc + (weights[m.quality] ?? 0), 0);
  return Math.round(totalPoints / measurements.length);
}

/**
 * Calcule l'écart absolu et en pourcentage par rapport à la baseline SER
 */
export function calculateSerDeviation(
  actualConsumptionKwh: number,
  baselineConsumptionKwh: number
): {
  deltaKwh: number;
  deltaPercent: number;
  isFavorable: boolean; // vrai si la consommation réelle est inférieure à la référence (économie)
} {
  const deltaKwh = Math.round((actualConsumptionKwh - baselineConsumptionKwh) * 100) / 100;
  if (baselineConsumptionKwh <= 0) {
    return { deltaKwh, deltaPercent: 0, isFavorable: deltaKwh <= 0 };
  }
  const deltaPercent = Math.round(((actualConsumptionKwh - baselineConsumptionKwh) / baselineConsumptionKwh) * 1000) / 10;
  return {
    deltaKwh,
    deltaPercent,
    isFavorable: deltaKwh <= 0,
  };
}

/**
 * Estime le gain financier (en MAD) à partir d'un tarif moyen unitaire
 */
export function estimateFinancialSavingsMad(
  deltaKwh: number,
  averageTariffMadPerKwh = 1.15
): number {
  // deltaKwh négatif = économie d'énergie -> gain financier positif
  const savingsKwh = -deltaKwh;
  return Math.round(savingsKwh * averageTariffMadPerKwh * 100) / 100;
}

/**
 * Statistiques d'une série numérique (min, max, moyenne, médiane, somme)
 */
export function calculateSeriesStatistics(values: number[]): {
  min: number;
  max: number;
  average: number;
  median: number;
  sum: number;
  count: number;
} {
  if (!values || values.length === 0) {
    return { min: 0, max: 0, average: 0, median: 0, sum: 0, count: 0 };
  }

  const cleanValues = values.filter((v) => !isNaN(v) && isFinite(v));
  if (cleanValues.length === 0) {
    return { min: 0, max: 0, average: 0, median: 0, sum: 0, count: 0 };
  }

  const sorted = [...cleanValues].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const average = Math.round((sum / sorted.length) * 100) / 100;

  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 !== 0
      ? sorted[mid]
      : Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;

  return {
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    average,
    median,
    sum: Math.round(sum * 100) / 100,
    count: sorted.length,
  };
}

/**
 * Détecte les anomalies de facteur de puissance (pénalité ONEE si cos φ < 0.90)
 */
export function isPowerFactorSuboptimal(powerFactor: number): boolean {
  return powerFactor < 0.90 && powerFactor > 0.05;
}
