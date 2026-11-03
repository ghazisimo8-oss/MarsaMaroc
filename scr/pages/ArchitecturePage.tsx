import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Radio,
  Server,
  Database,
  Calculator,
  Monitor,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Download,
} from 'lucide-react';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';

interface ArchitectureLayer {
  id: number;
  code: string;
  name: string;
  category: string;
  icon: any;
  color: string;
  role: string;
  components: string[];
  inputs: string[];
  outputs: string[];
  risks: string[];
  mitigations: string[];
}

export const ArchitecturePage: React.FC = () => {
  const { showToast } = useToast();

  const layers: ArchitectureLayer[] = [
    {
      id: 1,
      code: 'LAYER-01-FIELD',
      name: '1. Terrain, Capteurs & Instrumentation',
      category: 'INFRASTRUCTURE PHYSIQUE MT/BT',
      icon: Cpu,
      color: 'from-amber-500 to-orange-600',
      role: 'Captation métrologique continue des grandeurs physiques (tensions, courants, puissances, énergies, cos φ) sur les 6 postes du Port d’Agadir.',
      components: [
        'Centrales de mesure communicantes neuves (type PM8000 / PAC3200)',
        'Intégration des centrales existantes sans remplacement physique',
        'Transformateurs de courant ouvrants (TI classe 0.5s)',
        'Cellules de protection et fusibles MT/BT sous tableau TGBT',
      ],
      inputs: ['Lignes MT 22 kV et départs BT 400V triphasé', 'Courants primaires et tensions de réseau'],
      outputs: ['Signaux analogiques transformés', 'Registres Modbus holding 3000-3026'],
      risks: ['Saturation thermique des tores TI', 'Dérive métrologique', 'Perturbations électromagnétiques'],
      mitigations: ['TI classe de précision 0.5s certifiés', 'Câbles blindés torsadés avec mise à la terre équipotentielle'],
    },
    {
      id: 2,
      code: 'LAYER-02-COMM',
      name: '2. Communication & Réseau Industriel OT',
      category: 'TÉLÉCOMMUNICATIONS PORTUAIRES',
      icon: Radio,
      color: 'from-sky-500 to-blue-600',
      role: 'Acheminement sécurisé, déterministe et isolé des trames protocolaires vers le concentrateur d’acquisition.',
      components: [
        'VLAN dédié OT (VLAN 10 Acquisition, VLAN 20 Supervision)',
        'Switches Ethernet industriels administrables durcis (température -20°C / +70°C)',
        'Passerelles de conversion Modbus RTU (série RS-485) vers Modbus TCP/IP',
        'Liaisons fibres optiques inter-postes et liaisons cuivre Cat 6A blindées S/FTP',
      ],
      inputs: ['Trames série Modbus RTU', 'Paquets IP bruts des postes P1 à P6'],
      outputs: ['Trames encapsulées Modbus TCP (Port 502)', 'Flux keepalive et ping'],
      risks: ['Tempête de broadcast', 'Coupure de câble fibre portuaire', 'Intrusion non autorisée sur l’anneau'],
      mitigations: ['Protocole anneau redondant RSTP / MRP (reprise < 20 ms)', 'Filtrage strict par adresses MAC'],
    },
    {
      id: 3,
      code: 'LAYER-03-INGEST',
      name: '3. Moteur d’Acquisition & Ingestion',
      category: 'LOGICIEL DE COLLECTE',
      icon: Server,
      color: 'from-emerald-500 to-teal-600',
      role: 'Ordonnancement cyclique des interrogations Modbus, qualification de fraîcheur métrologique et double horodatage.',
      components: [
        'Service d’acquisition multi-threadé non bloquant',
        'Client Modbus TCP MBAP conforme RFC 793',
        'File d’attente tampon mémoire résiliente aux coupures réseau temporaires',
        'Moteur d’attribution de l’étiquette de qualité (GOOD, STALE, COMM_ERROR...)',
      ],
      inputs: ['Réponses des 18 compteurs Modbus', 'Horloge temps réel synchronisée NTP'],
      outputs: ['Enregistrements métrologiques horodatés à la source', 'Événements de timeout d’acquisition'],
      risks: ['Surcharge CPU lors de rafales de scrutation', 'Perte de trames en cas de micro-coupure'],
      mitigations: ['Scrutation cadencée par groupes de postes', 'Buffer local persistant avec rattrapage automatique'],
    },
    {
      id: 4,
      code: 'LAYER-04-DATA',
      name: '4. Stockage & Base de Données Temporelle',
      category: 'PERSISTANCE & HISTORISATION',
      icon: Database,
      color: 'from-indigo-500 to-purple-600',
      role: 'Conservation inaltérable des séries temporelles, des bilans énergétiques journaliers et du journal d’audit.',
      components: [
        'Base de données relationnelle & séries temporelles (TimescaleDB / PostgreSQL)',
        'Partitionnement automatique des tables par mois',
        'Stockage froid pour archivage réglementaire supérieur à 5 ans',
        'Politique de purge et de compression des index historiques',
      ],
      inputs: ['Mesures validées issues du service d’acquisition', 'Traces d’audit d’exploitation'],
      outputs: ['Index consolidés (15 min, heure, jour, mois)', 'Exports CSV et rapports d’audit'],
      risks: ['Saturation de l’espace disque', 'Corruption de base de données en cas de panne de courant'],
      mitigations: ['Sauvegarde quotidienne automatisée', 'Onduleur secouru UPS dans la baie serveur DEPA'],
    },
    {
      id: 5,
      code: 'LAYER-05-ENERGY',
      name: '5. Moteur Métier & Intelligence Énergétique',
      category: 'ANALYTIQUE & ISO 50001',
      icon: Calculator,
      color: 'from-violet-500 to-fuchsia-600',
      role: 'Calcul automatisé des indicateurs (IPE), comparaison avec la trajectoire SER et détection des anomalies causales.',
      components: [
        'Moteur de calcul sans formule magique cachée (lib/energyCalculations)',
        'Comparateur dynamique de la baseline SER ISO 50001 avec ajustement activité portuaire',
        'Générateur d’alertes multi-seuils (puissance, facteur de puissance, communication)',
        'Moteur d’insights automatiques déterministe (sans dépendance IA externe)',
      ],
      inputs: ['Séries temporelles d’énergie active et réactive', 'Données d’activité (escales, TEU, vrac)'],
      outputs: ['Ratios IPE calculés', 'Écarts SER en kWh et en MAD', 'Alertes opérationnelles qualifiées'],
      risks: ['Double comptage des départs secondaires', 'Biais de modèle SER'],
      mitigations: ['Balisage strict isMainMeter dans le modèle métier', 'Versionnage auditable des baselines SER'],
    },
    {
      id: 6,
      code: 'LAYER-06-UI',
      name: '6. Restitution, Dashboard & Vues Mobiles',
      category: 'APPLICATION WEB D’EXPLOITATION',
      icon: Monitor,
      color: 'from-cyan-500 to-sky-600',
      role: 'Visualisation intuitive, réactive et ergonomique accessible sur postes de supervision et tablettes de terrain.',
      components: [
        'Application Web Single Page Application (React, TypeScript, Tailwind CSS)',
        'Composants de data-visualisation interactive (Recharts)',
        'Synoptique interactif des 6 postes électriques du Port d’Agadir',
        'Module d’export certifié (CSV UTF-8 et impression PDF vectorielle)',
      ],
      inputs: ['API métier et flux de télémesure temps réel', 'Actions et requêtes de l’exploitant'],
      outputs: ['Tableaux de bord graphiques', 'Fiches de postes', 'Bilans énergétiques certifiés'],
      risks: ['Lenteur d’affichage sur grands volumes', 'Affichage de données périmées comme temps réel'],
      mitigations: ['Indicateur de fraîcheur visuel obligatoire', 'Agrégation côté client optimisée'],
    },
    {
      id: 7,
      code: 'LAYER-07-SEC',
      name: '7. Cybersécurité, RBAC & Gouvernance',
      category: 'SÉCURITÉ & AUDITABILITÉ',
      icon: ShieldCheck,
      color: 'from-rose-500 to-red-600',
      role: 'Cloisonnement étanche entre réseau de terrain OT et réseau bureautique IT, contrôle des habilitations et traçabilité.',
      components: [
        'Contrôle d’accès basé sur les rôles (RBAC à 4 profils)',
        'Pare-feu d’inspection d’état (Stateful Firewall) avec coupure des flux non autorisés',
        'Journal d’audit inaltérable consignant toute action sensible',
        'Chiffrement des flux web en HTTPS (TLS 1.3)',
      ],
      inputs: ['Tentatives de connexion', 'Modifications de paramètres, seuils et configurations'],
      outputs: ['Événements d’audit horodatés', 'Blocage immédiat des accès non autorisés'],
      risks: ['Attaque par rebond IT vers OT', 'Usurpation d’identité ou modification non tracée de seuil'],
      mitigations: ['Découplage strict OT/IT sans routage direct', 'Audit systématique de toute intervention'],
    },
  ];

  const [selectedLayer, setSelectedLayer] = useState<ArchitectureLayer>(layers[0]);

  const handleExportArchitecture = () => {
    exportToCsv(
      layers,
      [
        { header: 'Niveau', accessor: (l) => l.name },
        { header: 'Catégorie', accessor: (l) => l.category },
        { header: 'Rôle Fonctionnel', accessor: (l) => l.role },
        { header: 'Composants Principaux', accessor: (l) => l.components.join(' ; ') },
        { header: 'Données Entrantes', accessor: (l) => l.inputs.join(' ; ') },
        { header: 'Données Sortantes', accessor: (l) => l.outputs.join(' ; ') },
        { header: 'Risques Identifiés', accessor: (l) => l.risks.join(' ; ') },
        { header: 'Contrôles & Mesures', accessor: (l) => l.mitigations.join(' ; ') },
      ],
      'SME_Architecture_Systeme_Marsa_Maroc'
    );
    showToast({
      type: 'success',
      title: 'Export Réussi',
      message: 'Dossier d’Architecture Technique synthétique exporté en CSV.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Dossier d'Architecture Technique (DAT) — Démonstration Portuaire (À valider DEPA)
          </p>
          <p className="opacity-90 leading-relaxed">
            L'architecture logicielle et matérielle en 7 couches ci-dessous formalise les choix techniques retenus
            pour garantir la robustesse industrielle, le découplage étanche entre automatismes de quai (OT)
            et système d'information de gestion (IT), et l'évolutivité vers d'autres terminaux du port.
          </p>
        </div>
      </div>

      {/* Header & Export */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-500" />
            <span>Architecture Système en 7 Couches Logiques</span>
          </h2>
          <p className="text-xs text-slate-500">
            Du capteur physique en cellule MT jusqu’au centre de décision énergétique de la direction
          </p>
        </div>

        <button
          onClick={handleExportArchitecture}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exporter le DAT (CSV)</span>
        </button>
      </div>

      {/* Grille : Sélecteur des couches (Gauche) + Détail approfondi de la couche active (Droite) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Colonne Gauche (5/12) : Piles architecturales interactives */}
        <div className="lg:col-span-5 space-y-2">
          {layers.map((layer) => {
            const isSelected = selectedLayer.id === layer.id;
            const Icon = layer.icon;

            return (
              <div
                key={layer.id}
                onClick={() => setSelectedLayer(layer)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-600 shadow-md ring-1 ring-sky-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${layer.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                      {layer.category}
                    </span>
                    <h3
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-sky-700 dark:text-sky-300' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {layer.name}
                    </h3>
                  </div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    isSelected ? 'transform translate-x-1 text-sky-600' : ''
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Colonne Droite (7/12) : Fiche d'Analyse Détaillée de la Couche */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {selectedLayer.code}
              </span>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                {selectedLayer.category}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              {selectedLayer.name}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-700/60">
              {selectedLayer.role}
            </p>
          </div>

          {/* Composants matériels & logiciels */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sky-500" />
              Composants Matériels & Logiciels Embarqués
            </h4>
            <ul className="space-y-1.5">
              {selectedLayer.components.map((comp, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2 bg-slate-50/50 dark:bg-slate-800/40 p-2 rounded"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{comp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Flux Entrants / Sortants */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-700/60 space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] block">
                Données Entrantes (Inputs)
              </span>
              {selectedLayer.inputs.map((inp, idx) => (
                <div key={idx} className="text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                  <span className="text-sky-500">→</span>
                  <span>{inp}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-700/60 space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] block">
                Données Sortantes (Outputs)
              </span>
              {selectedLayer.outputs.map((out, idx) => (
                <div key={idx} className="text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                  <span className="text-emerald-500">←</span>
                  <span>{out}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risques et mesures d'atténuation */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Analyse des Risques & Mesures de Résilience
            </h4>

            <div className="space-y-2 text-xs">
              {selectedLayer.risks.map((risk, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                    <span>{risk}</span>
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded">
                    Parade : {selectedLayer.mitigations[idx] || selectedLayer.mitigations[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
