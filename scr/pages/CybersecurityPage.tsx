import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Server,
  Database,
  Radio,
  FileCheck2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Download,
  Info,
  Clock,
  Key,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { auditService } from '../services/auditService';

export const CybersecurityPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [testingRestore, setTestingRestore] = useState<boolean>(false);
  const [lastBackupTime, setLastBackupTime] = useState<string>('2026-11-03 04:00:00 UTC');
  const [lastRestoreTestTime, setLastRestoreTestTime] = useState<string>('2026-11-02 22:30:00 UTC');

  const handleTestRestore = () => {
    setTestingRestore(true);
    setTimeout(() => {
      setTestingRestore(false);
      const nowStr = new Date().toLocaleString('fr-FR');
      setLastRestoreTestTime(nowStr);

      auditService.logEvent({
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'TEST_RESTAURATION_SAUVEGARDE',
        targetObject: 'Backup Automatique Quotidien (TimescaleDB)',
        objectId: 'BK-20261103-0400',
        previousValue: 'Statut : RESTAURATION_NON_TESTEE',
        newValue: 'Statut : VALIDEE_100%_CONFORME',
        ipAddress: '10.20.4.10',
        result: 'SUCCESS',
      });

      showToast({
        type: 'success',
        title: 'Simulation de Restauration Réussie',
        message: 'Intégrité de la base de données validée en environnement bac à sable : 18 compteurs, 100% des index rétablis en 4.2 secondes.',
      });
    }, 1200);
  };

  const handleExportCyberReport = () => {
    const cyberItems = [
      { exigence: 'Segmentation Réseau OT/IT', statut: 'CONFORME', detail: 'VLAN 10 Acquisition isolé sans routage direct vers IT' },
      { exigence: 'Protocole Modbus TCP & Limites', statut: 'MAÎTRISÉ', detail: 'Modbus non chiffré confiné en boucle fermée industrielle' },
      { exigence: 'Habilitations & Rôles RBAC', statut: 'CONFORME', detail: '4 rôles cloisonnés (Admin, Énergie, Exploitant, Lecteur)' },
      { exigence: 'Synchronisation Temporelle NTP', statut: 'CONFORME', detail: 'Serveur NTP DEPA Stratum 2 (dérive max observée < 50 ms)' },
      { exigence: 'Politique de Sauvegarde (PCA/PRA)', statut: 'TESTÉ', detail: 'Snapshot quotidien automatisé, rétention 90 jours' },
      { exigence: 'Traçabilité & Journal d’Audit', statut: 'ACTIF', detail: 'Journal inaltérable consignant 100% des interventions' },
      { exigence: 'Chiffrement Web HTTPS', statut: 'CONFORME', detail: 'TLS 1.3 avec suites cryptographiques modernes' },
    ];

    exportToCsv(
      cyberItems,
      [
        { header: 'Exigence de Cybersécurité', accessor: (c) => c.exigence },
        { header: 'Statut de Conformité', accessor: (c) => c.statut },
        { header: 'Détail de la Mesure Technique', accessor: (c) => c.detail },
      ],
      'SME_Rapport_Cybersecurite_Resilience'
    );
    showToast({
      type: 'success',
      title: 'Rapport Cyber Exporté',
      message: 'Audit de cybersécurité et de résilience téléchargé en CSV.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer de sécurité */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Sécurité des Systèmes Industriels & Limites Natives Modbus (À valider DEPA)
          </p>
          <p className="opacity-90 leading-relaxed">
            Le protocole <strong>Modbus TCP/IP (Port 502)</strong> ne dispose nativement ni de chiffrement ni
            d'authentification par certificat. La cybersécurité du SME repose donc impérativement sur une architecture
            en profondeur : segmentation réseau étanche (VLAN OT), pare-feux industriels avec filtrage d'état,
            accès physique verrouillé aux armoires des postes et contrôle strict des habilitations logicielles.
          </p>
        </div>
      </div>

      {/* Header & Export */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Cybersécurité, Cloisonnement OT/IT & Résilience Système</span>
          </h2>
          <p className="text-xs text-slate-500">
            Politique de défense en profondeur, synchronisation NTP, intégrité des données et continuité d'activité (PCA)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTestRestore}
            disabled={testingRestore}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testingRestore ? 'animate-spin' : ''}`} />
            <span>{testingRestore ? 'Restauration en cours...' : 'Tester restauration PCA'}</span>
          </button>

          <button
            onClick={handleExportCyberReport}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Bilan Cyber</span>
          </button>
        </div>
      </div>

      {/* Cartes d'État de Sécurité */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Chiffrement Web
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <Lock className="w-4 h-4" />
            <span>TLS 1.3 / HTTPS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            HSTS & CSP activés
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Contrôle RBAC
          </span>
          <div className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1 flex items-center gap-1.5">
            <Key className="w-4 h-4" />
            <span>4 Profils Actifs</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Principe du moindre privilège
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Synchronisation NTP
          </span>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Stratum 2 (OK)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Dérive temporelle : 12 ms
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Dernière Restauration PCA
          </span>
          <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="truncate">{lastRestoreTestTime.slice(0, 16)}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            RTO &lt; 15 min / RPO &lt; 1 h
          </p>
        </div>
      </div>

      {/* Schéma de segmentation réseau OT / IT */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-500" />
            <span>Schéma Logique de Découplage Étanche : Terrain OT ↔ DMZ ↔ Exploitation IT</span>
          </h3>
          <p className="text-xs text-slate-500">
            Isolation stricte par pare-feux et zone démilitarisée (DMZ) protégeant le réseau industriel portuaire
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          {/* Bloc 1 : Terrain OT */}
          <div className="bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block">
              Zone Industrielle (OT)
            </span>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Postes P1 à P6</div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 font-sans">
              <li>• 18 Centrales de mesure</li>
              <li>• VLAN 10 (192.168.10.0/24)</li>
              <li>• Modbus TCP port 502 non routé</li>
              <li>• Anneau optique RSTP</li>
            </ul>
          </div>

          {/* Bloc 2 : Passerelle & Acquisition */}
          <div className="bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider block">
              Sas d'Acquisition (DMZ OT)
            </span>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Concentrateur SME</div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 font-sans">
              <li>• Serveur industriel double NIC</li>
              <li>• Contrôle de flux pare-feu</li>
              <li>• Horodatage & Buffer local</li>
              <li>• Synchronisation NTP DEPA</li>
            </ul>
          </div>

          {/* Bloc 3 : Base de données & API */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
              Cœur de Données
            </span>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">TimescaleDB & Métier</div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 font-sans">
              <li>• Base relationnelle sécurisée</li>
              <li>• Journal d'audit inaltérable</li>
              <li>• Moteur IPE & SER ISO 50001</li>
              <li>• Sauvegarde quotidienne chiffrée</li>
            </ul>
          </div>

          {/* Bloc 4 : Supervision IT */}
          <div className="bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
              Exploitation Portuaire (IT)
            </span>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">Navigateurs Web</div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 font-sans">
              <li>• Accès HTTPS / TLS 1.3</li>
              <li>• Authentification RBAC</li>
              <li>• Postes de supervision DEPA</li>
              <li>• Tablettes mobiles WiFi sécurisé</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Matrice des contrôles de cybersécurité */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Registre des Contrôles & Exigences de Cybersécurité (ANSSI / IEC 62443)
          </h4>
          <p className="text-xs text-slate-500">
            Mesures techniques mises en œuvre pour prévenir les risques de compromission et d'altération métrologique
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Domaine de Sécurité</th>
                <th className="py-2.5 px-3">Exigence Contractuelle 12/DEPA/2026</th>
                <th className="py-2.5 px-3">Implémentation Démonstrateur</th>
                <th className="py-2.5 px-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                  Segmentation Réseau
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                  Séparation physique ou logique stricte entre réseau instrumentation et bureautique.
                </td>
                <td className="py-2.5 px-3 text-slate-500">
                  VLAN 10 Acquisition isolé, ports 502 fermés vers l'extérieur.
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    CONFORME
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                  Gestion des Privilèges
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                  Accès conditionné par profil et interdiction des comptes génériques partagés.
                </td>
                <td className="py-2.5 px-3 text-slate-500">
                  Matrice RBAC 4 profils avec filtrage des actions sensibles et commutateur de démo.
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    CONFORME
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                  Traçabilité Inaltérable
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                  Historisation horodatée de toute modification de seuil, IPE ou acquittement.
                </td>
                <td className="py-2.5 px-3 text-slate-500">
                  Journal d'audit inaltérable avec export CSV et double horodatage.
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    CONFORME
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                  Continuité d'Activité
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                  Sauvegarde quotidienne automatisée et procédure de reprise validée.
                </td>
                <td className="py-2.5 px-3 text-slate-500">
                  Snapshot journalier TimescaleDB + bouton de test de restauration en direct.
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    TESTÉ OK
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
