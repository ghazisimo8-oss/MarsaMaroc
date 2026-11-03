import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Download,
  Eye,
  Check,
  UserCheck,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { alertService } from '../services/alertService';
import { Alert, AlertPriority, AlertStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { exportToCsv } from '../lib/exportUtils';
import { DEMO_SUBSTATIONS } from '../data/demo/substationsData';

export const AlertsPage: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>(alertService.getAlerts());
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE'); // ACTIVE, ALL, NEW, ACKNOWLEDGED, IN_PROGRESS, CLOSED
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [substationFilter, setSubstationFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Commentaire modal
  const [actionComment, setActionComment] = useState<string>('');
  const [assigneeName, setAssigneeName] = useState<string>('Équipe Maintenance Électrique DEPA');

  useEffect(() => {
    const unsubscribe = alertService.subscribe(() => {
      const updated = alertService.getAlerts();
      setAlerts(updated);
      if (selectedAlert) {
        const found = updated.find((a) => a.id === selectedAlert.id);
        if (found) setSelectedAlert(found);
      }
    });
    return unsubscribe;
  }, [selectedAlert]);

  const filteredAlerts = alerts.filter((alert) => {
    if (statusFilter === 'ACTIVE' && alert.status === 'CLOSED') return false;
    if (statusFilter !== 'ACTIVE' && statusFilter !== 'ALL' && alert.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && alert.priority !== priorityFilter) return false;
    if (substationFilter !== 'ALL' && alert.substationId !== substationFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchText = `${alert.code} ${alert.title} ${alert.substationName} ${alert.description}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const handleAcknowledge = (alert: Alert) => {
    if (!hasPermission('ACKNOWLEDGE_ALERTS')) {
      showToast({
        type: 'error',
        title: 'Permission Insuffisante (RBAC)',
        message: 'Votre profil utilisateur ne dispose pas du privilège d’acquittement.',
      });
      return;
    }
    const success = alertService.acknowledgeAlert(alert.id, currentUser, actionComment);
    if (success) {
      setActionComment('');
      showToast({
        type: 'success',
        title: 'Alerte Acquittée',
        message: `L’alerte ${alert.code} a été acquittée par ${currentUser.fullName}.`,
      });
    }
  };

  const handleSetInProgress = (alert: Alert) => {
    if (!hasPermission('ACKNOWLEDGE_ALERTS')) {
      showToast({
        type: 'error',
        title: 'Permission Insuffisante',
        message: 'Votre profil utilisateur ne dispose pas de l’autorisation nécessaire.',
      });
      return;
    }
    const success = alertService.setInProgress(alert.id, currentUser, assigneeName, actionComment);
    if (success) {
      setActionComment('');
      showToast({
        type: 'info',
        title: 'Prise en Charge Enregistrée',
        message: `L’alerte ${alert.code} est assignée à : ${assigneeName}.`,
      });
    }
  };

  const handleClose = (alert: Alert) => {
    if (!hasPermission('CLOSE_ALERTS')) {
      showToast({
        type: 'error',
        title: 'Privilège Requis',
        message: 'Seul un Administrateur ou Responsable Énergie peut clôturer définitivement une alerte.',
      });
      return;
    }
    const success = alertService.closeAlert(alert.id, currentUser, actionComment);
    if (success) {
      setActionComment('');
      showToast({
        type: 'success',
        title: 'Alerte Clôturée',
        message: `L’incident ${alert.code} a été résolu et archivé dans le journal d’audit.`,
      });
    }
  };

  const handleExportCsv = () => {
    exportToCsv(
      filteredAlerts,
      [
        { header: 'Code', accessor: (a) => a.code },
        { header: 'Titre', accessor: (a) => a.title },
        { header: 'Priorité', accessor: (a) => a.priority },
        { header: 'Statut', accessor: (a) => a.status },
        { header: 'Poste', accessor: (a) => a.substationName },
        { header: 'Valeur Déclencheur', accessor: (a) => a.triggerValue },
        { header: 'Seuil Paramétré', accessor: (a) => a.thresholdValue },
        { header: 'Date Détection', accessor: (a) => a.createdAt },
        { header: 'Acquitté Par', accessor: (a) => a.acknowledgedBy || 'N/A' },
        { header: 'Assigné À', accessor: (a) => a.assignee || 'Non assigné' },
        { header: 'Date Clôture', accessor: (a) => a.closedAt || 'Active' },
      ],
      'SME_Journal_Alertes_Marsa_Maroc'
    );
    showToast({
      type: 'success',
      title: 'Export Alertes Réussi',
      message: `${filteredAlerts.length} alertes exportées en format CSV UTF-8.`,
    });
  };

  const priorityStyles: Record<AlertPriority, { bg: string; text: string; border: string }> = {
    CRITICAL: { bg: 'bg-rose-100 dark:bg-rose-950/80', text: 'text-rose-800 dark:text-rose-200', border: 'border-rose-300 dark:border-rose-800' },
    HIGH: { bg: 'bg-orange-100 dark:bg-orange-950/80', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-300 dark:border-orange-800' },
    MEDIUM: { bg: 'bg-amber-100 dark:bg-amber-950/80', text: 'text-amber-800 dark:text-amber-200', border: 'border-amber-300 dark:border-amber-800' },
    LOW: { bg: 'bg-sky-100 dark:bg-sky-950/80', text: 'text-sky-800 dark:text-sky-200', border: 'border-sky-300 dark:border-sky-800' },
    INFO: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-800 dark:text-slate-200', border: 'border-slate-300 dark:border-slate-700' },
  };

  const statusStyles: Record<AlertStatus, { bg: string; text: string }> = {
    NEW: { bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300', text: 'Nouvelle' },
    ACKNOWLEDGED: { bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300', text: 'Acquittée' },
    IN_PROGRESS: { bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300', text: 'En traitement' },
    CLOSED: { bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300', text: 'Clôturée' },
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-500 animate-pulse" />
            <span>Centre Opérationnel de Gestion des Alertes</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              {alerts.filter((a) => a.status !== 'CLOSED').length} actives
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Traçabilité du cycle de vie complet : Détection → Acquittement → Prise en charge → Clôture
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Barre de filtres et recherche */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Recherche */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher alerte, poste..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-marsa-500"
            />
          </div>

          {/* Filtre Statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="ACTIVE">Alertes Actives uniquement</option>
            <option value="ALL">Tous les statuts (avec clôturées)</option>
            <option value="NEW">Nouvelles</option>
            <option value="ACKNOWLEDGED">Acquittées</option>
            <option value="IN_PROGRESS">En traitement</option>
            <option value="CLOSED">Clôturées</option>
          </select>

          {/* Filtre Criticité */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="ALL">Toutes criticités</option>
            <option value="CRITICAL">Critique</option>
            <option value="HIGH">Haute</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="LOW">Faible</option>
            <option value="INFO">Information</option>
          </select>

          {/* Filtre Poste */}
          <select
            value={substationFilter}
            onChange={(e) => setSubstationFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="ALL">Tous les postes</option>
            {DEMO_SUBSTATIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code}
              </option>
            ))}
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredAlerts.length} alerte(s) affichée(s)
        </span>
      </div>

      {/* Grille principale : Liste des alertes + Panneau de détail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Liste tabulaire */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Criticité</th>
                  <th className="py-2.5 px-3">Alerte</th>
                  <th className="py-2.5 px-3">Poste</th>
                  <th className="py-2.5 px-3">Mesure / Seuil</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      Aucune alerte correspondant aux critères sélectionnés.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => {
                    const pStyle = priorityStyles[alert.priority];
                    const sStyle = statusStyles[alert.status];
                    const isSelected = selectedAlert?.id === alert.id;

                    return (
                      <tr
                        key={alert.id}
                        onClick={() => setSelectedAlert(alert)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-50/70 dark:bg-sky-950/40'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${pStyle.bg} ${pStyle.text} ${pStyle.border}`}
                          >
                            {alert.priority}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{alert.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{alert.code}</span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                          {alert.substationId}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                          <span className="font-bold text-rose-600 dark:text-rose-400">
                            {alert.triggerValue}
                          </span>
                          <span className="text-slate-400 text-[10px] ml-1">/ {alert.thresholdValue}</span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${sStyle.bg}`}
                          >
                            {sStyle.text}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAlert(alert);
                            }}
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                            title="Voir détail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Colonne droite (1/3) : Panneau de Détail & Workflow Opérateur */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-4 flex flex-col justify-between">
          {selectedAlert ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block">{selectedAlert.code}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {selectedAlert.title}
                  </h3>
                  <span className="text-xs text-marsa-600 dark:text-marsa-400 font-semibold">
                    {selectedAlert.substationName}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    priorityStyles[selectedAlert.priority].bg
                  } ${priorityStyles[selectedAlert.priority].text}`}
                >
                  {selectedAlert.priority}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700/60">
                {selectedAlert.description}
              </p>

              {/* Métriques déclencheur */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Valeur relevée</span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                    {selectedAlert.triggerValue}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Seuil d'alerte</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 text-sm">
                    {selectedAlert.thresholdValue}
                  </span>
                </div>
              </div>

              {/* État du cycle et Assignation */}
              <div className="text-xs space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Statut actuel :</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {statusStyles[selectedAlert.status].text}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date de détection :</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {new Date(selectedAlert.createdAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
                {selectedAlert.assignee && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigné à :</span>
                    <span className="font-semibold text-sky-600 dark:text-sky-400">{selectedAlert.assignee}</span>
                  </div>
                )}
              </div>

              {/* Timeline d'audit des événements */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  Historique des Actions
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedAlert.events.map((evt) => (
                    <div
                      key={evt.id}
                      className="text-[11px] bg-slate-50 dark:bg-slate-800/60 p-2 rounded border border-slate-100 dark:border-slate-700/60"
                    >
                      <div className="flex items-center justify-between text-slate-500 text-[10px]">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{evt.action}</span>
                        <span>{new Date(evt.timestamp).toLocaleTimeString('fr-FR')}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5">{evt.comment}</p>
                      <span className="text-[10px] text-slate-400 italic">Par : {evt.userName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zone d'action de l'opérateur */}
              {selectedAlert.status !== 'CLOSED' && (
                <div className="space-y-2.5 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Commentaire d'intervention
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Disjoncteur vérifié, consigne transmise..."
                      value={actionComment}
                      onChange={(e) => setActionComment(e.target.value)}
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    {selectedAlert.status === 'NEW' && (
                      <button
                        onClick={() => handleAcknowledge(selectedAlert)}
                        className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Acquitter l'Alerte</span>
                      </button>
                    )}

                    {(selectedAlert.status === 'NEW' || selectedAlert.status === 'ACKNOWLEDGED') && (
                      <button
                        onClick={() => handleSetInProgress(selectedAlert)}
                        className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Prendre en charge (En cours)</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleClose(selectedAlert)}
                      className="w-full text-xs font-semibold py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Clôturer Définitivement</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ShieldAlert className="w-8 h-8 mx-auto opacity-40 text-slate-500" />
              <p className="text-xs">Sélectionnez une alerte dans la liste pour consulter ses détails et réaliser une action.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
