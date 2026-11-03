import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  Activity,
  Layers,
  Info,
  Download,
  RefreshCw,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { DEMO_SUBSTATIONS } from '../data/demo/substationsData';
import { DEMO_METERS } from '../data/demo/metersData';
import { QualityBadge } from '../components/common/QualityBadge';
import { FreshnessIndicator } from '../components/common/FreshnessIndicator';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';
import { DataQuality, FreshnessState } from '../types';

export const QualityPage: React.FC = () => {
  const { showToast } = useToast();
  const [isAuditing, setIsAuditing] = useState(false);

  // Agrégats qualité
  const totalMeters = DEMO_METERS.length;
  const onlineMeters = DEMO_METERS.filter((m) => m.status === 'ONLINE').length;
  const overallCompleteness = 99.4;
  const overallFreshness = 97.2;
  const validityRate = 99.8;
  const networkAvailability = 94.4; // 17/18 en ligne

  const qualityCategories: Array<{
    code: DataQuality;
    label: string;
    description: string;
    count: number;
    badgeColor: string;
  }> = [
    {
      code: 'GOOD',
      label: 'Qualité Optimale (GOOD)',
      description: 'Mesure horodatée, dans les plages physiques nominales, sans dérive ni suspicion.',
      count: 17,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      code: 'ESTIMATED',
      label: 'Mesure Estimée (ESTIMATED)',
      description: 'Interpolation statistique linéaire validée lors d’une micro-coupure inférieure à 3 cycles.',
      count: 0,
      badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    },
    {
      code: 'STALE',
      label: 'Mesure Figée (STALE)',
      description: 'Valeur identique sur plusieurs scrutations consécutives en charge active (suspicion registre gelé).',
      count: 0,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      code: 'COMM_ERROR',
      label: 'Défaut Communication (COMM_ERROR)',
      description: 'Perte de socket TCP port 502, timeout > 3000 ms ou passerelle Modbus/RTU inaccessible.',
      count: 1, // MTR-P6-01 simulé
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    },
    {
      code: 'INVALID',
      label: 'Mesure Invalide (INVALID)',
      description: 'Valeur en dehors des bornes admissibles (ex: cos φ > 1.0 ou U > 480 V sur réseau BT).',
      count: 0,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    },
    {
      code: 'MISSING',
      label: 'Donnée Manquante (MISSING)',
      description: 'Aucune trame reçue pendant l’intervalle de scrutation contractuel.',
      count: 0,
      badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    },
  ];

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      showToast({
        type: 'success',
        title: 'Audit Métrologique Réalisé',
        message: '18 centrales de mesure contrôlées : 17 conformes, 1 incident Modbus simulé détecté sur Poste P6.',
      });
    }, 800);
  };

  const handleExportCsv = () => {
    exportToCsv(
      DEMO_METERS,
      [
        { header: 'ID Compteur', accessor: (m) => m.id },
        { header: 'Désignation', accessor: (m) => m.name },
        { header: 'Poste', accessor: (m) => m.substationId },
        { header: 'IP Modbus', accessor: (m) => m.ipAddress },
        { header: 'Statut Liaison', accessor: (m) => m.status },
        { header: 'Latence (ms)', accessor: (m) => m.latencyMs },
        { header: 'Fréquence (s)', accessor: (m) => m.pollingIntervalSeconds },
        { header: 'Dernière Réception', accessor: (m) => m.lastReadingTimestamp },
      ],
      'SME_Audit_Qualite_Donnees_Metrologie'
    );
    showToast({
      type: 'success',
      title: 'Export Réussi',
      message: 'Registre de qualification métrologique téléchargé en CSV.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer métrologique */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Gouvernance Métrologique & Intégrité des Données (À valider DEPA)
          </p>
          <p className="opacity-90 leading-relaxed">
            Le SME distingue strictement un <strong>0 kWh mesuré</strong> (consommation réelle nulle en veille)
            d’une <strong>donnée manquante (MISSING)</strong> ou d’un <strong>défaut de communication (COMM_ERROR)</strong>.
            Aucune mesure absente n’est substituée par 0 sans qualification explicite afin de préserver l’exactitude du bilan global.
          </p>
        </div>
      </div>

      {/* Header & Boutons d'audit */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>Qualification Métrologique & Qualité des Données</span>
          </h2>
          <p className="text-xs text-slate-500">
            Contrôle d'intégrité, complétude, fraîcheur et détection des anomalies sur la chaîne d'acquisition
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Audit en cours...' : 'Lancer un audit complet'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Cartes KPI Qualité */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Taux de Complétude
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {overallCompleteness}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Échantillons reçus vs théoriques
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Fraîcheur Métrologique
          </span>
          <div className="text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
            {overallFreshness}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Données de moins de 60 secondes
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Validité Physique
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {validityRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            0 valeur aberrante détectée
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Disponibilité Modbus
          </span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {onlineMeters} / {totalMeters}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            1 compteur en timeout (P6-01 démo)
          </p>
        </div>
      </div>

      {/* Classification des statuts de qualité */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Nomenclature des États de Qualité des Données (Enum DataQuality)
          </h3>
          <p className="text-xs text-slate-500">
            Critères d'étiquetage automatique appliqués à chaque échantillon dès sa réception Modbus
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {qualityCategories.map((cat) => (
            <div
              key={cat.code}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cat.badgeColor}`}>
                  {cat.code}
                </span>
                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                  {cat.count} équipement(s)
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{cat.label}</h4>
              <p className="text-[11px] text-slate-500 leading-snug">{cat.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tableau d'audit métrologique des 18 compteurs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Audit Contradictoire de la Flotte des 18 Compteurs
            </h4>
            <p className="text-xs text-slate-500">
              Surveillance continue de la gigue réseau (RTT), de la fraîcheur et du statut protocolaire
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
            18 / 18 audités
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Compteur</th>
                <th className="py-2.5 px-3">Poste</th>
                <th className="py-2.5 px-3">Adresse IP</th>
                <th className="py-2.5 px-3">Statut Liaison</th>
                <th className="py-2.5 px-3">Latence Socket</th>
                <th className="py-2.5 px-3">Fraîcheur</th>
                <th className="py-2.5 px-3">Qualité Attribuée</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {DEMO_METERS.map((meter) => {
                const isDown = meter.status === 'OFFLINE' || meter.status === 'TIMEOUT';
                const quality: DataQuality = isDown ? 'COMM_ERROR' : 'GOOD';
                const freshness: FreshnessState = isDown ? 'OBSOLETE' : 'FRESH';

                return (
                  <tr key={meter.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{meter.name}</div>
                      <span className="font-mono text-[10px] text-slate-400">{meter.code}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-700 dark:text-slate-300">
                      {meter.substationId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {meter.ipAddress}:{meter.port}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          !isDown
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {meter.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={meter.latencyMs > 100 ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                        {meter.latencyMs} ms
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <FreshnessIndicator freshness={freshness} />
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <QualityBadge quality={quality} />
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
