import React, { useState } from 'react';
import { Driver, Order, SystemStats } from '../types/delivery';
import { LiveOperationsMap } from './LiveOperationsMap';
import {
  TrendingUp,
  Clock,
  Truck,
  Package,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Zap,
  MapPin,
  ShieldCheck,
  User,
} from 'lucide-react';

interface DispatchOverviewProps {
  orders: Order[];
  drivers: Driver[];
  stats: SystemStats;
  onSelectOrder: (order: Order) => void;
  onSelectDriver: (driver: Driver) => void;
  onAssignDriver: (orderId: string, driverId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: any) => void;
  onAutoDispatch: () => void;
  onOpenNewOrder: () => void;
  isSimulatingGps: boolean;
  onToggleSimulatingGps: () => void;
}

export const DispatchOverview: React.FC<DispatchOverviewProps> = ({
  orders,
  drivers,
  stats,
  onSelectOrder,
  onSelectDriver,
  onAssignDriver,
  onUpdateOrderStatus,
  onAutoDispatch,
  onOpenNewOrder,
  isSimulatingGps,
  onToggleSimulatingGps,
}) => {
  const [selectedDriverForOrder, setSelectedDriverForOrder] = useState<Record<string, string>>({});

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const activeOrders = orders.filter((o) => o.status === 'in_transit' || o.status === 'picked_up' || o.status === 'assigned');
  const availableDrivers = drivers.filter((d) => d.status === 'available');

  const handleManualAssign = (orderId: string) => {
    const driverId = selectedDriverForOrder[orderId];
    if (driverId) {
      onAssignDriver(orderId, driverId);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Active Dispatches */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>In Transit Deliveries</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.activeDeliveries}</span>
            <span className="text-xs text-emerald-400 font-medium">Live on route</span>
          </div>
        </div>

        {/* Pending Dispatch */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending Dispatch</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.pendingDispatch}</span>
            <span className="text-xs text-amber-400 font-medium">Needs courier</span>
          </div>
        </div>

        {/* Ready Drivers */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Ready Couriers</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <User className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {availableDrivers.length} <span className="text-sm text-slate-500">/ {drivers.length}</span>
            </span>
            <span className="text-xs text-cyan-400 font-medium">Available now</span>
          </div>
        </div>

        {/* Avg Predicted ETA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Average Fleet ETA</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats.averageEtaMinutes}</span>
            <span className="text-xs text-purple-300 font-medium">mins / delivery</span>
          </div>
        </div>

        {/* On-Time Delivery Rate */}
        <div className="col-span-2 md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>On-Time SLA</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{stats.onTimeDeliveryRate}%</span>
            <span className="text-xs text-slate-400">Target 95%</span>
          </div>
        </div>
      </div>

      {/* Main Operations Grid: Map + Dispatch Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Live Fleet GPS & Dropoffs</h2>
              <span className="text-xs text-slate-400">Real-time telematics</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Updated live</span>
            </div>
          </div>

          <LiveOperationsMap
            drivers={drivers}
            orders={orders}
            onSelectOrder={onSelectOrder}
            onSelectDriver={onSelectDriver}
            isSimulatingGps={isSimulatingGps}
            onToggleSimulatingGps={onToggleSimulatingGps}
          />

          {/* Urban Road Conditions Strip */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold">City Conditions:</span>
              <span>SF Downtown: Moderate Congestion (1.2x)</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <span>Weather: Clear (18°C)</span>
              <span>Active Peak: Afternoon Window</span>
            </div>
          </div>
        </div>

        {/* Dispatch Action Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Dispatch Queue</h2>
              <p className="text-xs text-slate-400">Unassigned and active deliveries</p>
            </div>
            {pendingOrders.length > 0 && (
              <button
                onClick={onAutoDispatch}
                className="px-2.5 py-1 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg flex items-center gap-1 transition-all"
              >
                <Zap className="w-3 h-3" /> Auto-Assign All ({pendingOrders.length})
              </button>
            )}
          </div>

          {/* Pending Orders Needing Driver */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Pending Assignment ({pendingOrders.length})</span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                All orders are currently dispatched to couriers!
              </div>
            ) : (
              pendingOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-slate-900 border border-amber-500/30 rounded-xl p-3.5 hover:border-amber-500/60 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{ord.orderNumber}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                            ord.priority === 'urgent'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {ord.priority}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">({ord.distanceKm} km)</span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-1">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[280px]">
                        {ord.deliveryAddress}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-cyan-400">~{ord.etaMinutes}m ETA</div>
                      <div className="text-[10px] text-slate-400">{ord.packageWeightKg} kg</div>
                    </div>
                  </div>

                  {/* Driver Assign Bar */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <select
                      value={selectedDriverForOrder[ord.id] || ''}
                      onChange={(e) =>
                        setSelectedDriverForOrder({ ...selectedDriverForOrder, [ord.id]: e.target.value })
                      }
                      className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Select available courier...</option>
                      {availableDrivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.vehicleType.toUpperCase()} - {d.vehicleModel})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleManualAssign(ord.id)}
                      disabled={!selectedDriverForOrder[ord.id]}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-lg transition-all"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Active In-Transit Deliveries */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              <span>Active Dispatches ({activeOrders.length})</span>
            </div>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {activeOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => onSelectOrder(ord)}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{ord.orderNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase font-semibold">
                        {ord.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium">{ord.customerName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3 text-cyan-400" />
                      <span>{ord.assignedDriverName || 'Driver en route'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-cyan-400">{ord.etaMinutes} mins</div>
                    <div className="text-[10px] text-slate-500">Arrival {ord.estimatedDeliveryTime}</div>
                    <ChevronRight className="w-4 h-4 text-slate-600 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
