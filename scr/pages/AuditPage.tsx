import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  User,
  Layers,
} from 'lucide-react';
import { auditService } from '../services/auditService';
import { AuditEvent, UserRole } from '../types';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';

export const AuditPage: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<AuditEvent[]>(auditService.getLogs());
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const unsubscribe = auditService.subscribe(() => {
      setLogs(auditService.getLogs());
    });
    return unsubscribe;
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (roleFilter !== 'ALL' && l.userRole !== roleFilter) return false;
    if (resultFilter !== 'ALL' && l.result !== resultFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = `${l.id} ${l.userName} ${l.action} ${l.targetObject} ${l.objectId} ${l.newValue || ''}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    exportToCsv(
      filteredLogs,
      [
        { header: 'ID Audit', accessor: (l) => l.id },
        { header: 'Horodatage (ISO)', accessor: (l) => l.timestamp },
        { header: 'Utilisateur', accessor: (l) => l.userName },
        { header: 'Rôle', accessor: (l) => l.userRole },
        { header: 'Action', accessor: (l) => l.action },
        { header: 'Objet Cible', accessor: (l) => l.targetObject },
        { header: 'ID Objet', accessor: (l) => l.objectId },
        { header: 'Ancienne Valeur', accessor: (l) => l.previousValue || 'N/A' },
        { header: 'Nouvelle Valeur', accessor: (l) => l.newValue || 'N/A' },
        { header: 'Adresse IP', accessor: (l) => l.ipAddress },
        { header: 'Résultat', accessor: (l) => l.result },
      ],
      'SME_Journal_Audit_Inalterable'
    );
    showToast({
      type: 'success',
      title: 'Export Journal d’Audit',
      message: `${filteredLogs.length} traces d’audit exportées en CSV UTF-8.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Journal d'Audit Inaltérable & Traçabilité Opérateur (Append-Only)
          </p>
          <p className="opacity-90 leading-relaxed">
            Chaque opération sensible (acquittement d'alerte, modification de consigne IPE, paramétrage de compteur,
            commutation de profil de démonstration, test de restauration PCA) est inscrite de manière irréversible
            avec son horodatage certifié, l'identité de l'opérateur et son adresse IP de connexion.
          </p>
        </div>
      </div>

      {/* Header & Export */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-sky-500" />
            <span>Journal d’Audit Inaltérable & Traçabilité des Actions</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              {logs.length} Événements Enregistrés
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Registre chronologique probant conforme aux exigences de gouvernance ISO 50001 et CPS 12/DEPA/2026
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter le Registre (CSV)</span>
        </button>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher action, utilisateur, objet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-marsa-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="ALL">Tous les rôles</option>
            <option value="ADMIN">Administrateur</option>
            <option value="ENERGY_MANAGER">Responsable Énergie</option>
            <option value="OPERATOR">Exploitant</option>
            <option value="READER">Lecteur</option>
          </select>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="ALL">Tous les résultats</option>
            <option value="SUCCESS">Succès (SUCCESS)</option>
            <option value="WARNING">Avertissement (WARNING)</option>
            <option value="FAILURE">Échec (FAILURE)</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredLogs.length} entrée(s) filtrée(s)
        </span>
      </div>

      {/* Tableau du journal d'audit */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold font-sans">
              <tr>
                <th className="py-2.5 px-3">Horodatage</th>
                <th className="py-2.5 px-3">Opérateur & Rôle</th>
                <th className="py-2.5 px-3">Action Réalisée</th>
                <th className="py-2.5 px-3">Objet Cible</th>
                <th className="py-2.5 px-3">Détail des Modifications</th>
                <th className="py-2.5 px-3">Adresse IP</th>
                <th className="py-2.5 px-3 text-center">Résultat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                    <div>{new Date(log.timestamp).toLocaleDateString('fr-FR')}</div>
                    <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString('fr-FR')}</span>
                  </td>
                  <td className="py-2.5 px-3 font-sans whitespace-nowrap">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{log.userName}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{log.userRole}</span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-sky-700 dark:text-sky-300 text-[11px] bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300 max-w-[200px] truncate" title={log.targetObject}>
                    {log.targetObject}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-slate-400 max-w-[260px]">
                    {log.previousValue && (
                      <div className="text-rose-600 dark:text-rose-400 truncate" title={log.previousValue}>
                        - {log.previousValue}
                      </div>
                    )}
                    {log.newValue && (
                      <div className="text-emerald-600 dark:text-emerald-400 font-semibold truncate" title={log.newValue}>
                        + {log.newValue}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                    {log.ipAddress}
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap font-sans">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.result === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : log.result === 'WARNING'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
