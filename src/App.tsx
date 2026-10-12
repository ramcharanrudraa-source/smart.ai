import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { BinMonitoring } from './components/monitoring/BinMonitoring';
import { RouteOptimizer } from './components/optimizer/RouteOptimizer';
import { InteractiveMapView } from './components/map/InteractiveMapView';
import { FleetManagement } from './components/fleet/FleetManagement';
import { AlertsView } from './components/alerts/AlertsView';
import { AnalyticsReports } from './components/analytics/AnalyticsReports';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { activeView } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If user is on landing page view, render the dedicated public landing portal
  if (activeView === 'landing') {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Header onToggleSidebar={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          {activeView === 'dashboard' && <OverviewDashboard />}
          {activeView === 'monitoring' && <BinMonitoring />}
          {activeView === 'optimizer' && <RouteOptimizer />}
          {activeView === 'map' && <InteractiveMapView />}
          {activeView === 'fleet' && <FleetManagement />}
          {activeView === 'alerts' && <AlertsView />}
          {activeView === 'analytics' && <AnalyticsReports />}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
