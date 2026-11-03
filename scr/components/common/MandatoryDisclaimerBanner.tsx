import React from 'react';
import { AlertCircle } from 'lucide-react';

export const MandatoryDisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="font-medium tracking-wide">
          <strong className="font-semibold">DÉMONSTRATION INDUSTRIELLE — RÉF. 12/DEPA/2026 :</strong> Les grandeurs, compteurs, registres et baselines sont des valeurs de démonstration représentatives à valider contradictoirement avec la Direction d’Exploitation au Port d’Agadir (DEPA).
        </span>
      </div>
    </div>
  );
};
