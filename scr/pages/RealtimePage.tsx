import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Pause,
  RefreshCw,
  Cpu,
  Clock,
  Gauge,
  Zap,
  Radio,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { DEMO_SUBSTATIONS } from '../data/demo/substationsData';
import { DEMO_METERS } from '../data/demo/metersData';
import { QualityBadge } from '../components/common/QualityBadge';
import { FreshnessIndicator } from '../components/common/FreshnessIndicator';
import { FreshnessState, ElectricalPost } from '../types';
import { useToast } from '../context/ToastContext';

export const RealtimePage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [intervalSec, setIntervalSec] = useState<number>(3);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);
  const [substations, setSubstations] = useState<ElectricalPost[]>(DEMO_SUBSTATIONS);
  const [tick, setTick] = useState(0);
  const { showToast } = useToast();

  // Compteur de secondes depuis la dernière mise à jour
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdate.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdate]);

  // Boucle de rafraîchissement simulée
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setLastUpdate(new Date());
      setSecondsAgo(0);

      // Simulation déterministe avec micro-fluctuations physiques réalistes
      setSubstations((prev) =>
        prev.map((sub, idx) => {
          if (sub.status === 'COMM_LOST') return sub; // Poste en panne réseau démo

          const noiseP = Math.sin((tick + idx * 4) * 0.5) * 4.5;
          const noiseV = Math.cos((tick + idx) * 0.3) * 0.8;
          const noiseI = Math.sin((tick + idx) * 0.4) * 3.2;

          const activeP = Math.round((sub.activePowerKw + noiseP) * 10) / 10;
          const reactiveQ = Math.round((sub.reactivePowerKvar + noiseP * 0.3) * 10) / 10;
          const apparentS = Math.round(Math.sqrt(activeP * activeP + reactiveQ * reactiveQ) * 10) / 10;
          const pf = Math.min(1.0, Math.round((activeP / apparentS) * 1000) / 1000);

          return {
            ...sub,
            activePowerKw: activeP,
            reactivePowerKvar: reactiveQ,
            apparentPowerKva: apparentS,
            powerFactor: pf,
            voltageV: Math.round((400 + noiseV) * 10) / 10,
            currentA: Math.round((sub.currentA + noiseI) * 10) / 10,
            frequencyHz: Math.round((50.0 + Math.sin(tick * 0.1) * 0.03) * 100) / 100,
            lastCommunication: new Date().toISOString(),
          };
        })
      );
    }, intervalSec * 1000);

    return () => clearInterval(interval);
  }, [isRunning, intervalSec, tick]);

  const handleManualRefresh = () => {
    setTick((t) => t + 1);
    setLastUpdate(new Date());
    setSecondsAgo(0);
    showToast({
      type: 'info',
      title: 'Scrutation Modbus Manuelle',
      message: 'Trame d’interrogation envoyée aux 18 centrales de mesure.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Barre de contrôle du temps réel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Flux de Télé-mesure Quasi Temps Réel</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isRunning
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {isRunning ? 'EN ACQUISITION CONTINUE' : 'EN PAUSE'}
            </span>
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Dernière lecture :{' '}
              <strong className="text-slate-700 dark:text-slate-300 font-mono">
                {lastUpdate.toLocaleTimeString('fr-FR')}
              </strong>{' '}
              (il y a {secondsAgo} s)
            </span>
            <span>•</span>
            <span>Cadence : {intervalSec} s</span>
          </div>
        </div>

        {/* Commandes Play/Pause & Cadence */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
            {[1, 3, 5, 15].map((sec) => (
              <button
                key={sec}
                onClick={() => setIntervalSec(sec)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  intervalSec === sec
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> <span>Reprendre</span>
              </>
            )}
          </button>

          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
            title="Forcer une lecture immédiate"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-500" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Règle d'or de métrologie : fraîcheur explicite */}
      <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 rounded-lg p-3 text-xs text-sky-900 dark:text-sky-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-600 flex-shrink-0" />
          <span>
            <strong>Contrôle de fraîcheur métrologique :</strong> Chaque valeur est qualifiée en temps réel.
            Une donnée de plus de 60 s est signalée « Retardée » ou « Obsolète » pour éviter toute mauvaise interprétation d’un registre figé.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono">
          <span className="text-emerald-700 dark:text-emerald-300">● &lt;60s Fraîche</span>
          <span className="text-amber-700 dark:text-amber-300">● 1-5m Retardée</span>
          <span className="text-rose-700 dark:text-rose-300">● &gt;5m Obsolète</span>
        </div>
      </div>

      {/* Cartes en direct des 6 Postes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {substations.map((post) => {
          const isCommLost = post.status === 'COMM_LOST';
          const freshness: FreshnessState = isCommLost ? 'OBSOLETE' : 'FRESH';

          return (
            <div
              key={post.id}
              className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm transition-all ${
                isCommLost
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Header carte poste */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-marsa-600 dark:text-marsa-400">
                      {post.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {post.name.split('—')[1] || post.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{post.category}</div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <QualityBadge quality={isCommLost ? 'COMM_ERROR' : 'GOOD'} showLabel={false} />
                  <FreshnessIndicator freshness={freshness} showDetails={false} />
                </div>
              </div>

              {/* Indicateurs en direct */}
              <div className="mt-4 space-y-3">
                {/* Puissance Active & Réactive */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Puissance P</div>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                      {isCommLost ? '—' : `${post.activePowerKw} kW`}
                    </div>
                    <div className="text-[10px] text-slate-500">Active triphasée</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase">Puissance Q</div>
                    <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                      {isCommLost ? '—' : `${post.reactivePowerKvar} kvar`}
                    </div>
                    <div className="text-[10px] text-slate-500">Réactive inductive</div>
                  </div>
                </div>

                {/* Grandeurs électriques fondamentales */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-850">
                    <span className="text-[10px] text-slate-400 block">Tension U</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isCommLost ? '—' : `${post.voltageV} V`}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-850">
                    <span className="text-[10px] text-slate-400 block">Courant I</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isCommLost ? '—' : `${post.currentA} A`}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-850">
                    <span className="text-[10px] text-slate-400 block">cos φ</span>
                    <span
                      className={`font-bold ${
                        post.powerFactor < 0.9 ? 'text-amber-600 font-extrabold' : 'text-emerald-600'
                      }`}
                    >
                      {isCommLost ? '—' : post.powerFactor.toFixed(3)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    Fréq : {isCommLost ? '—' : `${post.frequencyHz} Hz`}
                  </span>
                  <span className="font-mono text-[10px]">
                    {post.metersCount} compteurs • {isCommLost ? 'Timeout 3000ms' : '14 ms'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
