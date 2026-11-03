import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Activity,
  Gauge,
  TrendingDown,
  Bell,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Download,
} from 'lucide-react';
import { KpiCard } from '../components/common/KpiCard';
import { DateRangeFilter, DatePeriod } from '../components/common/DateRangeFilter';
import { DEMO_SUBSTATIONS } from '../data/demo/substationsData';
import { DEMO_HOURLY_TODAY, DEMO_HEATMAP_DATA } from '../data/demo/timeSeriesData';
import { generateAutomatedInsights } from '../services/insightEngine';
import { alertService } from '../services/alertService';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<DatePeriod>('TODAY');
  const { showToast } = useToast();
  const insights = generateAutomatedInsights();
  const activeAlerts = alertService.getAlerts().filter((a) => a.status !== 'CLOSED');

  // Agrégats globaux calculés
  const totalInstantPowerKw = DEMO_SUBSTATIONS.reduce((sum, s) => sum + s.activePowerKw, 0);
  const totalDailyConsumptionKwh = DEMO_SUBSTATIONS.reduce((sum, s) => sum + s.dailyConsumptionKwh, 0);
  const totalMonthlyConsumptionKwh = DEMO_SUBSTATIONS.reduce((sum, s) => sum + s.monthlyConsumptionKwh, 0);
  const totalSerBaselineDailyKwh = DEMO_SUBSTATIONS.reduce((sum, s) => sum + s.serBaselineDailyKwh, 0);
  const averageCosPhi =
    DEMO_SUBSTATIONS.reduce((sum, s) => sum + s.powerFactor, 0) / DEMO_SUBSTATIONS.length;

  const onlineMetersCount = 16;
  const totalMetersCount = 18;
  const serDeviationPercent =
    Math.round(((totalDailyConsumptionKwh - totalSerBaselineDailyKwh) / totalSerBaselineDailyKwh) * 1000) / 10;

  const handleExportDashboardSummary = () => {
    exportToCsv(
      DEMO_SUBSTATIONS,
      [
        { header: 'Poste Code', accessor: (s) => s.code },
        { header: 'Désignation', accessor: (s) => s.name },
        { header: 'Catégorie', accessor: (s) => s.category },
        { header: 'Puissance Active (kW)', accessor: (s) => s.activePowerKw },
        { header: 'Puissance Réactive (kvar)', accessor: (s) => s.reactivePowerKvar },
        { header: 'Facteur Puissance cos φ', accessor: (s) => s.powerFactor },
        { header: 'Conso Aujourd’hui (kWh)', accessor: (s) => s.dailyConsumptionKwh },
        { header: 'Référence SER Jour (kWh)', accessor: (s) => s.serBaselineDailyKwh },
        { header: 'Statut Communication', accessor: (s) => s.status },
        { header: 'Score Qualité (%)', accessor: (s) => s.qualityScore },
      ],
      'SME_Dashboard_Synthese_Postes'
    );
    showToast({
      type: 'success',
      title: 'Export Réussi',
      message: 'La synthèse des 6 postes a été téléchargée en CSV avec encodage UTF-8.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top action bar: Filtre de période & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Supervision Énergétique Portuaire</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              6 Postes MT/BT
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Données consolidées d’exploitation — Direction d’Exploitation au Port d’Agadir
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DateRangeFilter selectedPeriod={period} onSelectPeriod={setPeriod} />
          <button
            onClick={handleExportDashboardSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bannière d'Analyse Automatique & Insights Locaux */}
      {insights.length > 0 && (
        <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-sky-200 dark:border-sky-900/60 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-900 dark:text-sky-300">
                Moteur d’Analyse Automatique & Insights Opérationnels (Règles Locales)
              </h3>
            </div>
            <span className="text-[10px] text-slate-500">Calculé en continu</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.slice(0, 2).map((ins) => (
              <div
                key={ins.id}
                className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${
                  ins.type === 'CRITICAL'
                    ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200'
                    : ins.type === 'WARNING'
                    ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-200'
                    : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200'
                }`}
              >
                <div>
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {ins.type === 'CRITICAL' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                    {ins.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    {ins.type === 'POSITIVE' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    <span>{ins.title}</span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{ins.description}</p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                  <strong>Recommandation :</strong> {ins.actionRecommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grille des 10 KPIs Clés du SME */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Puissance Instantanée"
          value={Math.round(totalInstantPowerKw)}
          unit="kW"
          delta={{ valuePercent: -3.4, description: 'vs pointe hier', isFavorable: true }}
          tooltipExplanation="Somme des puissances actives instantanées mesurées sur les 6 postes"
          drillDownTo="/realtime"
          drillDownLabel="Temps réel"
          icon={Zap}
          accentColor="sky"
        />

        <KpiCard
          title="Consommation Aujourd’hui"
          value={Math.round(totalDailyConsumptionKwh)}
          unit="kWh"
          delta={{
            valuePercent: serDeviationPercent,
            description: 'vs Référence SER',
            isFavorable: serDeviationPercent <= 0,
          }}
          tooltipExplanation="Énergie active totale soutirée depuis 00h00 sur le réseau MT 22 kV"
          drillDownTo="/history"
          drillDownLabel="Historique"
          icon={Activity}
          accentColor="indigo"
        />

        <KpiCard
          title="Facteur de Puissance (cos φ)"
          value={averageCosPhi.toFixed(3)}
          unit="moyen"
          delta={{ valuePercent: -0.8, description: 'Seuil ONEE 0.900', isFavorable: averageCosPhi >= 0.9 }}
          tooltipExplanation="Cosinus phi moyen pondéré. Une valeur inférieure à 0.90 entraîne des pénalités ONEE"
          drillDownTo="/postes/P3"
          drillDownLabel="Voir P3 (0.880)"
          icon={Gauge}
          accentColor={averageCosPhi < 0.9 ? 'amber' : 'emerald'}
        />

        <KpiCard
          title="Consommation Mois"
          value={Math.round(totalMonthlyConsumptionKwh)}
          unit="kWh"
          delta={{ valuePercent: -2.1, description: 'vs Mois N-1', isFavorable: true }}
          tooltipExplanation="Consommation cumulée du mois en cours avec valorisation tarifaire"
          drillDownTo="/reports"
          drillDownLabel="Rapports"
          icon={Flame}
          accentColor="purple"
        />

        <KpiCard
          title="Écart vs Baseline SER"
          value={serDeviationPercent > 0 ? `+${serDeviationPercent}%` : `${serDeviationPercent}%`}
          unit="vs ISO 50001"
          delta={{ valuePercent: -2.6, description: 'Économie 28 875 MAD', isFavorable: true }}
          tooltipExplanation="Écart de consommation par rapport à la situation énergétique de référence modélisée"
          drillDownTo="/ser"
          drillDownLabel="Bilan SER"
          icon={TrendingDown}
          accentColor="emerald"
        />

        <KpiCard
          title="Alertes Actives"
          value={activeAlerts.length}
          unit="incident(s)"
          delta={{ valuePercent: 1, description: '1 critique (P6)', isFavorable: activeAlerts.length === 0 }}
          tooltipExplanation="Alertes en cours nécessitant un acquittement ou une intervention de l'exploitant"
          drillDownTo="/alerts"
          drillDownLabel="Gérer alertes"
          icon={Bell}
          accentColor={activeAlerts.length > 0 ? 'rose' : 'emerald'}
        />

        <KpiCard
          title="Compteurs Connectés"
          value={`${onlineMetersCount} / ${totalMetersCount}`}
          unit="en ligne"
          delta={{ valuePercent: -11.1, description: '2 compteurs P6 offline', isFavorable: false }}
          tooltipExplanation="Disponibilité des sockets Modbus TCP/IP sur le port 502"
          drillDownTo="/equipment"
          drillDownLabel="Équipements"
          icon={Cpu}
          accentColor="sky"
        />

        <KpiCard
          title="Complétude des Données"
          value="98.2 %"
          unit="qualité"
          delta={{ valuePercent: 0.4, description: 'Score conforme', isFavorable: true }}
          tooltipExplanation="Taux de points de mesure valides reçus dans les délais contractuels"
          drillDownTo="/quality"
          drillDownLabel="Qualité"
          icon={CheckCircle2}
          accentColor="emerald"
        />
      </div>

      {/* Graphique Principal : Profil 24h & Comparaison SER Baseline */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Courbe de Puissance 24h & Rapprochement SER (kW)</span>
              <span className="text-xs font-normal text-slate-500">• Pas 1 heure</span>
            </h3>
            <p className="text-xs text-slate-500">
              Comparaison entre la puissance active appelée réelle et la courbe de référence théorique SER ISO 50001
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
              <span className="w-3 h-1 bg-sky-500 rounded" /> Puissance Réelle (kW)
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-3 h-1 bg-amber-500 rounded border-dashed" /> Référence SER (kW)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEMO_HOURLY_TODAY} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotalKw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit=" kW" domain={[1500, 4800]} />
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
                dataKey="totalKw"
                name="Puissance Réelle"
                stroke="#0284c7"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTotalKw)"
              />
              <Area
                type="monotone"
                dataKey="serBaselineKw"
                name="Baseline SER"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 2 colonnes : Répartition par Poste & Heatmap d'Intensité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consommation par Poste */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Consommation par Poste Électrique (kWh/jour)
              </h3>
              <p className="text-xs text-slate-500">Répartition comparative Réel vs Référence SER</p>
            </div>
            <Link
              to="/postes"
              className="text-xs font-semibold text-marsa-600 hover:text-marsa-700 dark:text-marsa-400 flex items-center gap-1"
            >
              <span>Voir 6 postes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={DEMO_SUBSTATIONS}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="id" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit=" kWh" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="dailyConsumptionKwh" name="Consommation Réelle" fill="#0e8ce6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="serBaselineDailyKwh" name="Baseline SER" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap Heure x Jour */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Matrice d’Intensité Énergétique (Heatmap 7 jours × 24h)
              </h3>
              <p className="text-xs text-slate-500">Identification visuelle des pics de demande et du talon nocturne</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="w-2.5 h-2.5 rounded bg-sky-100 dark:bg-sky-950 border border-sky-300" />
              <span>Faible</span>
              <span className="w-2.5 h-2.5 rounded bg-sky-300 dark:bg-sky-700" />
              <span>Moyen</span>
              <span className="w-2.5 h-2.5 rounded bg-sky-500" />
              <span>Élevé</span>
              <span className="w-2.5 h-2.5 rounded bg-rose-500" />
              <span>Pointe</span>
            </div>
          </div>

          {/* Grille Heatmap simplifiée */}
          <div className="space-y-1 text-[11px] pt-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => {
              const dayCells = DEMO_HEATMAP_DATA.filter((c) => c.day === day);
              return (
                <div key={day} className="flex items-center gap-1.5">
                  <span className="w-8 font-semibold text-slate-500 text-[10px]">{day}</span>
                  <div className="flex-1 grid grid-cols-24 gap-0.5">
                    {dayCells.map((cell) => {
                      const bgClass =
                        cell.intensity === 'PEAK'
                          ? 'bg-rose-500 text-white'
                          : cell.intensity === 'HIGH'
                          ? 'bg-sky-500 text-white'
                          : cell.intensity === 'MEDIUM'
                          ? 'bg-sky-300 dark:bg-sky-700'
                          : 'bg-slate-100 dark:bg-slate-800';
                      return (
                        <div
                          key={cell.hour}
                          title={`${cell.day} à ${cell.hour}h00 : ${cell.consumptionKwh.toLocaleString('fr-FR')} kWh`}
                          className={`h-5 rounded-sm transition-transform hover:scale-125 cursor-pointer ${bgClass}`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[9px] text-slate-400 px-9 mt-1.5 font-mono">
            <span>00h</span>
            <span>06h</span>
            <span>12h</span>
            <span>18h</span>
            <span>23h</span>
          </div>
        </div>
      </div>

      {/* Synthèse Opérationnelle des 6 Postes */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              État Opérationnel des 6 Postes Électriques
            </h3>
            <p className="text-xs text-slate-500">
              Surveillance continue des transformateurs MT/BT et conformité cos φ
            </p>
          </div>
          <Link
            to="/postes"
            className="text-xs font-semibold text-marsa-600 hover:text-marsa-700 dark:text-marsa-400 flex items-center gap-1"
          >
            <span>Fiches détaillées</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEMO_SUBSTATIONS.map((post) => {
            const isAlert = post.status === 'WARNING' || post.status === 'COMM_LOST';
            return (
              <Link
                key={post.id}
                to={`/postes/${post.id}`}
                className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-marsa-500 dark:hover:border-marsa-500 bg-slate-50/50 dark:bg-slate-850/50 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {post.code}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-marsa-600 transition-colors line-clamp-1">
                      {post.name}
                    </h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      post.status === 'NORMAL'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : post.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">Puissance</div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{post.activePowerKw} kW</div>
                  </div>
                  <div className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">cos φ</div>
                    <div
                      className={`font-bold ${
                        post.powerFactor < 0.9 ? 'text-amber-600' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {post.powerFactor.toFixed(3)}
                    </div>
                  </div>
                  <div className="p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">Qualité</div>
                    <div className="font-bold text-emerald-600">{post.qualityScore} %</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
