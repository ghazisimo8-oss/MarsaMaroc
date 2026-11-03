import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  FileCheck2,
  Calendar,
  Layers,
  Info,
  Download,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  ShieldAlert,
  ArrowRight,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { DEMO_ENERGY_BASELINES, DEMO_SER_WATERFALL, SerWaterfallItem } from '../data/demo/serData';
import { EnergyBaseline } from '../types';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { auditService } from '../services/auditService';

export const SerPage: React.FC = () => {
  const { hasPermission, currentUser } = useAuth();
  const { showToast } = useToast();
  const [selectedBaselineId, setSelectedBaselineId] = useState<string>('SER-2026-V1');

  const currentBaseline =
    DEMO_ENERGY_BASELINES.find((b) => b.id === selectedBaselineId) || DEMO_ENERGY_BASELINES[0];

  // Calculs consolidés mensuels sur les 6 postes
  const totalBaselineKwh = DEMO_SER_WATERFALL.reduce((sum, item) => sum + item.baselineKwh, 0);
  const totalActualKwh = DEMO_SER_WATERFALL.reduce((sum, item) => sum + item.actualKwh, 0);
  const netVarianceKwh = totalActualKwh - totalBaselineKwh;
  const netVariancePercent = Math.round((netVarianceKwh / totalBaselineKwh) * 1000) / 10;
  const totalSavingsMad = Math.round(
    DEMO_SER_WATERFALL.reduce((sum, item) => sum + item.financialImpactMad, 0)
  );

  // Données mensuelles comparatives pour le graphique
  const monthlyComparisonData = Object.entries(currentBaseline.monthlyBaselinesKwh).map(
    ([month, baselineVal]) => {
      // Simulation réaliste de la consommation réelle mensuelle
      const factor = month === 'Mars' || month === 'Octobre' ? 0.98 : month === 'Juillet' ? 1.02 : 0.97;
      const actualVal = Math.round(baselineVal * factor);
      return {
        month: month.slice(0, 4),
        baselineKwh: baselineVal,
        actualKwh: actualVal,
        gapKwh: actualVal - baselineVal,
      };
    }
  );

  const handleExportCsv = () => {
    exportToCsv(
      DEMO_SER_WATERFALL,
      [
        { header: 'Poste Électrique', accessor: (w) => w.name },
        { header: 'Référence SER (kWh)', accessor: (w) => w.baselineKwh },
        { header: 'Consommation Réelle (kWh)', accessor: (w) => w.actualKwh },
        { header: 'Écart Net (kWh)', accessor: (w) => w.varianceKwh },
        { header: 'Écart Relatif (%)', accessor: (w) => w.variancePercent },
        { header: 'Impact Financier Estimé (MAD)', accessor: (w) => w.financialImpactMad },
        { header: 'Justification d’Exploitation', accessor: (w) => w.comment },
      ],
      `SME_Analyse_SER_ISO50001_${selectedBaselineId}`
    );
    showToast({
      type: 'success',
      title: 'Export Bilan SER Réussi',
      message: 'Matrice des écarts par rapport à la baseline exportée en CSV UTF-8.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer de modélisation */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Situation Énergétique de Référence — Démonstration ISO 50001 (À valider DEPA)
          </p>
          <p className="opacity-90 leading-relaxed">
            La période de référence, la formule d'ajustement aux conditions d'exploitation portuaire (escales,
            trafic conteneurs, tonnage vrac) et le tarif unitaire de valorisation (1,15 MAD / kWh)
            constituent une base méthodologique de démonstration qui sera confirmée lors de la revue énergétique contractuelle.
          </p>
        </div>
      </div>

      {/* Header & Sélecteur de Version de Baseline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-sky-500" />
            <span>Situation Énergétique de Référence (SER) — Suivi des Économies</span>
          </h2>
          <p className="text-xs text-slate-500">
            Évaluation continue des gains et dérives d'énergie par rapport à la trajectoire contractuelle
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
            <GitBranch className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedBaselineId}
              onChange={(e) => setSelectedBaselineId(e.target.value)}
              className="text-xs font-semibold bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
            >
              {DEMO_ENERGY_BASELINES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} [{b.version}]
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI SER & Économies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Consommation Référence SER
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {totalBaselineKwh.toLocaleString()} <span className="text-xs font-normal text-slate-500">kWh/mois</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Modèle normalisé sur les 6 postes MT/BT
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Consommation Réelle Mesurée
          </span>
          <div className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
            {totalActualKwh.toLocaleString()} <span className="text-xs font-normal text-slate-500">kWh/mois</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Index réels consolidés sans double comptage
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Écart Global vs Trajectoire
          </span>
          <div
            className={`text-xl font-bold font-mono mt-1 flex items-center gap-1.5 ${
              netVarianceKwh <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {netVarianceKwh <= 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            <span>
              {netVarianceKwh > 0 ? `+${netVarianceKwh.toLocaleString()}` : netVarianceKwh.toLocaleString()} kWh
            </span>
            <span className="text-xs font-semibold">({netVariancePercent}%)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {netVarianceKwh <= 0 ? 'Économie d’énergie constatée' : 'Surconsommation détectée'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 shadow-sm bg-gradient-to-br from-emerald-50/40 to-transparent dark:from-emerald-950/20">
          <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block flex items-center justify-between">
            <span>Gains Financiers Estimés</span>
            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Démo 1,15 MAD/kWh
            </span>
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            +{totalSavingsMad.toLocaleString()} <span className="text-xs font-normal">MAD / mois</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Projection annuelle estimée : ~{(totalSavingsMad * 12).toLocaleString()} MAD
          </p>
        </div>
      </div>

      {/* Détails du modèle de référence actif */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Fiche Méthodologique de la Baseline Active :
            </span>
            <span className="font-mono text-marsa-600 dark:text-marsa-400 font-semibold">
              {currentBaseline.id}
            </span>
          </div>
          <div className="text-slate-500 flex items-center gap-3">
            <span>Date d’effet : <strong>{currentBaseline.effectiveDate}</strong></span>
            <span>Rédigé par : <strong>{currentBaseline.author}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <span className="font-semibold text-slate-600 dark:text-slate-400">Période de référence :</span>
            <p className="text-slate-800 dark:text-slate-200">{currentBaseline.referencePeriod}</p>
            <span className="font-semibold text-slate-600 dark:text-slate-400 mt-2 block">Formule d’ajustement :</span>
            <code className="text-[11px] font-mono text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-800 px-2 py-1 rounded block mt-0.5 border border-slate-200 dark:border-slate-700">
              {currentBaseline.formulaExplanation}
            </code>
          </div>
          <div>
            <span className="font-semibold text-slate-600 dark:text-slate-400">Justification de la version :</span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{currentBaseline.justification}</p>
          </div>
        </div>
      </div>

      {/* Graphique de comparaison Réel vs Baseline par Poste */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Comparaison Mensuelle des 6 Postes : Réel vs Baseline SER
            </h3>
            <p className="text-xs text-slate-500">
              Énergie active consommée vs trajectoire prévisionnelle normalisée (kWh)
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_SER_WATERFALL} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#64748b" interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} stroke="#64748b" tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const data = payload[0].payload as SerWaterfallItem;
                    return (
                      <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 space-y-1">
                        <div className="font-bold border-b border-slate-800 pb-1">{data.name}</div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Baseline SER :</span>
                          <span className="font-mono">{data.baselineKwh.toLocaleString()} kWh</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-sky-400 font-semibold">Réel mesuré :</span>
                          <span className="font-mono">{data.actualKwh.toLocaleString()} kWh</span>
                        </div>
                        <div className="flex justify-between gap-4 pt-1 border-t border-slate-800 font-bold">
                          <span>Écart :</span>
                          <span className={data.varianceKwh <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {data.varianceKwh <= 0 ? '' : '+'}
                            {data.varianceKwh.toLocaleString()} kWh ({data.variancePercent}%)
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="baselineKwh" fill="#94a3b8" name="Baseline SER (Théorique)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualKwh" fill="#0e8ce6" name="Consommation Réelle" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique de l'écart (Surconsommation / Économie) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Waterfall des Écarts d'Énergie par Poste (kWh)
            </h3>
            <p className="text-xs text-slate-500">
              Vert = Économie réalisée par rapport à la SER | Rouge = Dérive / Surconsommation
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_SER_WATERFALL} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#64748b" interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} stroke="#64748b" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  formatter={(val: number) => [`${val > 0 ? `+${val}` : val} kWh`, 'Écart net']}
                />
                <Bar dataKey="varianceKwh" name="Écart vs SER (kWh)" radius={[4, 4, 0, 0]}>
                  {DEMO_SER_WATERFALL.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.varianceKwh <= 0 ? '#10b981' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Matrice détaillée avec explications d'exploitation */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Analyse Détaillée des Écarts et Justifications par Poste
          </h4>
          <p className="text-xs text-slate-500">
            Revue contradictoire mensuelle des consommations avec justification causale ISO 50001
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Poste Électrique</th>
                <th className="py-2.5 px-3 text-right">Référence SER</th>
                <th className="py-2.5 px-3 text-right">Réel Mesuré</th>
                <th className="py-2.5 px-3 text-right">Écart Net</th>
                <th className="py-2.5 px-3 text-right">Gain / Perte (MAD)</th>
                <th className="py-2.5 px-3">Commentaire d'Exploitation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {DEMO_SER_WATERFALL.map((item, idx) => {
                const isFavorable = item.varianceKwh <= 0;
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-200">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                      {item.baselineKwh.toLocaleString()} kWh
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      {item.actualKwh.toLocaleString()} kWh
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          isFavorable
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {item.varianceKwh <= 0 ? '' : '+'}
                        {item.varianceKwh.toLocaleString()} kWh ({item.variancePercent}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={item.financialImpactMad >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {item.financialImpactMad >= 0 ? `+${item.financialImpactMad.toLocaleString()}` : item.financialImpactMad.toLocaleString()} MAD
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                      {item.comment}
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
