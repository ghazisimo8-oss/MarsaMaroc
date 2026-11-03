import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  LayoutGrid,
  List,
  MapPin,
  ArrowRight,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { DEMO_SUBSTATIONS } from '../data/demo/substationsData';
import { QualityBadge } from '../components/common/QualityBadge';
import { exportToCsv } from '../lib/exportUtils';
import { useToast } from '../context/ToastContext';

export const SubstationsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE' | 'SYNOPTIC'>('GRID');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const { showToast } = useToast();

  const categories = [
    'ALL',
    'Quai & Grues',
    'Conteneurs',
    'Silos & Vrac',
    'Terre-plein & Magasins',
    'Ateliers & Bâtiments',
    'Auxiliaires & Éclairage',
  ];

  const filtered = DEMO_SUBSTATIONS.filter((s) =>
    categoryFilter === 'ALL' ? true : s.category === categoryFilter
  );

  const handleExportCsv = () => {
    exportToCsv(
      DEMO_SUBSTATIONS,
      [
        { header: 'ID', accessor: (s) => s.id },
        { header: 'Code', accessor: (s) => s.code },
        { header: 'Désignation', accessor: (s) => s.name },
        { header: 'Catégorie', accessor: (s) => s.category },
        { header: 'Puissance Transfo (kVA)', accessor: (s) => s.transformerPowerKva },
        { header: 'Puissance Active (kW)', accessor: (s) => s.activePowerKw },
        { header: 'Puissance Réactive (kvar)', accessor: (s) => s.reactivePowerKvar },
        { header: 'Facteur de Puissance cos φ', accessor: (s) => s.powerFactor },
        { header: 'Tension (V)', accessor: (s) => s.voltageV },
        { header: 'Courant (A)', accessor: (s) => s.currentA },
        { header: 'Fréquence (Hz)', accessor: (s) => s.frequencyHz },
        { header: 'Conso Jour (kWh)', accessor: (s) => s.dailyConsumptionKwh },
        { header: 'Statut', accessor: (s) => s.status },
        { header: 'Compteurs', accessor: (s) => s.metersCount },
      ],
      'SME_Marsa_Maroc_Postes_Electriques'
    );
    showToast({
      type: 'success',
      title: 'Export Réussi',
      message: 'Liste détaillée des 6 postes téléchargée en CSV.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-500" />
            <span>Postes Électriques MT/BT du Port d’Agadir</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
              6 Postes Démo
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Postes P1 à P6 — Instrumentés pour l’acquisition Modbus TCP/IP et le calcul d’index
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Switch de vue */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setViewMode('GRID')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium ${
                viewMode === 'GRID'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cartes</span>
            </button>
            <button
              onClick={() => setViewMode('SYNOPTIC')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium ${
                viewMode === 'SYNOPTIC'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Synoptique</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium ${
                viewMode === 'TABLE'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tableau</span>
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-marsa-600 hover:bg-marsa-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filtres par Catégorie */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
              categoryFilter === cat
                ? 'bg-marsa-600 text-white font-semibold'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat === 'ALL' ? 'Tous les postes (6)' : cat}
          </button>
        ))}
      </div>

      {/* VUE 1 : SYNOPTIQUE PORTUAIRE INTERACTIF */}
      {viewMode === 'SYNOPTIC' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Synoptique Géographique & Énergétique du Port d’Agadir</span>
              </h3>
              <p className="text-xs text-slate-400">
                Implantation spatiale indicative des 6 postes MT 22 kV le long des bassins et quais
              </p>
            </div>
            <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded">
              Schéma synoptique de démonstration
            </span>
          </div>

          {/* Canvas stylisé du port */}
          <div className="relative h-96 w-full rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
            {/* Lignes d'eau et bassins stylisés */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0,120 Q 300,140 600,100 T 1200,150 L 1200,400 L 0,400 Z" fill="#0284c7" />
              <path d="M 100,0 L 250,220 L 700,220 L 900,0" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" fill="none" />
            </svg>

            {/* Légende du plan */}
            <div className="absolute top-4 left-4 text-[10px] text-slate-400 space-y-0.5 pointer-events-none">
              <div>BASSIN PRINCIPAL — PORT D’AGADIR</div>
              <div className="text-sky-400 font-mono">BOUCLE MT 22 kV RADIALE NORD-SUD</div>
            </div>

            {/* Postes interactifs sur la carte */}
            {filtered.map((post) => (
              <Link
                key={post.id}
                to={`/postes/${post.id}`}
                style={{ left: `${post.coordinates.x}%`, top: `${post.coordinates.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-lg transition-transform group-hover:scale-125 border-2 ${
                      post.status === 'NORMAL'
                        ? 'bg-emerald-600 border-white text-white'
                        : post.status === 'WARNING'
                        ? 'bg-amber-500 border-white text-white'
                        : 'bg-rose-600 border-white text-white animate-bounce'
                    }`}
                  >
                    {post.id}
                  </div>
                  <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-semibold whitespace-nowrap shadow-md group-hover:bg-marsa-600 transition-colors">
                    {post.activePowerKw} kW • cos φ {post.powerFactor.toFixed(2)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* VUE 2 : GRILLE DE CARTES */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => {
            const isWarning = post.status === 'WARNING';
            const isLost = post.status === 'COMM_LOST';

            return (
              <div
                key={post.id}
                className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isLost
                    ? 'border-rose-300 dark:border-rose-900/80 bg-rose-50/10'
                    : isWarning
                    ? 'border-amber-300 dark:border-amber-900/80 bg-amber-50/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-extrabold text-marsa-600 dark:text-marsa-400">
                        {post.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {post.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{post.category}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        post.status === 'NORMAL'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : post.status === 'WARNING'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                    {post.description}
                  </p>

                  {/* 4 Métriques Clés */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                        Puissance Active
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                        {post.activePowerKw} kW
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                        cos φ (Facteur P)
                      </span>
                      <span
                        className={`font-extrabold text-base ${
                          post.powerFactor < 0.9 ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {post.powerFactor.toFixed(3)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                        Conso Aujourd’hui
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">
                        {post.dailyConsumptionKwh.toLocaleString('fr-FR')} kWh
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                        Transfo MT
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100">
                        {post.transformerPowerKva} kVA
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Cpu className="w-3.5 h-3.5 text-sky-500" />
                    <span>{post.metersCount} compteurs Modbus</span>
                  </div>

                  <Link
                    to={`/postes/${post.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-marsa-600 hover:text-marsa-700 dark:text-marsa-400 dark:hover:text-marsa-300"
                  >
                    <span>Détail complet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VUE 3 : TABLEAU DÉTAILLÉ */}
      {viewMode === 'TABLE' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Code / Poste</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Transfo (kVA)</th>
                  <th className="px-4 py-3">P Active (kW)</th>
                  <th className="px-4 py-3">Q Réactive (kvar)</th>
                  <th className="px-4 py-3">cos φ</th>
                  <th className="px-4 py-3">Tension U (V)</th>
                  <th className="px-4 py-3">Conso Jour (kWh)</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      <div className="font-bold text-marsa-600">{post.code}</div>
                      <div className="text-[11px] text-slate-500">{post.name.split('—')[1]}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{post.category}</td>
                    <td className="px-4 py-3 font-mono">{post.transformerPowerKva}</td>
                    <td className="px-4 py-3 font-bold font-mono text-slate-900 dark:text-slate-100">
                      {post.activePowerKw}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                      {post.reactivePowerKvar}
                    </td>
                    <td className="px-4 py-3 font-bold font-mono">
                      <span className={post.powerFactor < 0.9 ? 'text-amber-600' : 'text-emerald-600'}>
                        {post.powerFactor.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{post.voltageV} V</td>
                    <td className="px-4 py-3 font-mono font-semibold">
                      {post.dailyConsumptionKwh.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          post.status === 'NORMAL'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : post.status === 'WARNING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/postes/${post.id}`}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-marsa-600 hover:text-white font-semibold text-[11px] text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        Détails
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
