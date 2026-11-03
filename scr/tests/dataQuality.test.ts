import { describe, it, expect } from 'vitest';
import { calculateDataQualityScore } from '../lib/energyCalculations';
import { DataQuality } from '../types';

describe('Qualification Métrologique & Qualité des Données (Rule 11)', () => {
  it('calcule un score de 100% lorsque tous les échantillons sont GOOD', () => {
    const measurements = [
      { quality: 'GOOD' as DataQuality },
      { quality: 'GOOD' as DataQuality },
      { quality: 'GOOD' as DataQuality },
      { quality: 'GOOD' as DataQuality },
    ];
    expect(calculateDataQualityScore(measurements)).toBe(100);
  });

  it('pénalise les défauts de communication (COMM_ERROR = 0 pt)', () => {
    const measurements = [
      { quality: 'GOOD' as DataQuality }, // 100
      { quality: 'GOOD' as DataQuality }, // 100
      { quality: 'COMM_ERROR' as DataQuality }, // 0
      { quality: 'COMM_ERROR' as DataQuality }, // 0
    ];
    // (100 + 100 + 0 + 0) / 4 = 50%
    expect(calculateDataQualityScore(measurements)).toBe(50);
  });

  it('attribue 80 pts aux mesures estimées et 50 pts aux mesures gelées (STALE)', () => {
    const measurements = [
      { quality: 'ESTIMATED' as DataQuality }, // 80
      { quality: 'STALE' as DataQuality }, // 50
    ];
    // (80 + 50) / 2 = 65%
    expect(calculateDataQualityScore(measurements)).toBe(65);
  });

  it('gère une liste vide ou non définie sans division par zéro', () => {
    expect(calculateDataQualityScore([])).toBe(0);
    // @ts-ignore
    expect(calculateDataQualityScore(null)).toBe(0);
  });

  it('distingue strictement une mesure à zéro (valide) d’une mesure absente', () => {
    // 0 mesuré (charge nulle, veille) -> qualité GOOD (100%)
    const zeroMesure = [{ quality: 'GOOD' as DataQuality, activePowerKw: 0 }];
    expect(calculateDataQualityScore(zeroMesure)).toBe(100);

    // Mesure absente -> qualité MISSING (0%)
    const mesureManquante = [{ quality: 'MISSING' as DataQuality, activePowerKw: 0 }];
    expect(calculateDataQualityScore(mesureManquante)).toBe(0);
  });
});
