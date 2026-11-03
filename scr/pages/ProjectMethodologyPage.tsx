import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight,
  UserCheck,
  FileText,
  Sparkles,
} from 'lucide-react';
import { DEMO_PROJECT_MILESTONES } from '../data/demo/projectPlanData';
import { ProjectMilestone } from '../types';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';

export const ProjectMethodologyPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone>(
    DEMO_PROJECT_MILESTONES[0]
  );

  const completedCount = DEMO_PROJECT_MILESTONES.filter((m) => m.status === 'COMPLETED').length;
  const inProgressCount = DEMO_PROJECT_MILESTONES.filter((m) => m.status === 'IN_PROGRESS').length;
  const totalWeeks = DEMO_PROJECT_MILESTONES.reduce((sum, m) => sum + m.durationWeeks, 0);

  const handleExportCsv = () => {
    exportToCsv(
      DEMO_PROJECT_MILESTONES,
      [
        { header: 'Étape N°', accessor: (m) => m.stepNumber },
        { header: 'Intitulé de l’Étape', accessor: (m) => m.title },
        { header: 'Description Détaillée', accessor: (m) => m.description },
        { header: 'Responsable Opérationnel', accessor: (m) => m.responsible },
        { header: 'Durée (semaines)', accessor: (m) => m.durationWeeks },
        { header: 'Date Début', accessor: (m) => m.startDate },
        { header: 'Date Fin', accessor: (m) => m.endDate },
        { header: 'Progression (%)', accessor: (m) => m.progressPercent },
        { header: 'Statut', accessor: (m) => m.status },
        { header: 'Livrables Contractuels', accessor: (m) => m.deliverables.join(' ; ') },
      ],
      'SME_Marsa_Maroc_Planning_Methodologie_Gantt'
    );
    showToast({
      type: 'success',
      title: 'Planning Exporté',
      message: 'Plan de déploiement et méthodologie en 11 étapes exportés en CSV UTF-8.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Planning Prévisionnel & Méthodologie d'Exécution (À valider DEPA)
          </p>
          <p className="opacity-90 leading-relaxed">
            Le macro-planning ci-dessous respecte scrupuleusement les <strong>11 étapes séquentielles obligatoires</strong>{' '}
            du marché 12/DEPA/2026. Les dates calendaires constituent une trajectoire type de 24 semaines qui sera ajustée
            lors de la réunion d'enclenchement en fonction des impératifs d'accostage des navires.
          </p>
        </div>
      </div>

      {/* Header & Export */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-sky-500" />
            <span>Méthodologie de Déploiement & Planning Gantt (11 Étapes)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              11 Jalons Contractuels
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            De la visite technique contradictoire jusqu'à la formation et la réception définitive
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter le Planning (CSV)</span>
        </button>
      </div>

      {/* Cartes KPI Projet */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Jalons Achevés
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {completedCount} / 11
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Étapes amonts & intégration validées
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Jalon en Cours
          </span>
          <div className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1">
            Étape 6 / 11
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Plateforme & Moteur d'Acquisition
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Durée Globale Estimée
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
            {totalWeeks} sem.
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ~ 6 mois calendaires d'exécution
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Avancement Global
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            58%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Conforme à la trajectoire cible
          </p>
        </div>
      </div>

      {/* Mini Gantt Visuel */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Chronogramme d'Exécution & Avancement des 11 Étapes (Gantt)
          </h3>
          <p className="text-xs text-slate-500">
            Cliquez sur une barre ou une étape pour afficher la fiche de livrables et dépendances
          </p>
        </div>

        <div className="space-y-2">
          {DEMO_PROJECT_MILESTONES.map((step) => {
            const isSelected = selectedMilestone.stepNumber === step.stepNumber;
            const isCompleted = step.status === 'COMPLETED';
            const isInProgress = step.status === 'IN_PROGRESS';

            return (
              <div
                key={step.id}
                onClick={() => setSelectedMilestone(step)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-sky-50/70 dark:bg-sky-950/50 border-sky-400 dark:border-sky-700'
                    : 'bg-slate-50/40 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      Étape {step.stepNumber}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{step.title}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span>{step.startDate} → {step.endDate} ({step.durationWeeks} sem.)</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isInProgress
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                </div>

                {/* Barre de progression visuelle */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : isInProgress
                        ? 'bg-sky-500 animate-pulse'
                        : 'bg-slate-400'
                    }`}
                    style={{ width: `${step.progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fiche détaillée du jalon sélectionné */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 block">
              JALON CONTRACTUEL N° {selectedMilestone.stepNumber} / 11
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {selectedMilestone.title}
            </h3>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>Responsable : <strong>{selectedMilestone.responsible}</strong></span>
            <span>Durée : <strong>{selectedMilestone.durationWeeks} semaines</strong></span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700/60">
          {selectedMilestone.description}
        </p>

        {/* Livrables contractuels */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-sky-500" />
            Livrables Contractuels Associés à cette Étape
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {selectedMilestone.deliverables.map((deliv, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{deliv}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
