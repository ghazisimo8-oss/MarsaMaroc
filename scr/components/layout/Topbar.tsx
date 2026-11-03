import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { alertService } from '../../services/alertService';
import { UserRole } from '../../types';

interface TopbarProps {
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileSidebar,
  onOpenSearch,
  darkMode,
  onToggleDarkMode,
}) => {
  const { currentUser, switchRole, allUsers } = useAuth();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const activeAlerts = alertService.getAlerts().filter((a) => a.status !== 'CLOSED');

  // Breadcrumbs title mapping
  const routeTitles: Record<string, string> = {
    '/': 'Tableau de Bord Énergétique Exécutif',
    '/realtime': 'Supervision Temps Réel & Qualité de Flux',
    '/postes': 'Postes Électriques MT/BT (P1 à P6)',
    '/history': 'Historiques & Analyse Multi-Critères',
    '/ipe': 'Indicateurs de Performance Énergétique (IPE)',
    '/ser': 'Situation Énergétique de Référence (SER ISO 50001)',
    '/alerts': 'Centre Opérationnel de Gestion des Alertes',
    '/reports': 'Génération de Rapports & Bilans Énergétiques',
    '/quality': 'Qualification Métrologique & Qualité des Données',
    '/equipment': 'Inventaire des Équipements & Compteurs',
    '/modbus': 'Banc d’Acquisition & Simulateur Modbus TCP/IP',
    '/architecture': 'Architecture Système & Découplage OT/IT',
    '/cybersecurity': 'Cybersécurité, Sauvegardes & Résilience',
    '/tests': 'Plan de Tests de Recette Contractuelle (T01 à T15)',
    '/compliance': 'Matrice de Traçabilité & Conformité CPS 12/DEPA',
    '/project': 'Méthodologie Projet & Planning de Déploiement (Gantt)',
    '/audit': 'Journal d’Audit Inaltérable & Traçabilité Opérations',
    '/users': 'Gestion des Utilisateurs & Habilitations RBAC',
    '/help': 'Centre d’Aide, Visite Guidée & Documentation Démo',
  };

  const currentTitle = routeTitles[location.pathname] || 'Poste Électrique';

  const roleLabels: Record<UserRole, { label: string; badgeClass: string }> = {
    ADMIN: { label: 'Admin Technique', badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
    ENERGY_MANAGER: { label: 'Resp. Énergie', badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    OPERATOR: { label: 'Exploitant MT/BT', badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' },
    READER: { label: 'Auditeur / Lecteur', badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hamburger & Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span>SME Port d’Agadir</span>
              <span>/</span>
              <span className="text-marsa-600 dark:text-marsa-400 font-semibold truncate">
                {currentTitle}
              </span>
            </div>
            <h1 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {currentTitle}
            </h1>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Global search trigger */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Rechercher...</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-slate-500">
              Ctrl+K
            </kbd>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                setProfileDropdownOpen(false);
              }}
              className="relative p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Centre de notifications"
            >
              <Bell className="w-4 h-4" />
              {activeAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 text-xs z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    Notifications ({activeAlerts.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Temps réel</span>
                </div>
                {activeAlerts.length === 0 ? (
                  <div className="py-4 text-center text-slate-400 flex flex-col items-center gap-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <span>Aucune alerte active</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {activeAlerts.slice(0, 4).map((alt) => (
                      <div
                        key={alt.id}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <span className="truncate">{alt.title}</span>
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">{alt.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RBAC Role Switcher & Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileDropdownOpen(!profileDropdownOpen);
                setNotifDropdownOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-marsa-600 text-white font-bold text-[10px] flex items-center justify-center">
                {currentUser.avatarInitials}
              </div>
              <div className="hidden lg:flex flex-col text-left leading-tight">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {roleLabels[currentUser.role]?.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 text-xs z-50 animate-in fade-in">
                <div className="pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{currentUser.fullName}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                  <div className="mt-1">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        roleLabels[currentUser.role]?.badgeClass
                      }`}
                    >
                      {currentUser.roleTitle}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-sky-500" />
                  Changer de rôle (Simulation Démo)
                </div>

                <div className="space-y-1">
                  {allUsers.map((u) => {
                    const isSelected = u.role === currentUser.role;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchRole(u.role);
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-marsa-50 dark:bg-marsa-950/60 text-marsa-700 dark:text-marsa-300 font-medium border border-marsa-200 dark:border-marsa-800'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{u.fullName}</div>
                          <div className="text-[10px] text-slate-500">{roleLabels[u.role]?.label}</div>
                        </div>
                        {isSelected && <UserCheck className="w-4 h-4 text-marsa-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
