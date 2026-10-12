import React, { useState } from 'react';
import { useApp, AppView } from '../../context/AppContext';
import { CopyrightPolicyModal } from './CopyrightPolicyModal';
import {
  LayoutDashboard,
  Trash2,
  Navigation,
  MapPin,
  Truck,
  Bell,
  BarChart3,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Compass,
} from 'lucide-react';

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
  const { activeView, setActiveView, alerts, resetToDefaultData } = useApp();
  const [copyrightModalOpen, setCopyrightModalOpen] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.resolved).length;

  const navItems: { id: AppView; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Bin Monitoring', icon: Trash2 },
    { id: 'optimizer', label: 'Route Optimizer', icon: Navigation },
    { id: 'map', label: 'Interactive Map', icon: MapPin },
    { id: 'fleet', label: 'Fleet Management', icon: Truck },
    { id: 'alerts', label: 'Alerts & Notifications', icon: Bell, badge: unreadAlerts },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  const handleNavClick = (viewId: AppView) => {
    setActiveView(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-[#0B1220] transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <button
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20">
              <Compass className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-white">EcoRoute</span>
                  <span className="text-emerald-400 font-semibold">AI</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">Smart Municipal Waste</p>
              </div>
            )}
          </button>

          {/* Desktop Collapse Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white lg:flex"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200 border border-transparent'
                } ${collapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 transition-transform ${
                    isActive ? 'text-emerald-400 scale-105' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500/20 px-1.5 text-[11px] font-semibold text-red-400 border border-red-500/30">
                    {item.badge}
                  </span>
                )}
                {collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Hackathon Prototype Card & Reset */}
        <div className="border-t border-slate-800 p-3">
          {!collapsed ? (
            <div className="space-y-2.5 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">Hackathon Prototype</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Simulated sensor grid & heuristic VRP solver for smart city demonstration.
              </p>
              <button
                onClick={resetToDefaultData}
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-800 bg-slate-800/80 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Demo State</span>
              </button>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-500">
                <span>&copy; 2026 EcoRoute AI</span>
                <button
                  onClick={() => setCopyrightModalOpen(true)}
                  className="hover:text-emerald-400 hover:underline transition-colors"
                >
                  Copyright Policy
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={resetToDefaultData}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white"
                title="Reset Demo State"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <CopyrightPolicyModal isOpen={copyrightModalOpen} onClose={() => setCopyrightModalOpen(false)} />
    </>
  );
};
