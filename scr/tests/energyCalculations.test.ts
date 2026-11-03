import { describe, it, expect } from 'vitest';
import {
  calculateApparentPower,
  calculatePowerFactor,
  evaluateFreshness,
  calculateDataQualityScore,
  calculateSerDeviation,
  estimateFinancialSavingsMad,
  calculateSeriesStatistics,
  isPowerFactorSuboptimal,
} from '../lib/energyCalculations';
import { DataQuality } from '../types';

describe('Calculs Énergétiques Normalisés — SME Marsa Maroc (12/DEPA/2026)', () => {
  it('calcule la puissance apparente S = sqrt(P² + Q²) correctement', () => {
    // 300 kW, 400 kvar -> 500 kVA (triangle 3-4-5)
    expect(calculateApparentPower(300, 400)).toBe(500);
    expect(calculateApparentPower(0, 0)).toBe(0);
    // Cas réel Poste P1 : P = 742.5 kW, Q = 212.0 kvar
    const s = calculateApparentPower(742.5, 212.0);
    expect(s).toBeCloseTo(772.18, 1);
  });

  it('calcule le facteur de puissance cos φ = P / S', () => {
    // 300 kW, 400 kvar -> S = 500 kVA -> cos φ = 300/500 = 0.60
    expect(calculatePowerFactor(300, 400)).toBe(0.6);
    // Puissance réactive nulle -> cos φ = 1.0
    expect(calculatePowerFactor(500, 0)).toBe(1.0);
    // Si P=0 et Q=0 -> cos φ = 1.0
    expect(calculatePowerFactor(0, 0)).toBe(1.0);
  });

  it('détecte le facteur de puissance sous-optimal (< 0.90) pour pénalités ONEE', () => {
    expect(isPowerFactorSuboptimal(0.88)).toBe(true); // Poste P3 en alerte
    expect(isPowerFactorSuboptimal(0.96)).toBe(false); // Nominal
    expect(isPowerFactorSuboptimal(0.01)).toBe(false); // Disjoncteur ouvert
  });

  it('évalue la fraîcheur d’une mesure par rapport au temps de référence', () => {
    const refDate = new Date('2026-11-03T12:00:00Z');

    // Mesure de 30 secondes -> FRESH
    const t30s = new Date('2026-11-03T11:59:30Z').toISOString();
    expect(evaluateFreshness(t30s, refDate)).toBe('FRESH');

    // Mesure de 3 minutes -> DELAYED
    const t3m = new Date('2026-11-03T11:57:00Z').toISOString();
    expect(evaluateFreshness(t3m, refDate)).toBe('DELAYED');

    // Mesure de 20 minutes -> OBSOLETE
    const t20m = new Date('2026-11-03T11:40:00Z').toISOString();
    expect(evaluateFreshness(t20m, refDate)).toBe('OBSOLETE');

    // Mesure de 2 heures -> MISSING
    const t2h = new Date('2026-11-03T09:00:00Z').toISOString();
    expect(evaluateFreshness(t2h, refDate)).toBe('MISSING');
  });

  it('calcule l’écart absolu et en pourcentage par rapport à la baseline SER', () => {
    // Cas réel : 12 000 kWh consommés vs 13 000 kWh référence (-1 000 kWh, -7.7% économie)
    const res = calculateSerDeviation(12000, 13000);
    expect(res.deltaKwh).toBe(-1000);
    expect(res.deltaPercent).toBeCloseTo(-7.7, 1);
    expect(res.isFavorable).toBe(true);

    // Cas surconsommation : 15 000 kWh vs 10 000 kWh (+5 000 kWh, +50%)
    const res2 = calculateSerDeviation(15000, 10000);
    expect(res2.deltaKwh).toBe(5000);
    expect(res2.deltaPercent).toBe(50);
    expect(res2.isFavorable).toBe(false);
  });

  it('estime le gain financier en MAD à partir du tarif de 1,15 MAD/kWh', () => {
    // Économie de 10 000 kWh (-10 000 delta) -> 11 500 MAD de gain
    expect(estimateFinancialSavingsMad(-10000, 1.15)).toBe(11500);
    // Surconsommation de 5 000 kWh (+5 000 delta) -> -5 750 MAD de perte
    expect(estimateFinancialSavingsMad(5000, 1.15)).toBe(-5750);
  });

  it('calcule les statistiques d’une série numérique (min, max, avg, median, sum)', () => {
    const values = [10, 20, 30, 40, 50];
    const stats = calculateSeriesStatistics(values);
    expect(stats.min).toBe(10);
    expect(stats.max).toBe(50);
    expect(stats.average).toBe(30);
    expect(stats.median).toBe(30);
    expect(stats.sum).toBe(150);
    expect(stats.count).toBe(5);
  });
});
