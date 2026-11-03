import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Zap,
  ArrowLeft,
  Cpu,
  Clock,
  Activity,
  Gauge,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Download,
  Calendar,
} from 'lucide-react';
import { DEMO_SUBSTATIONS } from '../data/demo/substationsData';
import { DEMO_METERS, DEMO_MEASUREMENT_POINTS } from '../data/demo/metersData';
import { DEMO_HOURLY_TODAY } from '../data/demo/timeSeriesData';
import { QualityBadge } from '../components/common/QualityBadge';
import { FreshnessIndicator } from '../components/common/FreshnessIndicator';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const SubstationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'ELECTRICAL' | 'METERS' | 'SER_ANALYSIS'>('ELECTRICAL');

  const substation = DEMO_SUBSTATIONS.find((s) => s.id === id) || DEMO_SUBSTATIONS[0];
  const meters = DEMO_METERS.filter((m) => m.substationId === substation.id);
  const measurementPoints = DEMO_MEASUREMENT_POINTS.filter((mp) => mp.substationId === substation.id);

  // Données de courbes adaptées au poste courant
  const hourlyData = DEMO_HOURLY_TODAY.map((h) => {
    let kw = h.p1Kw;
    if (substation.id === 'P2') kw = h.p2Kw;
    else if (substation.id === 'P3') kw = h.p3Kw;
    else if (substation.id === 'P4') kw = h.p4Kw;
    else if (substation.id === 'P5') kw = h.p5Kw;
    else if (substation.id === 'P6') kw = h.p6Kw;

    const reactive = Math.round(kw * (substation.powerFactor < 0.9 ? 0.52 : 0.28));
    return {
      hour: h.hour,
      activePowerKw: kw,
      reactivePowerKvar: reactive,
      voltageV: Math.round((substation.voltageV + Math.sin(parseInt(h.hour) || 0) * 1.8) * 10) / 10,
      currentA: Math.round((kw / (Math.sqrt(3) * 0.4 * substation.powerFactor)) * 10) / 10,
      powerFactor: substation.powerFactor,
      serBaselineKw: Math.round(kw * 1.04),
    };
  });

  const handleExportSubstationData = () => {
    exportToCsv(
      hourlyData,
      [
        { header: 'Heure', accessor: (d) => d.hour },
        { header: 'Puissance Active P (kW)', accessor: (d) => d.activePowerKw },
        { header: 'Puissance Réactive Q (kvar)', accessor: (d) => d.reactivePowerKvar },
        { header: 'Tension (V)', accessor: (d) => d.voltageV },
        { header: 'Courant (A)', accessor: (d) => d.currentA },
        { header: 'Facteur de Puissance cos φ', accessor: (d) => d.powerFactor },
        { header: 'Baseline SER (kW)', accessor: (d) => d.serBaselineKw },
      ],
      `SME_Poste_${substation.code}_Courbe_24h`
    );
    showToast({
      type: 'success',
      title: 'Export Réussi',
      message: `Profil de charge 24h du poste ${substation.code} téléchargé en CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Fiche Poste */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Link
              to="/postes"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              title="Retour aux 6 postes"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-marsa-100 text-marsa-800 dark:bg-marsa-950 dark:text-marsa-300">
                  {substation.code}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {substation.name}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{substation.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <QualityBadge quality={substation.status === 'COMM_LOST' ? 'COMM_ERROR' : 'GOOD'} />
            <button
              onClick={handleExportSubstationData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 6 KPIs Métrologiques du Poste */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Puissance P</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {substation.activePowerKw} kW
            </span>
            <span className="text-[10px] text-slate-500 block">Pointe : {Math.round(substation.activePowerKw * 1.35)} kW</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Puissance Q</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {substation.reactivePowerKvar} kvar
            </span>
            <span className="text-[10px] text-slate-500 block">Inductif MT</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">cos φ (PF)</span>
            <span
              className={`text-lg font-extrabold font-mono ${
                substation.powerFactor < 0.9 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {substation.powerFactor.toFixed(3)}
            </span>
            <span className="text-[10px] text-slate-500 block">Seuil ONEE 0.900</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Tension Moy</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {substation.voltageV} V
            </span>
            <span className="text-[10px] text-slate-500 block">Fréq : {substation.frequencyHz} Hz</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Courant Tri</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {substation.currentA} A
            </span>
            <span className="text-[10px] text-slate-500 block">Équilibré à 99%</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">Transfo Installé</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {substation.transformerPowerKva} kVA
            </span>
            <span className="text-[10px] text-slate-500 block">
              Taux charge : {Math.round((substation.activePowerKw / substation.transformerPowerKva) * 100)}%
            </span>
          </div>
        </div>

        {/* Onglets Fiche */}
        <div className="flex items-center gap-2 mt-5 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('ELECTRICAL')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'ELECTRICAL'
                ? 'border-marsa-600 text-marsa-600 dark:text-marsa-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Courbes Électriques (P, Q, U, I, cos φ)
          </button>
          <button
            onClick={() => setActiveTab('METERS')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'METERS'
                ? 'border-marsa-600 text-marsa-600 dark:text-marsa-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Compteurs & Points de Mesure ({meters.length})
          </button>
          <button
            onClick={() => setActiveTab('SER_ANALYSIS')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'SER_ANALYSIS'
                ? 'border-marsa-600 text-marsa-600 dark:text-marsa-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Comparaison Situation Référence (SER)
          </button>
        </div>
      </div>

      {/* ONGLET 1 : COURBES ÉLECTRIQUES */}
      {activeTab === 'ELECTRICAL' && (
        <div className="space-y-6">
          {/* Graphique Puissances Active P & Réactive Q */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Puissances Active P (kW) & Réactive Q (kvar) sur 24h
                </h3>
                <p className="text-xs text-slate-500">
                  Surveillance du déphasage et de la charge inductive du transformateur
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-sky-600">
                  <span className="w-3 h-1 bg-sky-500 rounded" /> P Active (kW)
                </span>
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="w-3 h-1 bg-amber-500 rounded" /> Q Réactive (kvar)
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="activePowerKw"
                    name="Active P (kW)"
                    stroke="#0284c7"
                    fill="#38bdf8"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="reactivePowerKvar"
                    name="Réactive Q (kvar)"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deux colonnes : Tension (V) & Courant (A) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tension Triphasée */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                Tension Triphasée Composée U (V)
              </h3>
              <p className="text-xs text-slate-500 mb-4">Tolérance contractuelle : 400 V ±10% [360V - 440V]</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                    <YAxis domain={[380, 420]} stroke="#94a3b8" fontSize={11} unit=" V" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="voltageV"
                      name="Tension U"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Courant Triphasé */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                Courant Moyen Efficace I (A)
              </h3>
              <p className="text-xs text-slate-500 mb-4">Charge du départ général MT/BT</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} unit=" A" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="currentA"
                      name="Courant I"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 2 : COMPTEURS DU POSTE */}
      {activeTab === 'METERS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Compteurs & Centrales de Mesure Déployés — {substation.code}
              </h3>
              <p className="text-xs text-slate-500">
                Rattachement unifilaire et paramètres de communication Modbus TCP/IP
              </p>
            </div>
            <Link
              to="/modbus"
              className="text-xs font-semibold text-marsa-600 hover:text-marsa-700 dark:text-marsa-400"
            >
              Ouvrir le banc Modbus →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Code / Désignation</th>
                  <th className="px-4 py-3">Fabricant / Modèle</th>
                  <th className="px-4 py-3">Adresse IP : Port</th>
                  <th className="px-4 py-3">Slave ID</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Intégration Existant</th>
                  <th className="px-4 py-3">Latence Socket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {meters.map((meter) => (
                  <tr key={meter.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{meter.code}</div>
                      <div className="text-[11px] text-slate-500">{meter.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{meter.model}</div>
                      <div className="text-[11px] text-slate-500">{meter.manufacturer}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                      {meter.ipAddress}:{meter.port}
                    </td>
                    <td className="px-4 py-3 font-mono">{meter.slaveId}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          meter.status === 'ONLINE'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {meter.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {meter.isExistingReused ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                          Compteur Existant Réutilisé
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Matériel Neuf Déployé
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                      {meter.status === 'ONLINE' ? `${meter.latencyMs} ms` : 'Timeout'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ONGLET 3 : COMPARAISON SITUATION DE RÉFÉRENCE (SER) */}
      {activeTab === 'SER_ANALYSIS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Rapprochement vs Situation Énergétique de Référence (SER ISO 50001)
            </h3>
            <p className="text-xs text-slate-500">
              Évaluation de la performance du poste {substation.code} par rapport à l’exercice 2025 normalisé
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Consommation Journalière Réelle
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {substation.dailyConsumptionKwh.toLocaleString('fr-FR')} kWh
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Consommation Théorique SER
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                {substation.serBaselineDailyKwh.toLocaleString('fr-FR')} kWh
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">
                Écart de Performance
              </span>
              {(() => {
                const deltaKwh = substation.dailyConsumptionKwh - substation.serBaselineDailyKwh;
                const deltaPct =
                  Math.round((deltaKwh / substation.serBaselineDailyKwh) * 1000) / 10;
                const isFav = deltaKwh <= 0;
                return (
                  <span
                    className={`text-xl font-extrabold font-mono ${
                      isFav ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`} ({isFav ? 'Économie' : 'Surconso'})
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
