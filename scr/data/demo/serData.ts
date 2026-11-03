import { EnergyBaseline } from '../../types';

export const DEMO_ENERGY_BASELINES: EnergyBaseline[] = [
  {
    id: 'SER-2026-V1',
    version: 'v1.2 (Active)',
    name: 'Situation Énergétique de Référence — Exercice 2025 Normalisé',
    referencePeriod: 'Du 01/01/2025 au 31/12/2025 (Corrigé DJU et trafic navires)',
    method: 'PORT_ACTIVITY_ADJUSTED',
    formulaExplanation: 'Modèle de régression multi-linéaire : E_theorique = a * Escales + b * TEU + c * TonnageVrac + Conso_Talon',
    annualReferenceConsumptionKwh: 23450000,
    monthlyBaselinesKwh: {
      'Janvier': 1920000,
      'Février': 1840000,
      'Mars': 1980000,
      'Avril': 1950000,
      'Mai': 2010000,
      'Juin': 2040000,
      'Juillet': 2120000,
      'Août': 2180000,
      'Septembre': 2020000,
      'Octobre': 1990000,
      'Novembre': 1890000,
      'Décembre': 1910000,
    },
    status: 'ACTIVE',
    effectiveDate: '2026-01-01',
    justification: 'Ajustement pour intégrer l’extension du quai Nord et la mise en service du 4ème portique STS.',
    author: 'Hassan Chraïbi (Responsable Énergie DEPA)',
  },
  {
    id: 'SER-2025-V0',
    version: 'v1.0 (Archivée)',
    name: 'Baseline Historique Moyenne Brute 2024',
    referencePeriod: '01/01/2024 - 31/12/2024',
    method: 'HISTORICAL_AVERAGE',
    formulaExplanation: 'Moyenne mobile mensuelle des index de facturation ONEE sans pondération des cadences portuaires.',
    annualReferenceConsumptionKwh: 24800000,
    monthlyBaselinesKwh: {
      'Janvier': 2050000,
      'Février': 1980000,
      'Mars': 2090000,
      'Avril': 2040000,
      'Mai': 2110000,
      'Juin': 2150000,
      'Juillet': 2220000,
      'Août': 2280000,
      'Septembre': 2140000,
      'Octobre': 2080000,
      'Novembre': 1990000,
      'Décembre': 2020000,
    },
    status: 'ARCHIVED',
    effectiveDate: '2025-01-01',
    justification: 'Version initiale avant raccordement de la télémétrie continue Modbus.',
    author: 'Direction Technique Marsa Maroc',
  },
];

export interface SerWaterfallItem {
  name: string;
  baselineKwh: number;
  actualKwh: number;
  varianceKwh: number;
  variancePercent: number;
  financialImpactMad: number;
  comment: string;
}

export const DEMO_SER_WATERFALL: SerWaterfallItem[] = [
  { name: 'P1 Quai Nord', baselineKwh: 358000, actualKwh: 348200, varianceKwh: -9800, variancePercent: -2.7, financialImpactMad: 11270, comment: 'Économie grâce à la coupure automatique des auxiliaires à quai' },
  { name: 'P2 Conteneurs', baselineKwh: 560000, actualKwh: 542000, varianceKwh: -18000, variancePercent: -3.2, financialImpactMad: 20700, comment: 'Optimisation de la régénération électrique sur les portiques STS' },
  { name: 'P3 Silos & Vrac', baselineKwh: 285000, actualKwh: 298500, varianceKwh: +13500, variancePercent: +4.7, financialImpactMad: -15525, comment: 'Surconsommation liée à un fonctionnement à vide des convoyeurs' },
  { name: 'P4 Terre-Pleins', baselineKwh: 132000, actualKwh: 124800, varianceKwh: -7200, variancePercent: -5.5, financialImpactMad: 8280, comment: 'Gain direct du relamping LED asservi par horloge astronomique' },
  { name: 'P5 Ateliers DEPA', baselineKwh: 148000, actualKwh: 145000, varianceKwh: -3000, variancePercent: -2.0, financialImpactMad: 3450, comment: 'Arrêt systématique des compresseurs d’air le week-end' },
  { name: 'P6 Frigorifique', baselineKwh: 440000, actualKwh: 452000, varianceKwh: +12000, variancePercent: +2.7, financialImpactMad: -13800, comment: 'Augmentation de la température extérieure côtière (+1.8°C vs baseline)' },
];
