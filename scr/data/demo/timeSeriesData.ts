/**
 * DONNÉES TEMPORELLES DÉTERMINISTES SUR 30 JOURS (SANS Math.random NON DÉTERMINISTE AU RENDU)
 * SME Marsa Maroc — Port d'Agadir
 */

export interface DailyEnergyRecord {
  date: string; // YYYY-MM-DD
  substationId: string;
  substationCode: string;
  activeEnergyKwh: number;
  reactiveEnergyKvarh: number;
  peakPowerKw: number;
  averagePowerKw: number;
  minPowerKw: number;
  powerFactor: number;
  serBaselineKwh: number;
  qualityScore: number;
  hasIncident: boolean;
}

export interface HourlyReading {
  hour: string; // "00h", "01h", ... "23h"
  timestamp: string;
  p1Kw: number;
  p2Kw: number;
  p3Kw: number;
  p4Kw: number;
  p5Kw: number;
  p6Kw: number;
  totalKw: number;
  serBaselineKw: number;
}

export interface HeatmapCell {
  day: string; // 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'
  hour: number; // 0 à 23
  consumptionKwh: number;
  intensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK';
}

// Pseudo-random seedé déterministe (Lehmer LCG)
function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rng = createSeededRandom(122026); // Fixé sur 12/DEPA/2026

export function generateDailyRecords(daysCount = 30): DailyEnergyRecord[] {
  const records: DailyEnergyRecord[] = [];
  const substations = [
    { id: 'P1', base: 12500, ser: 13000, baseCos: 0.96 },
    { id: 'P2', base: 20000, ser: 20500, baseCos: 0.96 },
    { id: 'P3', base: 10800, ser: 10200, baseCos: 0.88 }, // Surconsommation et cos phi bas
    { id: 'P4', base: 4300, ser: 4500, baseCos: 0.97 },
    { id: 'P5', base: 5100, ser: 5200, baseCos: 0.95 },
    { id: 'P6', base: 16000, ser: 15500, baseCos: 0.95 },
  ];

  const today = new Date('2026-11-03T12:00:00Z');

  for (let d = daysCount - 1; d >= 0; d--) {
    const recordDate = new Date(today);
    recordDate.setDate(today.getDate() - d);
    const dateStr = recordDate.toISOString().slice(0, 10);
    const dayOfWeek = recordDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    substations.forEach((sub, sIdx) => {
      // Modulation déterministe jour ouvré vs week-end
      const activityFactor = isWeekend && sub.id === 'P5' ? 0.45 : isWeekend ? 0.85 : 1.0;
      const variation = Math.sin((d + sIdx * 3) * 0.4) * 0.12; // Variation sinusoïdale déterministe
      const actualKwh = Math.round(sub.base * activityFactor * (1 + variation));
      const serKwh = Math.round(sub.ser * activityFactor);

      // Simule un incident sur P6 il y a 3 jours et sur P3 il y a 10 jours
      const hasIncident = (sub.id === 'P6' && d === 0) || (sub.id === 'P3' && d === 10);
      const qualityScore = hasIncident ? (sub.id === 'P6' ? 68 : 82) : 98 + ((d + sIdx) % 3);

      const avgKw = Math.round(actualKwh / 24);
      const peakKw = Math.round(avgKw * 1.55);
      const minKw = Math.round(avgKw * 0.42);

      records.push({
        date: dateStr,
        substationId: sub.id,
        substationCode: `POSTE-${sub.id}`,
        activeEnergyKwh: actualKwh,
        reactiveEnergyKvarh: Math.round(actualKwh * 0.32),
        peakPowerKw: peakKw,
        averagePowerKw: avgKw,
        minPowerKw: minKw,
        powerFactor: sub.baseCos,
        serBaselineKwh: serKwh,
        qualityScore,
        hasIncident,
      });
    });
  }

  return records;
}

export const DEMO_DAILY_RECORDS = generateDailyRecords(30);

// Courbe 24h d'aujourd'hui
export const DEMO_HOURLY_TODAY: HourlyReading[] = [
  { hour: '00h', timestamp: '00:00', p1Kw: 280, p2Kw: 520, p3Kw: 240, p4Kw: 310, p5Kw: 80, p6Kw: 720, totalKw: 2150, serBaselineKw: 2200 },
  { hour: '01h', timestamp: '01:00', p1Kw: 260, p2Kw: 510, p3Kw: 230, p4Kw: 310, p5Kw: 75, p6Kw: 710, totalKw: 2095, serBaselineKw: 2180 },
  { hour: '02h', timestamp: '02:00', p1Kw: 240, p2Kw: 490, p3Kw: 210, p4Kw: 310, p5Kw: 75, p6Kw: 700, totalKw: 2025, serBaselineKw: 2150 },
  { hour: '03h', timestamp: '03:00', p1Kw: 230, p2Kw: 480, p3Kw: 200, p4Kw: 300, p5Kw: 70, p6Kw: 690, totalKw: 1970, serBaselineKw: 2100 },
  { hour: '04h', timestamp: '04:00', p1Kw: 250, p2Kw: 510, p3Kw: 220, p4Kw: 290, p5Kw: 85, p6Kw: 700, totalKw: 2055, serBaselineKw: 2120 },
  { hour: '05h', timestamp: '05:00', p1Kw: 380, p2Kw: 650, p3Kw: 290, p4Kw: 270, p5Kw: 110, p6Kw: 720, totalKw: 2420, serBaselineKw: 2350 },
  { hour: '06h', timestamp: '06:00', p1Kw: 550, p2Kw: 890, p3Kw: 420, p4Kw: 180, p5Kw: 210, p6Kw: 810, totalKw: 3060, serBaselineKw: 2950 },
  { hour: '07h', timestamp: '07:00', p1Kw: 720, p2Kw: 1120, p3Kw: 580, p4Kw: 90, p5Kw: 310, p6Kw: 890, totalKw: 3710, serBaselineKw: 3600 },
  { hour: '08h', timestamp: '08:00', p1Kw: 840, p2Kw: 1250, p3Kw: 640, p4Kw: 85, p5Kw: 340, p6Kw: 920, totalKw: 4075, serBaselineKw: 3950 },
  { hour: '09h', timestamp: '09:00', p1Kw: 890, p2Kw: 1320, p3Kw: 680, p4Kw: 80, p5Kw: 350, p6Kw: 930, totalKw: 4250, serBaselineKw: 4100 },
  { hour: '10h', timestamp: '10:00', p1Kw: 910, p2Kw: 1350, p3Kw: 690, p4Kw: 80, p5Kw: 345, p6Kw: 940, totalKw: 4315, serBaselineKw: 4200 },
  { hour: '11h', timestamp: '11:00', p1Kw: 880, p2Kw: 1290, p3Kw: 670, p4Kw: 75, p5Kw: 330, p6Kw: 920, totalKw: 4165, serBaselineKw: 4150 },
  { hour: '12h', timestamp: '12:00', p1Kw: 710, p2Kw: 1100, p3Kw: 540, p4Kw: 75, p5Kw: 240, p6Kw: 890, totalKw: 3555, serBaselineKw: 3700 },
  { hour: '13h', timestamp: '13:00', p1Kw: 690, p2Kw: 1080, p3Kw: 530, p4Kw: 75, p5Kw: 250, p6Kw: 880, totalKw: 3505, serBaselineKw: 3650 },
  { hour: '14h', timestamp: '14:00', p1Kw: 850, p2Kw: 1270, p3Kw: 650, p4Kw: 80, p5Kw: 335, p6Kw: 910, totalKw: 4095, serBaselineKw: 4000 },
  { hour: '15h', timestamp: '15:00', p1Kw: 890, p2Kw: 1310, p3Kw: 670, p4Kw: 80, p5Kw: 340, p6Kw: 930, totalKw: 4220, serBaselineKw: 4100 },
  { hour: '16h', timestamp: '16:00', p1Kw: 860, p2Kw: 1280, p3Kw: 640, p4Kw: 85, p5Kw: 320, p6Kw: 920, totalKw: 4105, serBaselineKw: 4050 },
  { hour: '17h', timestamp: '17:00', p1Kw: 790, p2Kw: 1190, p3Kw: 590, p4Kw: 120, p5Kw: 280, p6Kw: 900, totalKw: 3870, serBaselineKw: 3900 },
  { hour: '18h', timestamp: '18:00', p1Kw: 750, p2Kw: 1150, p3Kw: 560, p4Kw: 220, p5Kw: 190, p6Kw: 880, totalKw: 3750, serBaselineKw: 3800 },
  { hour: '19h', timestamp: '19:00', p1Kw: 720, p2Kw: 1110, p3Kw: 520, p4Kw: 310, p5Kw: 120, p6Kw: 860, totalKw: 3640, serBaselineKw: 3700 },
  { hour: '20h', timestamp: '20:00', p1Kw: 680, p2Kw: 1040, p3Kw: 490, p4Kw: 310, p5Kw: 100, p6Kw: 840, totalKw: 3460, serBaselineKw: 3500 },
  { hour: '21h', timestamp: '21:00', p1Kw: 580, p2Kw: 920, p3Kw: 430, p4Kw: 310, p5Kw: 90, p6Kw: 810, totalKw: 3140, serBaselineKw: 3250 },
  { hour: '22h', timestamp: '22:00', p1Kw: 450, p2Kw: 760, p3Kw: 350, p4Kw: 310, p5Kw: 85, p6Kw: 760, totalKw: 2715, serBaselineKw: 2800 },
  { hour: '23h', timestamp: '23:00', p1Kw: 340, p2Kw: 610, p3Kw: 270, p4Kw: 310, p5Kw: 80, p6Kw: 730, totalKw: 2340, serBaselineKw: 2400 },
];

// Données Heatmap : 7 jours x 24h
export const DEMO_HEATMAP_DATA: HeatmapCell[] = (() => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const cells: HeatmapCell[] = [];

  days.forEach((day, dIdx) => {
    for (let h = 0; h < 24; h++) {
      const isNight = h < 6 || h > 21;
      const isPeak = h >= 9 && h <= 17;
      const isWeekend = dIdx >= 5;

      let baseKwh = isNight ? 1800 : isPeak ? 3800 : 2800;
      if (isWeekend) baseKwh *= 0.78;

      const mod = Math.sin((h + dIdx) * 0.5) * 200;
      const kwh = Math.round(baseKwh + mod);

      let intensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'PEAK' = 'LOW';
      if (kwh > 3600) intensity = 'PEAK';
      else if (kwh > 2800) intensity = 'HIGH';
      else if (kwh > 2000) intensity = 'MEDIUM';

      cells.push({
        day,
        hour: h,
        consumptionKwh: kwh,
        intensity,
      });
    }
  });

  return cells;
})();
