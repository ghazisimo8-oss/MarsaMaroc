import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Zap,
  LineChart,
  Gauge,
  TrendingDown,
  Bell,
  FileSpreadsheet,
  CheckCircle,
  Cpu,
  Layers,
  ShieldCheck,
  CheckSquare,
  FileCheck2,
  CalendarDays,
  History,
  Users,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Anchor,
} from 'lucide-react';
import { alertService } from '../../services/alertService';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const activeAlertsCount = alertService.getActiveAlertsCount();

  const navigationGroups = [
    {
      groupTitle: 'SUPERVISION ÉNERGÉTIQUE',
      items: [
        { name: 'Tableau de bord', to: '/', icon: LayoutDashboard },
        { name: 'Temps réel & Fraîcheur', to: '/realtime', icon: Activity },
        { name: 'Postes électriques (P1-P6)', to: '/postes', icon: Zap },
        { name: 'Historique & Courbes', to: '/history', icon: LineChart },
      ],
    },
    {
      groupTitle: 'MANAGEMENT ISO 50001',
      items: [
        { name: 'Indicateurs (IPE)', to: '/ipe', icon: Gauge },
        { name: 'Situation Référence (SER)', to: '/ser', icon: TrendingDown },
        {
          name: 'Centre d’alertes',
          to: '/alerts',
          icon: Bell,
          badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
          badgeColor: 'bg-rose-500 text-white',
        },
        { name: 'Rapports & Bilans', to: '/reports', icon: FileSpreadsheet },
        { name: 'Qualité des données', to: '/quality', icon: CheckCircle },
      ],
    },
    {
      groupTitle: 'ACQUISITION & TECHNIQUE',
      items: [
        { name: 'Équipements & Compteurs', to: '/equipment', icon: Cpu },
        { name: 'Simulateur Modbus TCP', to: '/modbus', icon: Activity },
        { name: 'Architecture Système', to: '/architecture', icon: Layers },
        { name: 'Cybersécurité & OT/IT', to: '/cybersecurity', icon: ShieldCheck },
      ],
    },
    {
      groupTitle: 'PROJET, CONFORMITÉ & GOUVERNANCE',
      items: [
        { name: 'Recette (T01 à T15)', to: '/tests', icon: CheckSquare },
        { name: 'Conformité CPS (12/DEPA)', to: '/compliance', icon: FileCheck2 },
        { name: 'Méthodologie & Gantt', to: '/project', icon: CalendarDays },
        { name: 'Journal d’audit', to: '/audit', icon: History },
        { name: 'Utilisateurs & RBAC', to: '/users', icon: Users },
        { name: 'Centre d’aide & Démo', to: '/help', icon: HelpCircle },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 select-none">
      {/* Header Logo */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-950">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-marsa-500 to-sky-700 flex items-center justify-center flex-shrink-0 shadow-md">
            <Anchor className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-sm text-white tracking-wide">MARSA MAROC</span>
              <span className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase">
                SME PORT D’AGADIR
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Développer la barre latérale' : 'Réduire la barre latérale'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx}>
            {!collapsed && (
              <div className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                {group.groupTitle}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    title={collapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-marsa-600 text-white shadow-sm shadow-marsa-900/50'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                      } ${collapsed ? 'justify-center px-2' : ''}`
                    }
                  >
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    {!collapsed && <span className="flex-1 truncate">{item.name}</span>}
                    {!collapsed && item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          item.badgeColor || 'bg-sky-500 text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[10px] text-slate-500">
        {!collapsed ? (
          <div>
            <div className="font-semibold text-slate-400">Marché 12/DEPA/2026</div>
            <div className="text-[9px] text-amber-500 font-medium">Démo validable DEPA</div>
          </div>
        ) : (
          <div className="text-center font-mono text-[9px] text-slate-400">12/26</div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:block h-screen flex-shrink-0 transition-all duration-200 z-30 sticky top-0 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-sm md:hidden animate-in fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 md:hidden transform transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
