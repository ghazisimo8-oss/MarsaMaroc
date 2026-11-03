import React from 'react';
import { ArrowUpRight, ArrowDownRight, HelpCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  delta?: {
    valuePercent: number;
    description: string;
    isFavorable?: boolean; // ex: baisse de conso = favorable
  };
  tooltipExplanation?: string;
  drillDownTo?: string;
  drillDownLabel?: string;
  icon?: React.FC<{ className?: string }>;
  accentColor?: 'sky' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'purple';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  unit,
  delta,
  tooltipExplanation,
  drillDownTo,
  drillDownLabel = 'Détails',
  icon: IconComponent,
  accentColor = 'sky',
}) => {
  const accentClasses = {
    sky: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-100 dark:border-sky-900',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-100 dark:border-amber-900',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-100 dark:border-rose-900',
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-100 dark:border-indigo-900',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-100 dark:border-purple-900',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      {/* Top line: title & icon & tooltip */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
            {title}
          </span>
          {tooltipExplanation && (
            <span title={tooltipExplanation} className="cursor-help text-slate-400 hover:text-slate-600">
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
        {IconComponent && (
          <div className={`p-2 rounded-lg border flex-shrink-0 ${accentClasses[accentColor]}`}>
            <IconComponent className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </span>
        {unit && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{unit}</span>}
      </div>

      {/* Delta & Drill-down */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        {delta ? (
          <div className="flex items-center gap-1">
            <span
              className={`flex items-center font-bold text-[11px] ${
                delta.isFavorable
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {delta.valuePercent > 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {delta.valuePercent > 0 ? `+${delta.valuePercent}%` : `${delta.valuePercent}%`}
            </span>
            <span className="text-[10px] text-slate-400 truncate">{delta.description}</span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400">Période courante</span>
        )}

        {drillDownTo && (
          <Link
            to={drillDownTo}
            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-marsa-600 hover:text-marsa-700 dark:text-marsa-400 dark:hover:text-marsa-300 transition-colors"
          >
            <span>{drillDownLabel}</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
};
