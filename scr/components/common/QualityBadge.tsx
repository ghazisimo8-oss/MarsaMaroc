import React from 'react';
import { DataQuality } from '../../types';

interface QualityBadgeProps {
  quality: DataQuality;
  showLabel?: boolean;
}

export const QualityBadge: React.FC<QualityBadgeProps> = ({ quality, showLabel = true }) => {
  const configs: Record<DataQuality, { label: string; bg: string; text: string; dot: string }> = {
    GOOD: {
      label: 'Conforme (GOOD)',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    ESTIMATED: {
      label: 'Estimée (ESTIMATED)',
      bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
    STALE: {
      label: 'Fermée / Figée (STALE)',
      bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    INVALID: {
      label: 'Invalide (INVALID)',
      bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
    COMM_ERROR: {
      label: 'Erreur Com (COMM_ERROR)',
      bg: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      dot: 'bg-red-600 animate-ping',
    },
    MISSING: {
      label: 'Absente (MISSING)',
      bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      text: 'text-slate-600 dark:text-slate-400',
      dot: 'bg-slate-400',
    },
  };

  const c = configs[quality] || configs.MISSING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${c.bg} ${c.text}`}
      title={`Qualité de mesure : ${c.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {showLabel && <span>{c.label}</span>}
    </span>
  );
};
