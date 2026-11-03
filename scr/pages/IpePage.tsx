import React, { useState } from 'react';
import {
  Gauge,
  Plus,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Info,
  Layers,
  Edit3,
  Calendar,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { DEMO_IPES } from '../data/demo/ipeData';
import { DEMO_SUBSTATIONS } from '../data/demo/substationsData';
import { EnergyIndicator } from '../types';
import { exportToCsv } from '../lib/exportUtils';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { auditService } from '../services/auditService';

export const IpePage: React.FC = () => {
  const { hasPermission, currentUser } = useAuth();
  const { showToast } = useToast();
  const [ipes, setIpes] = useState<EnergyIndicator[]>(DEMO_IPES);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showBuilderModal, setShowBuilderModal] = useState<boolean>(false);

  // Formulaire constructeur IPE
  const [builderForm, setBuilderForm] = useState({
    code: 'IPE-NEW-01',
    name: 'Nouvel Indicateur d’Efficacité',
    description: 'Suivi spécifique du ratio de consommation portuaire.',
    numerator: 'E_active_P1 + E_active_P2',
    denominator: 'Nombre_Navires_Escale',
    unit: 'kWh / Escale',
    targetValue: 850,
    currentValue: 812,
    substationScope: 'P1, P2',
    category: 'OPERATIONAL' as const,
  });

  const filteredIpes = ipes.filter((ipe) =>
    selectedCategory === 'ALL' ? true : ipe.category === selectedCategory
  );

  const handleExportCsv = () => {
    exportToCsv(
      ipes,
      [
        { header: 'Code IPE', accessor: (i) => i.code },
        { header: 'Désignation', accessor: (i) => i.name },
        { header: 'Formule de Calcul', accessor: (i) => i.formula },
        { header: 'Valeur Cible', accessor: (i) => i.targetValue },
        { header: 'Valeur Actuelle', accessor: (i) => i.currentValue },
        { header: 'Unité', accessor: (i) => i.unit },
        { header: 'Écart Historique (%)', accessor: (i) => i.historicalDeltaPercent },
        { header: 'Périmètre Postes', accessor: (i) => i.substationScope },
        { header: 'Catégorie', accessor: (i) => i.category },
        { header: 'Statut', accessor: (i) => i.status },
        { header: 'Version Référentiel', accessor: (i) => i.version },
        { header: 'Date d’Effet', accessor: (i) => i.effectiveDate },
        { header: 'Dernière Révision Par', accessor: (i) => i.updatedBy },
      ],
      'SME_Catalogue_IPE_ISO50001'
    );
    showToast({
      type: 'success',
      title: 'Export Répertoire IPE',
      message: 'Catalogue des indicateurs de performance exporté en CSV.',
    });
  };

  const handleCreateIpe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('MANAGE_IPE')) {
      showToast({
        type: 'error',
        title: 'Action Restreinte (RBAC)',
        message: 'Votre profil ne dispose pas du privilège MANAGE_IPE. Seul le Responsable Énergie ou l’Admin peut modifier les IPE.',
      });
      return;
    }

    const newIpe: EnergyIndicator = {
      id: `IPE-${Date.now().toString().slice(-3)}`,
      code: builderForm.code,
      name: builderForm.name,
      description: builderForm.description,
      formula: `(${builderForm.numerator}) / ${builderForm.denominator}`,
      unit: builderForm.unit,
      targetValue: Number(builderForm.targetValue),
      currentValue: Number(builderForm.currentValue),
      historicalDeltaPercent: Math.round(((builderForm.currentValue - builderForm.targetValue) / builderForm.targetValue) * 1000) / 10,
      substationScope: builderForm.substationScope,
      category: builderForm.category,
      status: builderForm.currentValue <= builderForm.targetValue ? 'OPTIMAL' : 'WARNING',
      version: 'v1.0-draft',
      effectiveDate: new Date().toISOString().slice(0, 10),
      updatedBy: currentUser.fullName,
    };

    setIpes([newIpe, ...ipes]);
    setShowBuilderModal(false);

    auditService.logEvent({
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: 'CREATION_NOUVEL_IPE',
      targetObject: 'Référentiel IPE ISO 50001',
      objectId: newIpe.code,
      newValue: `Formule: ${newIpe.formula} | Cible: ${newIpe.targetValue} ${newIpe.unit}`,
      ipAddress: '10.20.4.15',
      result: 'SUCCESS',
    });

    showToast({
      type: 'success',
      title: 'Indicateur Créé & Journalisé',
      message: `L’IPE ${newIpe.code} a été ajouté au référentiel énergétique.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer officiel */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-900 dark:text-amber-200">
          <p className="font-semibold uppercase tracking-wider mb-0.5">
            Référentiel d'Indicateurs — Données de Démonstration à valider DEPA
          </p>
          <p className="opacity-90 leading-relaxed">
            Les formules, facteurs d'activité (TEU, tonnes de vrac, volumes frigorifiques) et valeurs cibles
            sont fournis à titre d'illustration technique du moteur d'analyse. Ils seront calibrés contradictoirement
            lors de la phase d'ingénierie préliminaire avec le Responsable Énergie du Port d'Agadir.
          </p>
        </div>
      </div>

      {/* Header & Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-emerald-500" />
            <span>Indicateurs de Performance Énergétique (IPE — ISO 50001)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Suivi des ratios d'intensité énergétique unitaire par processus opérationnel portuaire
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-marsa-500"
          >
            <option value="ALL">Toutes les catégories ({ipes.length})</option>
            <option value="GLOBAL">Indicateurs Globaux</option>
            <option value="PORT_EQUIPMENT">Équipements & Manutention</option>
            <option value="OPERATIONAL">Exploitation Portuaire</option>
            <option value="SPECIFIC">Infrastructures Spécifiques</option>
          </select>

          <button
            onClick={() => setShowBuilderModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Créer un IPE</span>
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

      {/* Cartes des IPEs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIpes.map((ipe) => {
          const isFavorable = ipe.currentValue <= ipe.targetValue;
          return (
            <div
              key={ipe.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header IPE */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-marsa-600 dark:text-marsa-400 bg-marsa-50 dark:bg-marsa-950/60 px-2 py-0.5 rounded">
                      {ipe.code}
                    </span>
                    <span className="ml-2 text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {ipe.version}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      ipe.status === 'OPTIMAL'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : ipe.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {ipe.status === 'OPTIMAL' && <CheckCircle2 className="w-3 h-3" />}
                    {ipe.status === 'WARNING' && <AlertTriangle className="w-3 h-3" />}
                    <span>{ipe.status}</span>
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">
                  {ipe.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {ipe.description}
                </p>

                {/* Formule explicite (règle 14 AGENTS.md : pas de formule magique cachée) */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60 mb-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Calculator className="w-3 h-3 text-sky-500" />
                      Formule de calcul
                    </span>
                    <span className="font-mono">Périmètre : {ipe.substationScope}</span>
                  </div>
                  <code className="block font-mono text-[11px] text-marsa-700 dark:text-sky-300 font-semibold truncate">
                    {ipe.formula}
                  </code>
                </div>

                {/* Valeurs Cible vs Réalisé */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Valeur Actuelle</span>
                    <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                      {ipe.currentValue} <span className="text-[10px] font-normal text-slate-500">{ipe.unit}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Objectif Cible</span>
                    <div className="text-base font-bold font-mono text-slate-600 dark:text-slate-300 mt-0.5">
                      {ipe.targetValue} <span className="text-[10px] font-normal text-slate-500">{ipe.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Écart & Tendance */}
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-500">Écart vs historique :</span>
                  <span
                    className={`font-semibold font-mono flex items-center gap-1 ${
                      isFavorable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isFavorable ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    <span>{ipe.historicalDeltaPercent > 0 ? `+${ipe.historicalDeltaPercent}` : ipe.historicalDeltaPercent}%</span>
                  </span>
                </div>
              </div>

              {/* Footer de métadonnées de version */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Effet : {ipe.effectiveDate}</span>
                <span className="truncate max-w-[140px]" title={ipe.updatedBy}>
                  Par : {ipe.updatedBy.split(' ')[0]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Constructeur d'IPE Modal */}
      {showBuilderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Constructeur d'Indicateur IPE
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Définition paramétrique ISO 50001 (Démonstration)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBuilderModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIpe} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Code de l'indicateur
                </label>
                <input
                  type="text"
                  value={builderForm.code}
                  onChange={(e) => setBuilderForm({ ...builderForm, code: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Désignation complète
                </label>
                <input
                  type="text"
                  value={builderForm.name}
                  onChange={(e) => setBuilderForm({ ...builderForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Grandeur Énergétique (Numérateur)
                  </label>
                  <input
                    type="text"
                    value={builderForm.numerator}
                    onChange={(e) => setBuilderForm({ ...builderForm, numerator: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Facteur d'Activité (Dénominateur)
                  </label>
                  <input
                    type="text"
                    value={builderForm.denominator}
                    onChange={(e) => setBuilderForm({ ...builderForm, denominator: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Unité IPE
                  </label>
                  <input
                    type="text"
                    value={builderForm.unit}
                    onChange={(e) => setBuilderForm({ ...builderForm, unit: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Valeur Cible
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={builderForm.targetValue}
                    onChange={(e) => setBuilderForm({ ...builderForm, targetValue: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Périmètre
                  </label>
                  <select
                    value={builderForm.substationScope}
                    onChange={(e) => setBuilderForm({ ...builderForm, substationScope: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="ALL">Tous les postes</option>
                    <option value="P1">Poste P1</option>
                    <option value="P2">Poste P2</option>
                    <option value="P3">Poste P3</option>
                    <option value="P4">Poste P4</option>
                    <option value="P5">Poste P5</option>
                    <option value="P6">Poste P6</option>
                    <option value="P1, P2">Postes P1 + P2</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                <span className="font-semibold text-slate-600 dark:text-slate-300">Aperçu Formule résultante :</span>
                <code className="block mt-1 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ({builderForm.numerator}) / {builderForm.denominator} [{builderForm.unit}]
                </code>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBuilderModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enregistrer l'indicateur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
