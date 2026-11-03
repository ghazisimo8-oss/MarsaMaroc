import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Zap,
  TrendingDown,
  ShieldCheck,
} from 'lucide-react';
import { DEMO_SUBSTATIONS } from '../data/demo/substationsData';
import { DEMO_IPES } from '../data/demo/ipeData';
import { DEMO_SER_WATERFALL } from '../data/demo/serData';
import { alertService } from '../services/alertService';
import { exportToCsv } from '../lib/exportUtils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { auditService } from '../services/auditService';

type ReportType =
  | 'ENERGY_SYNTHESIS'
  | 'SUBSTATION_PERFORMANCE'
  | 'IPE_REPORT'
  | 'SER_AUDIT'
  | 'ALERTS_SUMMARY'
  | 'DATA_QUALITY';

export const ReportsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [reportType, setReportType] = useState<ReportType>('ENERGY_SYNTHESIS');
  const [period, setPeriod] = useState<string>('MONTH');
  const [selectedSubstations, setSelectedSubstations] = useState<string>('ALL');
  const [generatedDate, setGeneratedDate] = useState<string>(new Date().toISOString());
  const [isGenerated, setIsGenerated] = useState<boolean>(true);

  const activeAlerts = alertService.getAlerts();

  const handleGenerateReport = () => {
    setGeneratedDate(new Date().toISOString());
    setIsGenerated(true);

    auditService.logEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'GENERATION_RAPPORT',
      targetObject: `Rapport ${reportType}`,
      objectId: `REP-${Date.now()}`,
      newValue: `Période: ${period} | Périmètre: ${selectedSubstations}`,
      ipAddress: '10.20.4.12',
      result: 'SUCCESS',
    });

    showToast({
      type: 'success',
      title: 'Rapport Généré',
      message: 'Le bilan a été recalculé et actualisé avec succès.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    if (reportType === 'ENERGY_SYNTHESIS' || reportType === 'SUBSTATION_PERFORMANCE') {
      exportToCsv(
        DEMO_SUBSTATIONS,
        [
          { header: 'Code Poste', accessor: (s) => s.code },
          { header: 'Désignation', accessor: (s) => s.name },
          { header: 'Catégorie', accessor: (s) => s.category },
          { header: 'Puissance Active Instantanée (kW)', accessor: (s) => s.activePowerKw },
          { header: 'Facteur de Puissance cos phi', accessor: (s) => s.powerFactor },
          { header: 'Consommation Jour (kWh)', accessor: (s) => s.dailyConsumptionKwh },
          { header: 'Consommation Mois (kWh)', accessor: (s) => s.monthlyConsumptionKwh },
          { header: 'Référence SER (kWh)', accessor: (s) => s.serBaselineDailyKwh },
          { header: 'Score Qualité (%)', accessor: (s) => s.qualityScore },
        ],
        `SME_Rapport_${reportType}_${period}`
      );
    } else if (reportType === 'IPE_REPORT') {
      exportToCsv(
        DEMO_IPES,
        [
          { header: 'Code IPE', accessor: (i) => i.code },
          { header: 'Désignation', accessor: (i) => i.name },
          { header: 'Formule', accessor: (i) => i.formula },
          { header: 'Valeur Actuelle', accessor: (i) => i.currentValue },
          { header: 'Objectif Cible', accessor: (i) => i.targetValue },
          { header: 'Unité', accessor: (i) => i.unit },
          { header: 'Statut', accessor: (i) => i.status },
        ],
        `SME_Rapport_IPE_${period}`
      );
    } else if (reportType === 'SER_AUDIT') {
      exportToCsv(
        DEMO_SER_WATERFALL,
        [
          { header: 'Poste', accessor: (w) => w.name },
          { header: 'Baseline (kWh)', accessor: (w) => w.baselineKwh },
          { header: 'Réel (kWh)', accessor: (w) => w.actualKwh },
          { header: 'Écart (kWh)', accessor: (w) => w.varianceKwh },
          { header: 'Écart (%)', accessor: (w) => w.variancePercent },
          { header: 'Impact Financier (MAD)', accessor: (w) => w.financialImpactMad },
        ],
        `SME_Rapport_SER_Audit_${period}`
      );
    } else {
      exportToCsv(
        activeAlerts,
        [
          { header: 'Code', accessor: (a) => a.code },
          { header: 'Titre', accessor: (a) => a.title },
          { header: 'Priorité', accessor: (a) => a.priority },
          { header: 'Statut', accessor: (a) => a.status },
          { header: 'Poste', accessor: (a) => a.substationName },
          { header: 'Valeur', accessor: (a) => a.triggerValue },
          { header: 'Seuil', accessor: (a) => a.thresholdValue },
        ],
        `SME_Rapport_Alertes_${period}`
      );
    }

    showToast({
      type: 'success',
      title: 'Téléchargement CSV Réussi',
      message: 'Le fichier CSV structuré UTF-8 a été généré.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Panneau de configuration du rapport (masqué à l'impression) */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-500" />
            <span>Génération de Rapports & Bilans Énergétiques</span>
          </h2>
          <p className="text-xs text-slate-500">
            Export certifiable pour l'exploitation portuaire, la commission ISO 50001 et les audits contractuels
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-marsa-500"
          >
            <option value="ENERGY_SYNTHESIS">Bilan Énergétique Global (6 Postes)</option>
            <option value="SUBSTATION_PERFORMANCE">Détail par Poste & Équipements</option>
            <option value="IPE_REPORT">Indicateurs de Performance (IPE)</option>
            <option value="SER_AUDIT">Rapport d'Écart Baseline SER</option>
            <option value="ALERTS_SUMMARY">Registre des Alertes & Résolutions</option>
          </select>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-marsa-500"
          >
            <option value="TODAY">Aujourd'hui</option>
            <option value="WEEK">7 derniers jours</option>
            <option value="MONTH">Mois civil en cours</option>
            <option value="YEAR">Exercice annuel 2026</option>
          </select>

          <button
            onClick={handleGenerateReport}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Actualiser</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer / PDF</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT DE RAPPORT (PRINT-FRIENDLY) */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg p-6 sm:p-10 space-y-6">
        {/* Entête officiel Marsa Maroc */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-marsa-700 dark:text-sky-400">
                MARSA MAROC
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Direction d'Exploitation au Port d'Agadir (DEPA)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-2 text-slate-900 dark:text-slate-100">
              {reportType === 'ENERGY_SYNTHESIS' && 'RAPPORT DE SYNTHÈSE ÉNERGÉTIQUE — 6 POSTES MT/BT'}
              {reportType === 'SUBSTATION_PERFORMANCE' && 'RAPPORT DÉTAILLÉ DE PERFORMANCE DES POSTES MT/BT'}
              {reportType === 'IPE_REPORT' && 'CATALOGUE & SUIVI DES INDICATEURS DE PERFORMANCE (IPE)'}
              {reportType === 'SER_AUDIT' && 'RAPPORT CONTRADICTOIRE D’ÉCART SITUATION DE RÉFÉRENCE (SER)'}
              {reportType === 'ALERTS_SUMMARY' && 'REGISTRE D’EXPLOITATION DES ALERTES & INCIDENTS ÉLECTRIQUES'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Système de Monitoring Énergétique (SME) — Référence Marché : <strong>12/DEPA/2026</strong>
            </p>
          </div>

          <div className="text-right text-xs space-y-1">
            <div className="inline-block px-2.5 py-1 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">
              DÉMONSTRATION — À VALIDER DEPA
            </div>
            <div className="text-slate-500 text-[11px]">
              Généré le : <strong>{new Date(generatedDate).toLocaleString('fr-FR')}</strong>
            </div>
            <div className="text-slate-500 text-[11px]">
              Opérateur : <strong>{currentUser.fullName} ({currentUser.roleTitle})</strong>
            </div>
          </div>
        </div>

        {/* Synthèse exécutive calculée automatiquement */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
          <div className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-500" />
            Synthèse Exécutive Automatique
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Sur la période analysée ({period}), la puissance globale appelée instantanée sur les 6 postes MT/BT s'élève à{' '}
            <strong>
              {Math.round(DEMO_SUBSTATIONS.reduce((acc, s) => acc + s.activePowerKw, 0)).toLocaleString()} kW
            </strong>
            . L'écart consolidé par rapport à la Situation Énergétique de Référence (SER ISO 50001) enregistre une
            performance favorable de <strong>-2,1 %</strong>, correspondant à une économie mensuelle estimée à{' '}
            <strong>+37 875 MAD</strong>. Le facteur de puissance moyen est maintenu à <strong>0,948</strong>, avec
            une alerte sous surveillance sur le Poste P3 (cos φ à 0,880).
          </p>
        </div>

        {/* Tableau de données du rapport */}
        {reportType === 'ENERGY_SYNTHESIS' || reportType === 'SUBSTATION_PERFORMANCE' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Poste</th>
                  <th className="py-2.5 px-3">Affectation Portuaire</th>
                  <th className="py-2.5 px-3 text-right">Transfo</th>
                  <th className="py-2.5 px-3 text-right">P. Active (kW)</th>
                  <th className="py-2.5 px-3 text-right">cos φ</th>
                  <th className="py-2.5 px-3 text-right">Conso Jour (kWh)</th>
                  <th className="py-2.5 px-3 text-right">Conso Mois (kWh)</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                {DEMO_SUBSTATIONS.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-sans font-bold text-slate-900 dark:text-slate-100">
                      {sub.code}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-300">
                      {sub.name.split('—')[1]?.trim() || sub.name}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400">
                      {sub.transformerPowerKva} kVA
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {sub.activePowerKw.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className={sub.powerFactor < 0.9 ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                        {sub.powerFactor.toFixed(3)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-900 dark:text-slate-100 font-bold">
                      {sub.dailyConsumptionKwh.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-sky-600 dark:text-sky-400 font-bold">
                      {sub.monthlyConsumptionKwh.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-center font-sans">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          sub.status === 'NORMAL'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : sub.status === 'WARNING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reportType === 'IPE_REPORT' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Indicateur IPE</th>
                  <th className="py-2.5 px-3">Formule</th>
                  <th className="py-2.5 px-3 text-right">Actuel</th>
                  <th className="py-2.5 px-3 text-right">Cible</th>
                  <th className="py-2.5 px-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {DEMO_IPES.map((ipe) => (
                  <tr key={ipe.id}>
                    <td className="py-2 px-3 font-mono font-bold text-marsa-600 dark:text-marsa-400">{ipe.code}</td>
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">{ipe.name}</td>
                    <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{ipe.formula}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">{ipe.currentValue} {ipe.unit}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-500">{ipe.targetValue} {ipe.unit}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {ipe.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Poste</th>
                  <th className="py-2.5 px-3 text-right">Baseline (kWh)</th>
                  <th className="py-2.5 px-3 text-right">Réel (kWh)</th>
                  <th className="py-2.5 px-3 text-right">Écart Net</th>
                  <th className="py-2.5 px-3 text-right">Impact Financier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
                {DEMO_SER_WATERFALL.map((w, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-sans font-semibold">{w.name}</td>
                    <td className="py-2 px-3 text-right">{w.baselineKwh.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold">{w.actualKwh.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right">
                      <span className={w.varianceKwh <= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {w.varianceKwh <= 0 ? '' : '+'}{w.varianceKwh.toLocaleString()} kWh ({w.variancePercent}%)
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-600">
                      +{w.financialImpactMad.toLocaleString()} MAD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signatures officielles pour validation de recette */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-xs">
          <div className="border border-dashed border-slate-300 dark:border-slate-700 p-4 rounded-lg">
            <div className="font-semibold text-slate-500 uppercase tracking-wider mb-8">
              Pour l'Intégrateur Technique SME
            </div>
            <div className="text-slate-400 italic text-[11px]">
              Signature & Cachet Société
            </div>
          </div>
          <div className="border border-dashed border-slate-300 dark:border-slate-700 p-4 rounded-lg">
            <div className="font-semibold text-slate-500 uppercase tracking-wider mb-8">
              Pour la Direction d'Exploitation au Port d'Agadir (DEPA)
            </div>
            <div className="text-slate-400 italic text-[11px]">
              Visa Responsable Énergie / Commission de Recette
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
