import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  BookOpen,
  Compass,
  Zap,
  Gauge,
  TrendingDown,
  Bell,
  Cpu,
  ShieldCheck,
  CheckSquare,
  FileSpreadsheet,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';

export const HelpCenterPage: React.FC = () => {
  const [activeTourStep, setActiveTourStep] = useState<number>(0);

  const tourSteps = [
    {
      title: '1. Tableau de Bord Exécutif',
      route: '/',
      description: 'Vue d’ensemble immédiate consolidée sur les 6 postes du Port d’Agadir. Suivez la puissance active, les pointes de consommation, le cosinus phi global et l’écart en temps réel par rapport à la baseline SER.',
      tip: 'Utilisez le filtre de période pour basculer instantanément de la vue journalière à l’exercice mensuel.',
    },
    {
      title: '2. Télémesure & Fraîcheur Métrologique',
      route: '/realtime',
      description: 'Supervision quasi temps réel des flux de scrutation Modbus. Chaque mesure dispose d’un statut de fraîcheur (FRESH, DELAYED, OBSOLETE) calculé à la seconde près.',
      tip: 'Une donnée ancienne n’est jamais affichée comme temps réel : le système qualifie explicitement sa latence.',
    },
    {
      title: '3. Banc Modbus TCP & Injection de Pannes',
      route: '/modbus',
      description: 'Simulateur protocolaire complet permettant d’interroger les Holding Registers (0x03), d’analyser les trames hexadécimales MBAP et de tester le comportement du SME lors d’une coupure réseau (timeout 3000 ms).',
      tip: 'Cliquez sur "Simuler coupure réseau" pour observer la réaction immédiate du système et la levée d’alerte.',
    },
    {
      title: '4. Management Énergétique ISO 50001 (IPE & SER)',
      route: '/ser',
      description: 'Suivi de la performance énergétique par rapport à la Situation Énergétique de Référence (SER) et ratios d’activité (kWh/TEU, kWh/tonne de vrac). Évaluation des gains financiers en dirhams marocains (MAD).',
      tip: 'Aucune formule magique cachée : le constructeur d’IPE affiche l’expression mathématique complète.',
    },
    {
      title: '5. Recette Contractuelle & Matrice de Conformité',
      route: '/tests',
      description: 'Validation contradictoire des 15 fiches d’essais contractuels (T01 à T15) et matrice de traçabilité point par point vis-à-vis du CPS du marché 12/DEPA/2026.',
      tip: 'Cliquez sur "Exécuter" sur n’importe quelle fiche pour consigner un résultat probant dans le journal d’audit.',
    },
  ];

  const faqItems = [
    {
      q: 'Pourquoi les postes sont-ils désignés P1 à P6 au lieu de leurs noms réels ?',
      a: 'Conformément aux instructions permanentes du projet et au respect de la confidentialité des installations stratégiques portuaires de Marsa Maroc, les dénominations officielles exactes et puissances contractuelles seront validées contradictoirement lors de la visite technique sur site.',
    },
    {
      q: 'Comment le système prévient-il le double comptage de l’énergie ?',
      a: 'Chaque point de mesure est typé (Arrivée principale, Départ, Sous-compteur). Seuls les compteurs marqués isMainMeter sont sommés dans le bilan global du port, ce qui évite d’additionner les départs aux arrivées principales.',
    },
    {
      q: 'Que se passe-t-il si un compteur ne répond plus sur le réseau Modbus ?',
      a: 'Après 3 tentatives consécutives sans réponse (timeout 3000 ms), le compteur bascule au statut COMM_ERROR, une alerte opérationnelle prioritaire est levée dans le centre d’alertes et l’incident est tracé dans le journal d’audit.',
    },
    {
      q: 'Comment tester les différentes habilitations utilisateur (RBAC) ?',
      a: 'Rendez-vous sur la page "Utilisateurs & RBAC" ou cliquez sur le sélecteur de profil en haut à droite. Vous pouvez endosser les rôles d’Administrateur, Responsable Énergie, Exploitant ou Lecteur pour vérifier la restriction dynamique des actions.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Centre d'Aide, Guide de Prise en Main & Documentation Démonstrateur
          </p>
          <p className="opacity-90 leading-relaxed">
            Ce centre de ressources a été conçu pour guider la commission de recette et les exploitants de la DEPA
            à travers les fonctionnalités du SME Marsa Maroc (Marché 12/DEPA/2026).
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-500" />
            <span>Centre d'Aide & Parcours Démonstratif Guidé</span>
          </h2>
          <p className="text-xs text-slate-500">
            Guide pas-à-pas pour la démonstration devant la commission technique de Marsa Maroc
          </p>
        </div>
      </div>

      {/* Parcours Démonstratif Interactif */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Parcours de Démonstration Recommandé (5 Étapes Clés)
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            Étape {activeTourStep + 1} / {tourSteps.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {tourSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTourStep(idx)}
              className={`p-3 rounded-lg border text-left text-xs transition-all ${
                activeTourStep === idx
                  ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-600 font-bold text-sky-800 dark:text-sky-200 shadow-sm'
                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <span className="text-[10px] block opacity-70 mb-0.5">Étape {idx + 1}</span>
              <span className="line-clamp-1">{step.title.split('. ')[1]}</span>
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {tourSteps[activeTourStep].title}
            </h4>
            <Link
              to={tourSteps[activeTourStep].route}
              className="text-xs font-semibold text-marsa-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Accéder directement à l’écran</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {tourSteps[activeTourStep].description}
          </p>

          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span><strong>Conseil de présentation :</strong> {tourSteps[activeTourStep].tip}</span>
          </div>
        </div>
      </div>

      {/* Foire Aux Questions (FAQ) & Architecture */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-500" />
          <span>Questions Fréquentes & Réponses Méthodologiques</span>
        </h3>

        <div className="space-y-3">
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50/40 dark:bg-slate-800/30 space-y-1.5"
            >
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {item.q}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Glossaire des Termes Techniques Normalisés */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Glossaire Technique & Métrologique Portuaire
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700">
            <span className="font-bold font-mono text-sky-600 dark:text-sky-400 block mb-1">
              TEU / EVP
            </span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px]">
              Twenty-foot Equivalent Unit (Équivalent Vingt Pieds) : unité de mesure standard des flux de conteneurs traités aux portiques STS.
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700">
            <span className="font-bold font-mono text-sky-600 dark:text-sky-400 block mb-1">
              Facteur de Puissance (cos φ)
            </span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px]">
              Rapport entre la puissance active (kW) et la puissance apparente (kVA). Doit rester ≥ 0,90 sous peine de pénalités de réactif ONEE.
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700">
            <span className="font-bold font-mono text-sky-600 dark:text-sky-400 block mb-1">
              Modbus MBAP
            </span>
            <span className="text-slate-600 dark:text-slate-300 text-[11px]">
              En-tête de 7 octets (Transaction ID, Protocol ID 0x0000, Length, Unit ID) encapsulant les requêtes de lecture de registres Modbus TCP port 502.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
