import React from 'react';
import { Calendar } from 'lucide-react';

export type DatePeriod = 'TODAY' | '7D' | '30D' | 'MONTH' | 'YEAR';

interface DateRangeFilterProps {
  selectedPeriod: DatePeriod;
  onSelectPeriod: (period: DatePeriod) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedPeriod,
  onSelectPeriod,
}) => {
  const periods: Array<{ id: DatePeriod; label: string }> = [
    { id: 'TODAY', label: 'Aujourd’hui' },
    { id: '7D', label: '7 jours' },
    { id: '30D', label: '30 jours' },
    { id: 'MONTH', label: 'Ce mois' },
    { id: 'YEAR', label: 'Année 2026' },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
      <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
      {periods.map((p) => {
        const isSelected = selectedPeriod === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelectPeriod(p.id)}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              isSelected
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
};
