import React, { useState } from 'react';
import {
  CheckSquare,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Info,
  RefreshCw,
  FileCheck,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';
import { DEMO_ACCEPTANCE_TESTS } from '../data/demo/testsData';
import { AcceptanceTest } from '../types';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { auditService } from '../services/auditService';

export const AcceptanceTestsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [tests, setTests] = useState<AcceptanceTest[]>(DEMO_ACCEPTANCE_TESTS);
  const [runningTestId, setRunningTestId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const passedCount = tests.filter((t) => t.status === 'PASSED').length;
  const totalCount = tests.length;
  const successRate = Math.round((passedCount / totalCount) * 100);

  const filteredTests = tests.filter((t) => {
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = `${t.id} ${t.code} ${t.title} ${t.objective} ${t.observedResult}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  const handleRunTest = (test: AcceptanceTest) => {
    setRunningTestId(test.id);
    setTimeout(() => {
      setRunningTestId(null);
      const now = new Date().toISOString();

      setTests((prev) =>
        prev.map((t) =>
          t.id === test.id
            ? {
                ...t,
                status: 'PASSED',
                lastRunTimestamp: now,
                executedBy: `${currentUser.fullName} (${currentUser.roleTitle})`,
              }
            : t
        )
      );

      auditService.logEvent({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'EXECUTION_TEST_RECETTE',
        targetObject: `Test ${test.id} — ${test.title}`,
        objectId: test.id,
        newValue: 'Résultat : PASSED (Conforme aux spécifications 12/DEPA/2026)',
        ipAddress: '10.20.4.10',
        result: 'SUCCESS',
      });

      showToast({
        type: 'success',
        title: `Test ${test.id} Exécuté avec Succès`,
        message: `Le critère de conformité "${test.title}" est validé et tracé.`,
      });
    }, 700);
  };

  const handleRunAllTests = () => {
    setRunningTestId('ALL');
    setTimeout(() => {
      setRunningTestId(null);
      const now = new Date().toISOString();

      setTests((prev) =>
        prev.map((t) => ({
          ...t,
          status: 'PASSED',
          lastRunTimestamp: now,
          executedBy: `${currentUser.fullName} (${currentUser.roleTitle})`,
        }))
      );

      showToast({
        type: 'success',
        title: 'Campagne de Recette Complète Validée',
        message: '15/15 tests contractuels exécutés avec succès. PV prêt pour visa contradictoire.',
      });
    }, 1200);
  };

  const handleExportCsv = () => {
    exportToCsv(
      tests,
      [
        { header: 'ID Test', accessor: (t) => t.id },
        { header: 'Code', accessor: (t) => t.code },
        { header: 'Intitulé du Test', accessor: (t) => t.title },
        { header: 'Catégorie', accessor: (t) => t.category },
        { header: 'Objectif de Recette', accessor: (t) => t.objective },
        { header: 'Résultat Attendu', accessor: (t) => t.expectedResult },
        { header: 'Résultat Observé', accessor: (t) => t.observedResult },
        { header: 'Statut', accessor: (t) => t.status },
        { header: 'Date Exécution', accessor: (t) => t.lastRunTimestamp },
        { header: 'Auditeur / Opérateur', accessor: (t) => t.executedBy },
        { header: 'Preuve Documentaire', accessor: (t) => t.evidenceProof },
      ],
      'SME_Plan_Tests_Recette_T01_T15'
    );
    showToast({
      type: 'success',
      title: 'Cahier de Recette Exporté',
      message: 'Matrice des 15 tests contractuels téléchargée en CSV UTF-8.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Cahier de Recette Technique Contractuelle (T01 à T15) — Réf. 12/DEPA/2026
          </p>
          <p className="opacity-90 leading-relaxed">
            Les 15 fiches d'essais ci-dessous constituent le référentiel de validation contradictoire
            prévu pour les opérations préalables à la réception (OPR) du Système de Monitoring Énergétique.
            Chaque test peut être simulé individuellement avec enregistrement probatoire dans le journal d'audit.
          </p>
        </div>
      </div>

      {/* Header & Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-500" />
            <span>Plan de Tests & Fiches de Recette (T01 à T15)</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {passedCount} / {totalCount} Conformes ({successRate}%)
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Validation fonctionnelle, métrologique, protocolaire et organisationnelle du marché DEPA
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleRunAllTests}
            disabled={runningTestId !== null}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exécuter toute la campagne</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exporter PV (CSV)</span>
          </button>
        </div>
      </div>

      {/* Barre de recherche et catégories */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher test T01-T15, critère..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-marsa-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="ALL">Toutes catégories ({totalCount})</option>
            <option value="COMMUNICATION">Communication & Modbus</option>
            <option value="METROLOGY">Métrologie & Calculs</option>
            <option value="SUPERVISION">Supervision & Reporting</option>
            <option value="MANAGEMENT">Management Énergétique & SER</option>
            <option value="SECURITY">Sécurité & Résilience</option>
            <option value="TRAINING">Formation & Transfert</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredTests.length} fiche(s) de test affichée(s)
        </span>
      </div>

      {/* Grille des 15 fiches de test */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map((test) => {
          const isRunning = runningTestId === test.id || runningTestId === 'ALL';

          return (
            <div
              key={test.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header fiche de test */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      {test.id}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {test.code}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      test.status === 'PASSED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{test.status}</span>
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {test.title}
                </h3>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-3 leading-snug">
                  {test.objective}
                </p>

                {/* Résultat Attendu vs Observé */}
                <div className="space-y-2 text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60 mb-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Critère d'acceptation attendu :
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">{test.expectedResult}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      Constat contradictoire :
                    </span>
                    <p className="text-emerald-700 dark:text-emerald-300 font-medium">{test.observedResult}</p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 mb-3">
                  <span className="font-semibold text-slate-500">Preuve : </span>
                  <span className="italic">{test.evidenceProof}</span>
                </div>
              </div>

              {/* Footer avec Bouton de simulation du test */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-400 truncate">
                  <span>{new Date(test.lastRunTimestamp).toLocaleDateString('fr-FR')}</span>
                </div>

                <button
                  onClick={() => handleRunTest(test)}
                  disabled={isRunning}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Simulation...' : 'Exécuter'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
