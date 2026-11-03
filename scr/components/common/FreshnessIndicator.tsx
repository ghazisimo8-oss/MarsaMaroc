import React from 'react';
import { FreshnessState } from '../../types';
import { Clock, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface FreshnessIndicatorProps {
  freshness: FreshnessState;
  timestamp?: string;
  showDetails?: boolean;
}

export const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({
  freshness,
  timestamp,
  showDetails = true,
}) => {
  const configs: Record<
    FreshnessState,
    { label: string; textClass: string; icon: React.FC<{ className?: string }> }
  > = {
    FRESH: {
      label: 'Donnée fraîche (< 60 s)',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      icon: CheckCircle2,
    },
    DELAYED: {
      label: 'Retardée (1 à 5 min)',
      textClass: 'text-amber-600 dark:text-amber-400',
      icon: Clock,
    },
    OBSOLETE: {
      label: 'Obsolète (> 5 min)',
      textClass: 'text-rose-600 dark:text-rose-400',
      icon: AlertTriangle,
    },
    MISSING: {
      label: 'Non reçue / Absente',
      textClass: 'text-slate-400',
      icon: AlertOctagon,
    },
  };

  const c = configs[freshness] || configs.MISSING;
  const IconComponent = c.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${c.textClass}`}>
      <IconComponent className="w-3.5 h-3.5 flex-shrink-0" />
      {showDetails && (
        <span className="truncate">
          {c.label}
          {timestamp && (
            <span className="text-[10px] text-slate-400 ml-1 font-mono">
              ({new Date(timestamp).toLocaleTimeString('fr-FR')})
            </span>
          )}
        </span>
      )}
    </div>
  );
};
