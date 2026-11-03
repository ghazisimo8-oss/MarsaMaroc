import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Calendar,
  Download,
  Filter,
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { generateDailyRecords, DEMO_HOURLY_TODAY } from '../data/demo/timeSeriesData';
import { DEMO_SUBSTATIONS } from '../data/demo/substationsData';
import { DEMO_METERS } from '../data/demo/metersData';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';

type MetricType = 'activeEnergy' | 'reactiveEnergy' | 'peakPower' | 'powerFactor';
type GranularityType = '15min' | 'hourly' | 'daily';

export const HistoryPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedSubstation, setSelectedSubstation] = useState<string>('ALL');
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('activeEnergy');
  const [granularity, setGranularity] = useState<GranularityType>('daily');
  const [daysCount, setDaysCount] = useState<number>(30);
  const [comparePreviousPeriod, setComparePreviousPeriod] = useState<boolean>(false);

  // Génération des 30 jours de données déterministes
  const allDailyRecords = useMemo(() => generateDailyRecords(daysCount), [daysCount]);

  // Filtrage selon le poste sélectionné
  const filteredRecords = useMemo(() => {
    if (selectedSubstation === 'ALL') {
      // Agréger par date
      const dateMap = new Map<string, {
        date: string;
        activeEnergyKwh: number;
        reactiveEnergyKvarh: number;
        peakPowerKw: number;
        averagePowerKw: number;
        powerFactorSum: number;
        count: number;
        qualityScoreSum: number;
        serBaselineKwh: number;
      }>();

      allDailyRecords.forEach((r) => {
        const cur = dateMap.get(r.date) || {
          date: r.date,
          activeEnergyKwh: 0,
          reactiveEnergyKvarh: 0,
          peakPowerKw: 0,
          averagePowerKw: 0,
          powerFactorSum: 0,
          count: 0,
          qualityScoreSum: 0,
          serBaselineKwh: 0,
        };
        cur.activeEnergyKwh += r.activeEnergyKwh;
        cur.reactiveEnergyKvarh += r.reactiveEnergyKvarh;
        cur.peakPowerKw += r.peakPowerKw;
        cur.averagePowerKw += r.averagePowerKw;
        cur.powerFactorSum += r.powerFactor;
        cur.qualityScoreSum += r.qualityScore;
        cur.serBaselineKwh += r.serBaselineKwh;
        cur.count += 1;
        dateMap.set(r.date, cur);
      });

      return Array.from(dateMap.values())
        .map((entry) => ({
          date: entry.date,
          substationId: 'ALL',
          substationCode: 'TOUS LES POSTES (P1-P6)',
          activeEnergyKwh: entry.activeEnergyKwh,
          reactiveEnergyKvarh: entry.reactiveEnergyKvarh,
          peakPowerKw: entry.peakPowerKw,
          averagePowerKw: entry.averagePowerKw,
          powerFactor: Math.round((entry.powerFactorSum / entry.count) * 1000) / 1000,
          serBaselineKwh: entry.serBaselineKwh,
          qualityScore: Math.round(entry.qualityScoreSum / entry.count),
          hasIncident: false,
          previousPeriodVal: Math.round(entry.activeEnergyKwh * 0.96), // Démo comparaison
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } else {
      return allDailyRecords
        .filter((r) => r.substationId === selectedSubstation)
        .map((r) => ({
          ...r,
          previousPeriodVal: Math.round(r.activeEnergyKwh * 0.95),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }
  }, [allDailyRecords, selectedSubstation]);

  // Statistiques calculées
  const stats = useMemo(() => {
    if (filteredRecords.length === 0) return { min: 0, max: 0, avg: 0, total: 0, count: 0, quality: 100 };
    const values = filteredRecords.map((r) => {
      switch (selectedMetric) {
        case 'activeEnergy':
          return r.activeEnergyKwh;
        case 'reactiveEnergy':
          return r.reactiveEnergyKvarh;
        case 'peakPower':
          return r.peakPowerKw;
        case 'powerFactor':
          return r.powerFactor;
      }
    });

    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / values.length) * 10) / 10;
    const avgQuality = Math.round(
      filteredRecords.reduce((a, b) => a + b.qualityScore, 0) / filteredRecords.length
    );

    return {
      min,
      max,
      avg,
      total: Math.round(sum),
      count: values.length,
      quality: avgQuality,
    };
  }, [filteredRecords, selectedMetric]);

  const metricConfig = {
    activeEnergy: {
      label: 'Énergie Active',
      unit: 'kWh',
      color: '#0e8ce6',
      fillColor: '#38a8f6',
      formatter: (v: number) => `${v.toLocaleString()} kWh`,
    },
    reactiveEnergy: {
      label: 'Énergie Réactive',
      unit: 'kvarh',
      color: '#8b5cf6',
      fillColor: '#a78bfa',
      formatter: (v: number) => `${v.toLocaleString()} kvarh`,
    },
    peakPower: {
      label: 'Puissance de Pointe',
      unit: 'kW',
      color: '#f59e0b',
      fillColor: '#fbbf24',
      formatter: (v: number) => `${v.toLocaleString()} kW`,
    },
    powerFactor: {
      label: 'Facteur de Puissance cos φ',
      unit: '-',
      color: '#10b981',
      fillColor: '#34d399',
      formatter: (v: number) => `${v.toFixed(3)}`,
    },
  }[selectedMetric];

  const handleExport = () => {
    exportToCsv(
      filteredRecords,
      [
        { header: 'Date', accessor: (r) => r.date },
        { header: 'Poste', accessor: (r) => r.substationCode },
        { header: 'Énergie Active (kWh)', accessor: (r) => r.activeEnergyKwh },
        { header: 'Énergie Réactive (kvarh)', accessor: (r) => r.reactiveEnergyKvarh },
        { header: 'Puissance de Pointe (kW)', accessor: (r) => r.peakPowerKw },
        { header: 'Puissance Moyenne (kW)', accessor: (r) => r.averagePowerKw },
        { header: 'Facteur de Puissance (cos phi)', accessor: (r) => r.powerFactor },
        { header: 'Baseline SER (kWh)', accessor: (r) => r.serBaselineKwh },
        { header: 'Score Qualité (%)', accessor: (r) => r.qualityScore },
      ],
      `SME_Historique_${selectedSubstation}_${selectedMetric}_${daysCount}J`
    );
    showToast({
      type: 'success',
      title: 'Export Historique Réussi',
      message: `${filteredRecords.length} enregistrements exportés en CSV UTF-8.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Barre supérieure de filtres */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-sky-500" />
            <span>Historiques & Analyse Métrologique Avancée</span>
          </h2>
          <p className="text-xs text-slate-500">
            Exploration chronologique multi-postes, comparaison temporelle et qualification des dérives
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sélecteur de Poste */}
          <select
            value={selectedSubstation}
            onChange={(e) => setSelectedSubstation(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-marsa-500"
          >
            <option value="ALL">Tous les 6 postes (Agrégé)</option>
            {DEMO_SUBSTATIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name.split('—')[1]?.trim() || s.name}
              </option>
            ))}
          </select>

          {/* Grandeur mesurée */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as MetricType)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-marsa-500"
          >
            <option value="activeEnergy">Énergie Active (kWh)</option>
            <option value="reactiveEnergy">Énergie Réactive (kvarh)</option>
            <option value="peakPower">Puissance de Pointe (kW)</option>
            <option value="powerFactor">Facteur de Puissance (cos φ)</option>
          </select>

          {/* Période */}
          <select
            value={daysCount}
            onChange={(e) => setDaysCount(Number(e.target.value))}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-marsa-500"
          >
            <option value={7}>7 derniers jours</option>
            <option value={14}>14 derniers jours</option>
            <option value={30}>30 derniers jours (complet)</option>
          </select>

          {/* Granularité */}
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value as GranularityType)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-marsa-500"
          >
            <option value="daily">Pas journalier (recommandé)</option>
            <option value="hourly">Pas horaire (simulation)</option>
            <option value="15min">Pas 15 minutes (normatif)</option>
          </select>

          <button
            onClick={() => setComparePreviousPeriod(!comparePreviousPeriod)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              comparePreviousPeriod
                ? 'bg-sky-50 dark:bg-sky-950 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{comparePreviousPeriod ? 'Comparaison active' : 'Comparer période -1'}</span>
          </button>

          <button
            onClick={handleExport}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Cartes statistiques de la sélection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Minimum</span>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {stats.min.toLocaleString()} <span className="text-xs font-normal text-slate-500">{metricConfig.unit}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Moyenne</span>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {stats.avg.toLocaleString()} <span className="text-xs font-normal text-slate-500">{metricConfig.unit}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Maximum</span>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {stats.max.toLocaleString()} <span className="text-xs font-normal text-slate-500">{metricConfig.unit}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Cumul Période</span>
          <div className="text-lg font-bold font-mono text-marsa-600 dark:text-marsa-400 mt-1">
            {stats.total.toLocaleString()} <span className="text-xs font-normal text-slate-500">{metricConfig.unit}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Échantillons</span>
          <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {stats.count} <span className="text-xs font-normal text-slate-500">jours</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Score Qualité</span>
          <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{stats.quality}%</span>
          </div>
        </div>
      </div>

      {/* Graphique principal d'historique */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Évolution de la grandeur : {metricConfig.label}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Unité : {metricConfig.unit}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Tracé continu sur {daysCount} jours — {selectedSubstation === 'ALL' ? 'Total des 6 postes' : `Poste ${selectedSubstation}`}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: metricConfig.color }} />
              <span className="text-slate-600 dark:text-slate-400">Période active</span>
            </div>
            {comparePreviousPeriod && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-slate-400 rounded-full" />
                <span className="text-slate-600 dark:text-slate-400">Période précédente (-1)</span>
              </div>
            )}
            {selectedMetric === 'activeEnergy' && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-rose-500 rounded-full border border-dashed" />
                <span className="text-slate-600 dark:text-slate-400">Référence SER</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredRecords} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => v.slice(5)} // MM-DD
                stroke="#64748b"
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="#64748b"
                tickFormatter={(val) => (val >= 1000 ? `${Math.round(val / 1000)}k` : val)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 space-y-1">
                      <div className="font-semibold text-slate-300 border-b border-slate-800 pb-1">
                        Date : {label}
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-slate-400">{metricConfig.label} :</span>
                        <span className="font-mono font-bold text-sky-400">
                          {metricConfig.formatter(
                            selectedMetric === 'activeEnergy'
                              ? data.activeEnergyKwh
                              : selectedMetric === 'reactiveEnergy'
                              ? data.reactiveEnergyKvarh
                              : selectedMetric === 'peakPower'
                              ? data.peakPowerKw
                              : data.powerFactor
                          )}
                        </span>
                      </div>
                      {selectedMetric === 'activeEnergy' && (
                        <div className="flex justify-between gap-4 text-rose-300">
                          <span>Référence SER :</span>
                          <span className="font-mono">{data.serBaselineKwh.toLocaleString()} kWh</span>
                        </div>
                      )}
                      {comparePreviousPeriod && (
                        <div className="flex justify-between gap-4 text-slate-400">
                          <span>Période N-1 :</span>
                          <span className="font-mono">{data.previousPeriodVal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between gap-4 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Qualité métrologique :</span>
                        <span className="text-emerald-400 font-semibold">{data.qualityScore}%</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey={
                  selectedMetric === 'activeEnergy'
                    ? 'activeEnergyKwh'
                    : selectedMetric === 'reactiveEnergy'
                    ? 'reactiveEnergyKvarh'
                    : selectedMetric === 'peakPower'
                    ? 'peakPowerKw'
                    : 'powerFactor'
                }
                stroke={metricConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#metricGradient)"
                name={metricConfig.label}
              />
              {selectedMetric === 'activeEnergy' && (
                <Line
                  type="monotone"
                  dataKey="serBaselineKwh"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Baseline SER ISO 50001"
                />
              )}
              {comparePreviousPeriod && (
                <Line
                  type="monotone"
                  dataKey="previousPeriodVal"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                  name="Période antécédente (N-1)"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau détaillé des enregistrements */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Journal des Mesures Quotidiennes Consolidées
            </h4>
            <p className="text-xs text-slate-500">
              Chaque ligne représente le bilan validé après contrôle d'intégrité et filtrage des valeurs aberrantes
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-md">
            {filteredRecords.length} entrées
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Périmètre</th>
                <th className="py-2.5 px-3 text-right">Énergie Active (kWh)</th>
                <th className="py-2.5 px-3 text-right">Énergie Réactive (kvarh)</th>
                <th className="py-2.5 px-3 text-right">Pointe (kW)</th>
                <th className="py-2.5 px-3 text-right">cos φ</th>
                <th className="py-2.5 px-3 text-right">Écart vs SER</th>
                <th className="py-2.5 px-3 text-center">Qualité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {filteredRecords.slice(0, 15).map((row, idx) => {
                const diffSer = Math.round((row.activeEnergyKwh - row.serBaselineKwh) * 10) / 10;
                const diffPercent = Math.round((diffSer / row.serBaselineKwh) * 1000) / 10;
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900 dark:text-slate-200">
                      {row.date}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400">
                      {row.substationCode}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {row.activeEnergyKwh.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400">
                      {row.reactiveEnergyKvarh.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-600 dark:text-amber-400">
                      {row.peakPowerKw.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={row.powerFactor < 0.9 ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                        {row.powerFactor.toFixed(3)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          diffSer <= 0
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {diffSer <= 0 ? '' : '+'}
                        {diffPercent}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.qualityScore >= 95
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : row.qualityScore >= 80
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {row.qualityScore}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
