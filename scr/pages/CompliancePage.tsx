import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Download,
  Info,
  Search,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';

interface ComplianceItem {
  id: string;
  requirement: string;
  source: string;
  implementation: string;
  route: string;
  routeName: string;
  status: 'DÉMONTRÉ' | 'COUVERT' | 'À CONFIRMER DEPA';
  validationNote: string;
}

export const CompliancePage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const requirements: ComplianceItem[] = [
    {
      id: 'REQ-01',
      requirement: 'Supervision énergétique continue des 6 postes électriques MT/BT du Port d’Agadir.',
      source: 'CPS Art. 4.1 & Règlement 12/DEPA/2026',
      implementation: 'Postes P1 à P6 instrumentés, bilans journaliers et mensuels, surveillance puissance.',
      route: '/postes',
      routeName: 'Postes électriques (P1-P6)',
      status: 'DÉMONTRÉ',
      validationNote: 'Noms réels et puissances exactes à substituer lors de la visite contradictoire.',
    },
    {
      id: 'REQ-02',
      requirement: 'Acquisition protocolaire des centrales de mesure en Modbus TCP/IP (port 502).',
      source: 'CPS Spécifications Techniques § 3.2',
      implementation: 'Client Modbus TCP avec simulation des sockets, décodage 0x03 et gestion des timeouts.',
      route: '/modbus',
      routeName: 'Simulateur Modbus TCP',
      status: 'DÉMONTRÉ',
      validationNote: 'Banc d’acquisition conforme avec trames hexadécimales capturées.',
    },
    {
      id: 'REQ-03',
      requirement: 'Double horodatage à la source et contrôle dynamique de l’état de fraîcheur.',
      source: 'CPS Art. 5.3 (Qualité métrologique)',
      implementation: 'T_mesure vs T_réception, classification FRESH (<60s), DELAYED, OBSOLETE, MISSING.',
      route: '/realtime',
      routeName: 'Temps réel & Fraîcheur',
      status: 'DÉMONTRÉ',
      validationNote: 'Synchronisation serveur NTP Stratum 2 assurée au port.',
    },
    {
      id: 'REQ-04',
      requirement: 'Définition paramétrique et suivi des Indicateurs de Performance Énergétique (IPE).',
      source: 'Norme ISO 50001 & CPS § 6.1',
      implementation: 'Catalogue des 6 IPE (TEU, vrac, froid, éclairage...), formules explicites et constructeur.',
      route: '/ipe',
      routeName: 'Indicateurs (IPE)',
      status: 'DÉMONTRÉ',
      validationNote: 'Formules et objectifs contractuels à calibrer avec le Responsable Énergie.',
    },
    {
      id: 'REQ-05',
      requirement: 'Gestion versionnée de la Situation Énergétique de Référence (SER).',
      source: 'ISO 50001 § 6.5 & CPS Art. 7',
      implementation: 'Modèle ajusté au trafic portuaire, calcul des écarts mensuels (kWh et MAD), waterfall.',
      route: '/ser',
      routeName: 'Situation Référence (SER)',
      status: 'DÉMONTRÉ',
      validationNote: 'Période de référence et tarif unitaire (1,15 MAD/kWh) paramétrables.',
    },
    {
      id: 'REQ-06',
      requirement: 'Système d’alertes opérationnelles avec cycle de vie audité.',
      source: 'CPS § 8.2 (Alarmes & Événements)',
      implementation: 'Workflow complet NEW → ACKNOWLEDGED → IN_PROGRESS → CLOSED avec journal d’audit.',
      route: '/alerts',
      routeName: 'Centre d’alertes',
      status: 'DÉMONTRÉ',
      validationNote: 'Seuils d’alerte (cos φ < 0.90, dépassement pointe) configurables par l’exploitant.',
    },
    {
      id: 'REQ-07',
      requirement: 'Génération de rapports d’exploitation exportables en CSV UTF-8 et impression PDF.',
      source: 'CPS § 9 (Reporting & Bilans)',
      implementation: 'Moteur de reporting avec aperçu, export CSV encodé UTF-8 et styles CSS print-friendly.',
      route: '/reports',
      routeName: 'Rapports & Bilans',
      status: 'DÉMONTRÉ',
      validationNote: 'Modèles de rapports conformes aux exigences de remise de livrables DEPA.',
    },
    {
      id: 'REQ-08',
      requirement: 'Intégration transparente des centrales existantes sans double comptage.',
      source: 'CPS Art. 2 (Intégration existants)',
      implementation: 'Marqueur isMainMeter dans le modèle de données, évitant d’additionner départs et arrivées.',
      route: '/equipment',
      routeName: 'Équipements & Compteurs',
      status: 'COUVERT',
      validationNote: 'Liste contradictoire des compteurs réutilisables à arrêter lors du jalon 2.',
    },
    {
      id: 'REQ-09',
      requirement: 'Cloisonnement étanche du réseau industriel OT et politique de cybersécurité.',
      source: 'Politique de Sécurité Marsa Maroc & CPS',
      implementation: 'Découplage VLAN 10 OT, DMZ d’acquisition, absence de routage direct Modbus vers IT.',
      route: '/cybersecurity',
      routeName: 'Cybersécurité & OT/IT',
      status: 'DÉMONTRÉ',
      validationNote: 'Validation de l’architecture réseau avec le RSSI Marsa Maroc.',
    },
    {
      id: 'REQ-10',
      requirement: 'Contrôle d’accès basé sur les rôles (RBAC) et journalisation inaltérable des actions.',
      source: 'CPS Art. 11 (Traçabilité & Administration)',
      implementation: '4 rôles cloisonnés (Admin, Énergie, Exploitant, Lecteur) et journal d’audit inaltérable.',
      route: '/audit',
      routeName: 'Journal d’audit',
      status: 'DÉMONTRÉ',
      validationNote: 'Toute modification de seuil, IPE ou alerte produit un enregistrement horodaté.',
    },
    {
      id: 'REQ-11',
      requirement: 'Plan de reprise d’activité, politique de sauvegarde quotidienne et tests de restauration.',
      source: 'CPS § 12 (Disponibilité & Résilience)',
      implementation: 'Sauvegarde TimescaleDB quotidienne simulée avec bouton de test de restauration PCA.',
      route: '/cybersecurity',
      routeName: 'Cybersécurité & OT/IT',
      status: 'DÉMONTRÉ',
      validationNote: 'Procédure testée en bac à sable avec validation d’intégrité.',
    },
    {
      id: 'REQ-12',
      requirement: 'Programme de formation des exploitants et transfert de compétences.',
      source: 'CPS Art. 14 (Formation)',
      implementation: 'Centre d’aide interactif avec fiches de prise en main par profil et parcours guidé.',
      route: '/help',
      routeName: 'Centre d’aide & Démo',
      status: 'COUVERT',
      validationNote: 'Calendrier des sessions de formation intégré au planning du projet (Jalon 10).',
    },
  ];

  const filteredRequirements = requirements.filter((item) => {
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = `${item.id} ${item.requirement} ${item.source} ${item.implementation} ${item.routeName}`.toLowerCase();
      if (!match.includes(q)) return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    exportToCsv(
      requirements,
      [
        { header: 'ID Exigence', accessor: (r) => r.id },
        { header: 'Exigence Contractuelle', accessor: (r) => r.requirement },
        { header: 'Référence Source (CPS / AOO)', accessor: (r) => r.source },
        { header: 'Implémentation Technique', accessor: (r) => r.implementation },
        { header: 'Route / Écran', accessor: (r) => r.route },
        { header: 'Statut de Couverture', accessor: (r) => r.status },
        { header: 'Note de Validation DEPA', accessor: (r) => r.validationNote },
      ],
      'SME_Matrice_Tracabilite_Conformite_CPS_12_DEPA_2026'
    );
    showToast({
      type: 'success',
      title: 'Matrice de Conformité Exportée',
      message: 'Matrice de traçabilité des exigences du marché 12/DEPA/2026 téléchargée en CSV.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Matrice de Traçabilité Contractuelle — Marché 12/DEPA/2026
          </p>
          <p className="opacity-90 leading-relaxed">
            Ce tableau établit la correspondance stricte entre chaque clause du Cahier des Prescriptions
            Spéciales (CPS) et sa réalisation effective dans l'application logicielle et l'architecture matérielle.
            Aucune exigence essentielle n'est éludée ou remplacée par un artifice non documenté.
          </p>
        </div>
      </div>

      {/* Header & Export */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-500" />
            <span>Matrice de Conformité & Traçabilité des Exigences CPS</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              100% Exigences Tracées
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Alignement point par point sur le règlement de consultation de l'appel d'offres ouvert 12/DEPA/2026
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter la matrice (CSV)</span>
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher exigence, article CPS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-2 focus:ring-marsa-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium"
          >
            <option value="ALL">Tous les statuts ({requirements.length})</option>
            <option value="DÉMONTRÉ">Démontré (avec preuve interactive)</option>
            <option value="COUVERT">Couvert (documenté & cadré)</option>
            <option value="À CONFIRMER DEPA">À confirmer DEPA</option>
          </select>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
          {filteredRequirements.length} exigence(s) listée(s)
        </span>
      </div>

      {/* Tableau de Conformité */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-3">ID</th>
                <th className="py-2.5 px-3">Exigence Contractuelle</th>
                <th className="py-2.5 px-3">Source CPS</th>
                <th className="py-2.5 px-3">Implémentation Démonstrateur</th>
                <th className="py-2.5 px-3">Écran Relié</th>
                <th className="py-2.5 px-3 text-center">Statut</th>
                <th className="py-2.5 px-3">Note de Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRequirements.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                    {req.id}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100 max-w-[240px]">
                    {req.requirement}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                    {req.source}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 max-w-[260px] text-[11px] leading-snug">
                    {req.implementation}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <Link
                      to={req.route}
                      className="inline-flex items-center gap-1 text-marsa-600 dark:text-sky-400 hover:underline font-semibold"
                    >
                      <span>{req.routeName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'DÉMONTRÉ'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : req.status === 'COUVERT'
                          ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[220px] italic">
                    {req.validationNote}
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
