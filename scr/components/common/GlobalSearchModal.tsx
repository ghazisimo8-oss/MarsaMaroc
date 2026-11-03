import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Zap, Cpu, Bell, FileText, Gauge, ShieldAlert } from 'lucide-react';
import { DEMO_SUBSTATIONS } from '../../data/demo/substationsData';
import { DEMO_METERS } from '../../data/demo/metersData';
import { DEMO_IPES } from '../../data/demo/ipeData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered by parent state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const filteredSubstations = DEMO_SUBSTATIONS.filter(
    (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  );

  const filteredMeters = DEMO_METERS.filter(
    (m) => m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q) || m.ipAddress.includes(q)
  );

  const filteredIpes = DEMO_IPES.filter(
    (i) => i.code.toLowerCase().includes(q) || i.name.toLowerCase().includes(q)
  );

  const handleSelect = (route: string) => {
    onClose();
    setQuery('');
    navigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Barre de recherche */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Rechercher un poste (P1..P6), un compteur, une alerte, un IPE..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-mono hover:bg-slate-200"
          >
            ÉCHAP
          </button>
        </div>

        {/* Résultats */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Postes */}
          {filteredSubstations.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-1 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-sky-500" /> Postes Électriques
              </div>
              <div className="space-y-1">
                {filteredSubstations.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(`/postes/${s.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.description}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                      {s.activePowerKw} kW
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compteurs */}
          {filteredMeters.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-1 flex items-center gap-1.5">
                <Cpu className="w-3 h-3 text-emerald-500" /> Compteurs & Points de Mesure
              </div>
              <div className="space-y-1">
                {filteredMeters.slice(0, 5).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelect(`/equipment`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{m.name}</div>
                      <div className="text-[11px] text-slate-500">{m.manufacturer} • {m.ipAddress}:{m.port}</div>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{m.code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* IPE */}
          {filteredIpes.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-1 flex items-center gap-1.5">
                <Gauge className="w-3 h-3 text-amber-500" /> Indicateurs de Performance (IPE)
              </div>
              <div className="space-y-1">
                {filteredIpes.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => handleSelect(`/ipe`)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
                  >
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{i.name}</div>
                      <div className="text-[11px] text-slate-500">{i.formula}</div>
                    </div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {i.currentValue} {i.unit}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Raccourcis directs */}
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-1">
              Modules & Vues Rapides
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleSelect('/alerts')}
                className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <Bell className="w-3.5 h-3.5 text-rose-500" /> Centre d’alertes
              </button>
              <button
                onClick={() => handleSelect('/modbus')}
                className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <Cpu className="w-3.5 h-3.5 text-sky-500" /> Banc Modbus TCP/IP
              </button>
              <button
                onClick={() => handleSelect('/tests')}
                className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" /> Recette T01 à T15
              </button>
              <button
                onClick={() => handleSelect('/reports')}
                className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-500" /> Rapports & Bilans
              </button>
            </div>
          </div>
        </div>

        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-[11px] text-slate-500">
          <span>Conseil : utilisez les touches fléchées ou la souris pour naviguer</span>
          <span className="font-mono">Réf. 12/DEPA/2026</span>
        </div>
      </div>
    </div>
  );
};
