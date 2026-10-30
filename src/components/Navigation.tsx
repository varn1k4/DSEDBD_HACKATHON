import React from 'react';
import {
  MapPin,
  Package,
  Users,
  Cpu,
  Smartphone,
  History,
  UserCheck,
  Zap,
  PlusCircle,
  RotateCcw,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export type ActiveTab =
  | 'dispatch'
  | 'orders'
  | 'drivers'
  | 'eta_studio'
  | 'customer_portal'
  | 'history'
  | 'customers';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  pendingOrdersCount: number;
  activeDeliveriesCount: number;
  availableDriversCount: number;
  onOpenNewOrder: () => void;
  onAutoDispatch: () => void;
  onResetData: () => void;
  isAutoDispatching?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingOrdersCount,
  activeDeliveriesCount,
  availableDriversCount,
  onOpenNewOrder,
  onAutoDispatch,
  onResetData,
  isAutoDispatching = false,
}) => {
  const tabs = [
    {
      id: 'dispatch' as ActiveTab,
      label: 'Operations & Map',
      icon: MapPin,
      badge: activeDeliveriesCount > 0 ? `${activeDeliveriesCount} live` : undefined,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      id: 'orders' as ActiveTab,
      label: 'Orders Pipeline',
      icon: Package,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} pending` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'drivers' as ActiveTab,
      label: 'Fleet Personnel',
      icon: Users,
      badge: `${availableDriversCount} ready`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    },
    {
      id: 'eta_studio' as ActiveTab,
      label: 'ML ETA Predictor',
      icon: Cpu,
      badge: 'v2.4 ML',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    },
    {
      id: 'customer_portal' as ActiveTab,
      label: 'Customer Tracking',
      icon: Smartphone,
    },
    {
      id: 'history' as ActiveTab,
      label: 'Delivery History',
      icon: History,
    },
    {
      id: 'customers' as ActiveTab,
      label: 'Customers',
      icon: UserCheck,
    },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      {/* Top Banner: Brand & Global Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-wider text-white">VELOX</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/20">
                  SMART LOGISTICS
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Dispatch Control & Intelligent Telematics</div>
            </div>
          </div>

          {/* Quick Stats & Primary Action Buttons */}
          <div className="flex items-center gap-3">
            {/* System Status Pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-lg text-xs text-slate-300 border border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Central Hub SF</span>
              <span className="text-slate-500">|</span>
              <span className="text-emerald-400 font-medium">97.4% On-Time</span>
            </div>

            {/* Smart Auto-Dispatch Button */}
            <button
              onClick={onAutoDispatch}
              disabled={isAutoDispatching || pendingOrdersCount === 0}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                pendingOrdersCount > 0
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/30'
                  : 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
              }`}
              title="Automatically match available couriers to pending orders using ML proximity & capacity scoring"
            >
              <Zap className={`w-3.5 h-3.5 ${isAutoDispatching ? 'animate-spin' : ''}`} />
              <span>{isAutoDispatching ? 'Optimizing...' : 'Smart Auto-Dispatch'}</span>
              {pendingOrdersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
                  {pendingOrdersCount}
                </span>
              )}
            </button>

            {/* + New Order Button */}
            <button
              onClick={onOpenNewOrder}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Order</span>
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={onResetData}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
              title="Reset sample orders & drivers to initial state"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Sub-Bar */}
        <div className="flex space-x-1 overflow-x-auto scrollbar-none py-1 border-t border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
