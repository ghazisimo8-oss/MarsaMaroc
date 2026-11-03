import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages avec Lazy Loading
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const RealtimePage = lazy(() =>
  import('./pages/RealtimePage').then((m) => ({ default: m.RealtimePage }))
);
const SubstationsPage = lazy(() =>
  import('./pages/SubstationsPage').then((m) => ({ default: m.SubstationsPage }))
);
const SubstationDetailPage = lazy(() =>
  import('./pages/SubstationDetailPage').then((m) => ({ default: m.SubstationDetailPage }))
);
const HistoryPage = lazy(() =>
  import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage }))
);
const IpePage = lazy(() =>
  import('./pages/IpePage').then((m) => ({ default: m.IpePage }))
);
const SerPage = lazy(() =>
  import('./pages/SerPage').then((m) => ({ default: m.SerPage }))
);
const AlertsPage = lazy(() =>
  import('./pages/AlertsPage').then((m) => ({ default: m.AlertsPage }))
);
const ReportsPage = lazy(() =>
  import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage }))
);
const QualityPage = lazy(() =>
  import('./pages/QualityPage').then((m) => ({ default: m.QualityPage }))
);
const EquipmentPage = lazy(() =>
  import('./pages/EquipmentPage').then((m) => ({ default: m.EquipmentPage }))
);
const ModbusSimulatorPage = lazy(() =>
  import('./pages/ModbusSimulatorPage').then((m) => ({ default: m.ModbusSimulatorPage }))
);
const ArchitecturePage = lazy(() =>
  import('./pages/ArchitecturePage').then((m) => ({ default: m.ArchitecturePage }))
);
const CybersecurityPage = lazy(() =>
  import('./pages/CybersecurityPage').then((m) => ({ default: m.CybersecurityPage }))
);
const AcceptanceTestsPage = lazy(() =>
  import('./pages/AcceptanceTestsPage').then((m) => ({ default: m.AcceptanceTestsPage }))
);
const CompliancePage = lazy(() =>
  import('./pages/CompliancePage').then((m) => ({ default: m.CompliancePage }))
);
const ProjectMethodologyPage = lazy(() =>
  import('./pages/ProjectMethodologyPage').then((m) => ({ default: m.ProjectMethodologyPage }))
);
const AuditPage = lazy(() =>
  import('./pages/AuditPage').then((m) => ({ default: m.AuditPage }))
);
const UsersPage = lazy(() =>
  import('./pages/UsersPage').then((m) => ({ default: m.UsersPage }))
);
const HelpCenterPage = lazy(() =>
  import('./pages/HelpCenterPage').then((m) => ({ default: m.HelpCenterPage }))
);

// Fallback de chargement sobre et responsive
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-500">
        Chargement du module SME Marsa Maroc...
      </span>
    </div>
  </div>
);

// Scroll to top lors de chaque transition de route
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route
                index
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <DashboardPage />
                  </Suspense>
                }
              />
              <Route
                path="realtime"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <RealtimePage />
                  </Suspense>
                }
              />
              <Route
                path="postes"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <SubstationsPage />
                  </Suspense>
                }
              />
              <Route
                path="postes/:id"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <SubstationDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="history"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <HistoryPage />
                  </Suspense>
                }
              />
              <Route
                path="ipe"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <IpePage />
                  </Suspense>
                }
              />
              <Route
                path="ser"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <SerPage />
                  </Suspense>
                }
              />
              <Route
                path="alerts"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AlertsPage />
                  </Suspense>
                }
              />
              <Route
                path="reports"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ReportsPage />
                  </Suspense>
                }
              />
              <Route
                path="quality"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <QualityPage />
                  </Suspense>
                }
              />
              <Route
                path="equipment"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <EquipmentPage />
                  </Suspense>
                }
              />
              <Route
                path="modbus"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ModbusSimulatorPage />
                  </Suspense>
                }
              />
              <Route
                path="architecture"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ArchitecturePage />
                  </Suspense>
                }
              />
              <Route
                path="cybersecurity"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <CybersecurityPage />
                  </Suspense>
                }
              />
              <Route
                path="tests"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AcceptanceTestsPage />
                  </Suspense>
                }
              />
              <Route
                path="compliance"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <CompliancePage />
                  </Suspense>
                }
              />
              <Route
                path="project"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <ProjectMethodologyPage />
                  </Suspense>
                }
              />
              <Route
                path="audit"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <AuditPage />
                  </Suspense>
                }
              />
              <Route
                path="users"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <UsersPage />
                  </Suspense>
                }
              />
              <Route
                path="help"
                element={
                  <Suspense fallback={<LoadingFallback />}>
                    <HelpCenterPage />
                  </Suspense>
                }
              />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
