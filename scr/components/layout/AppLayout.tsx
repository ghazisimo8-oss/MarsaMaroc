import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MandatoryDisclaimerBanner } from '../common/MandatoryDisclaimerBanner';
import { GlobalSearchModal } from '../common/GlobalSearchModal';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('sme_marsa_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sme_marsa_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sme_marsa_theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Bannière réglementaire obligatoire */}
      <MandatoryDisclaimerBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        {/* Zone Principale */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Topbar
            onOpenMobileSidebar={() => setMobileOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
          />

          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>

          {/* Footer légal d'exploitation */}
          <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Marsa Maroc — Direction d’Exploitation au Port d’Agadir (DEPA)
              </span>
              <span>•</span>
              <span>Système de Monitoring Énergétique (SME)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px]">Réf. Marché : 12/DEPA/2026</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Système opérationnel" />
            </div>
          </footer>
        </div>
      </div>

      {/* Modal recherche globale Ctrl+K */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
