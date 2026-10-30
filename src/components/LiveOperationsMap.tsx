import React, { useState } from 'react';
import { Driver, Order, VehicleType } from '../types/delivery';
import { DEPOT_LOCATION } from '../data/mockData';
import {
  Navigation,
  Bike,
  Car,
  Truck,
  Zap,
  MapPin,
  Maximize2,
  Minimize2,
  Layers,
  Activity,
  Play,
  Pause,
  Info,
} from 'lucide-react';

interface LiveOperationsMapProps {
  drivers: Driver[];
  orders: Order[];
  onSelectOrder?: (order: Order) => void;
  onSelectDriver?: (driver: Driver) => void;
  isSimulatingGps?: boolean;
  onToggleSimulatingGps?: () => void;
}

export const LiveOperationsMap: React.FC<LiveOperationsMapProps> = ({
  drivers,
  orders,
  onSelectOrder,
  onSelectDriver,
  isSimulatingGps = false,
  onToggleSimulatingGps,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'driver' | 'order' | 'depot'; id: string } | null>(null);
  const [showTrafficHeatmap, setShowTrafficHeatmap] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Map coordinate bounds around San Francisco
  // Lat: 37.74 to 37.82, Lng: -122.44 to -122.38
  const minLat = 37.745;
  const maxLat = 37.815;
  const minLng = -122.445;
  const maxLng = -122.385;

  const latToY = (lat: number): number => {
    return ((maxLat - lat) / (maxLat - minLat)) * 100;
  };

  const lngToX = (lng: number): number => {
    return ((lng - minLng) / (maxLng - minLng)) * 100;
  };

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'bike':
        return <Bike className="w-3.5 h-3.5 text-emerald-400" />;
      case 'scooter':
        return <Navigation className="w-3.5 h-3.5 text-cyan-400 rotate-45" />;
      case 'car':
        return <Car className="w-3.5 h-3.5 text-amber-400" />;
      case 'van':
        return <Truck className="w-3.5 h-3.5 text-indigo-400" />;
      case 'ev_cargo':
        return <Zap className="w-3.5 h-3.5 text-emerald-300" />;
      default:
        return <Navigation className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const depotX = lngToX(DEPOT_LOCATION.coords.lng);
  const depotY = latToY(DEPOT_LOCATION.coords.lat);

  const activeOrders = orders.filter((o) => o.status === 'in_transit' || o.status === 'assigned' || o.status === 'pending');

  return (
    <div
      className={`relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-50 rounded-2xl' : 'h-[440px] w-full'
      }`}
    >
      {/* Top Map Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-700/60 rounded-lg text-xs font-medium text-slate-200 flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Metro Fleet Telemetry</span>
            <span className="text-slate-500 font-mono text-[10px]">SF CENTRAL GRID</span>
          </div>

          {onToggleSimulatingGps && (
            <button
              onClick={onToggleSimulatingGps}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all pointer-events-auto shadow-md ${
                isSimulatingGps
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-slate-950/80 text-slate-300 border-slate-700/60 hover:bg-slate-800'
              }`}
            >
              {isSimulatingGps ? (
                <>
                  <Pause className="w-3 h-3 text-amber-400" /> Live Simulation Active
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-400" /> Start GPS Simulation
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowTrafficHeatmap(!showTrafficHeatmap)}
            className={`p-1.5 rounded-lg text-xs border transition-all ${
              showTrafficHeatmap
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                : 'bg-slate-950/80 text-slate-400 border-slate-800'
            }`}
            title="Toggle Traffic Congestion Zones"
          >
            <Activity className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`p-1.5 rounded-lg text-xs border transition-all ${
              showRoutes
                ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-950/80 text-slate-400 border-slate-800'
            }`}
            title="Toggle Delivery Route Lines"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700/60 rounded-lg text-xs transition-all"
            title={isExpanded ? 'Minimize Map' : 'Expand Map'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Map Graphic Surface (SVG Canvas with Dark Cartographic Aesthetic) */}
      <svg className="w-full h-full select-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          {/* Subtle Grid Pattern */}
          <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.3" strokeDasharray="1,1" />
          </pattern>

          {/* Urban Road Network Gradients */}
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>

          <radialGradient id="depotPulse" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Map Background */}
        <rect width="100%" height="100%" fill="#090d16" />
        <rect width="100%" height="100%" fill="url(#gridPattern)" />

        {/* Major SF Arterial Roads and Highways Simulation */}
        <g stroke="#1e293b" strokeWidth="0.8" fill="none">
          {/* Market St Diagonal */}
          <path d="M 20 85 L 75 25" stroke="#334155" strokeWidth="1.2" />
          {/* Van Ness Ave Vertical */}
          <path d="M 40 5 L 40 95" stroke="#334155" strokeWidth="1.0" />
          {/* Mission St */}
          <path d="M 22 90 L 78 30" stroke="#1e293b" strokeWidth="0.9" />
          {/* Embarcadero Waterfront Curve */}
          <path d="M 65 5 Q 85 20 82 85" stroke="#1e293b" strokeWidth="1.1" />
          {/* Broadway / Bay St */}
          <path d="M 10 20 L 80 20" stroke="#1e293b" strokeWidth="0.8" />
          {/* 16th St Transverse */}
          <path d="M 10 65 L 85 65" stroke="#1e293b" strokeWidth="0.8" />
          {/* Geary Blvd */}
          <path d="M 5 35 L 75 35" stroke="#334155" strokeWidth="0.9" />
        </g>

        {/* Traffic Congestion Hotspots (Downtown & Highway Interchanges) */}
        {showTrafficHeatmap && (
          <g>
            <circle cx="58" cy="38" r="9" fill="#ef4444" fillOpacity="0.12" />
            <circle cx="58" cy="38" r="4" fill="#f97316" fillOpacity="0.18" />
            <circle cx="42" cy="55" r="7" fill="#f59e0b" fillOpacity="0.12" />
          </g>
        )}

        {/* Active Route Polylines */}
        {showRoutes &&
          activeOrders.map((ord) => {
            const startX = lngToX(ord.pickupCoords.lng);
            const startY = latToY(ord.pickupCoords.lat);
            const endX = lngToX(ord.deliveryCoords.lng);
            const endY = latToY(ord.deliveryCoords.lat);

            // Find assigned driver position if in transit
            const driver = drivers.find((d) => d.id === ord.assignedDriverId);
            const driverX = driver ? lngToX(driver.currentCoords.lng) : startX;
            const driverY = driver ? latToY(driver.currentCoords.lat) : startY;

            return (
              <g key={`route-${ord.id}`}>
                {/* Route track */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#38bdf8"
                  strokeWidth="0.6"
                  strokeDasharray="1.5,1.5"
                  strokeOpacity="0.6"
                />
                {/* Active driver progress segment */}
                {ord.status === 'in_transit' && (
                  <line
                    x1={driverX}
                    y1={driverY}
                    x2={endX}
                    y2={endY}
                    stroke="#10b981"
                    strokeWidth="0.9"
                    strokeOpacity="0.8"
                  />
                )}
              </g>
            );
          })}

        {/* Central Depot Location */}
        <g
          className="cursor-pointer"
          onClick={() => setSelectedEntity({ type: 'depot', id: 'central-depot' })}
        >
          <circle cx={depotX} cy={depotY} r="6" fill="url(#depotPulse)" className="animate-ping" />
          <circle cx={depotX} cy={depotY} r="3" fill="#3b82f6" stroke="#93c5fd" strokeWidth="0.8" />
          <text
            x={depotX}
            y={depotY - 4.5}
            fill="#93c5fd"
            fontSize="2.4"
            textAnchor="middle"
            fontWeight="bold"
            className="select-none"
          >
            DEPOT #1
          </text>
        </g>

        {/* Customer Destination Dropoff Markers */}
        {activeOrders.map((ord) => {
          const cx = lngToX(ord.deliveryCoords.lng);
          const cy = latToY(ord.deliveryCoords.lat);
          const isUrgent = ord.priority === 'urgent';
          const isExpress = ord.priority === 'express';

          return (
            <g
              key={`dropoff-${ord.id}`}
              className="cursor-pointer group"
              onClick={() => {
                setSelectedEntity({ type: 'order', id: ord.id });
                if (onSelectOrder) onSelectOrder(ord);
              }}
            >
              <circle
                cx={cx}
                cy={cy}
                r="2.2"
                fill={isUrgent ? '#ef4444' : isExpress ? '#f59e0b' : '#38bdf8'}
                stroke="#0f172a"
                strokeWidth="0.5"
              />
              <circle
                cx={cx}
                cy={cy}
                r="4"
                fill="none"
                stroke={isUrgent ? '#ef4444' : isExpress ? '#f59e0b' : '#38bdf8'}
                strokeWidth="0.3"
                strokeDasharray="1,1"
                className="opacity-70 group-hover:opacity-100"
              />
              <text
                x={cx}
                y={cy + 4.5}
                fill="#cbd5e1"
                fontSize="2.0"
                textAnchor="middle"
                className="select-none font-medium"
              >
                {ord.orderNumber}
              </text>
            </g>
          );
        })}

        {/* Fleet Personnel / Driver Markers */}
        {drivers.map((drv) => {
          const cx = lngToX(drv.currentCoords.lng);
          const cy = latToY(drv.currentCoords.lat);
          const isDelivering = drv.status === 'delivering';
          const isAvailable = drv.status === 'available';

          const markerColor = isDelivering ? '#10b981' : isAvailable ? '#06b6d4' : '#64748b';

          return (
            <g
              key={`driver-marker-${drv.id}`}
              className="cursor-pointer group"
              onClick={() => {
                setSelectedEntity({ type: 'driver', id: drv.id });
                if (onSelectDriver) onSelectDriver(drv);
              }}
            >
              {isDelivering && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="3.5"
                  fill="none"
                  stroke={markerColor}
                  strokeWidth="0.5"
                  className="animate-ping opacity-50"
                />
              )}
              <circle cx={cx} cy={cy} r="2.6" fill="#0f172a" stroke={markerColor} strokeWidth="0.9" />
              <circle cx={cx} cy={cy} r="1.5" fill={markerColor} />
              <text
                x={cx}
                y={cy - 4}
                fill="#f8fafc"
                fontSize="2.2"
                textAnchor="middle"
                fontWeight="600"
                className="select-none drop-shadow"
              >
                {drv.name.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Selected Entity Card Overlay */}
      {selectedEntity && (
        <div className="absolute bottom-3 left-3 max-w-sm w-full bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl z-30">
          <div className="flex items-start justify-between">
            {selectedEntity.type === 'depot' && (
              <div>
                <div className="text-xs font-semibold text-blue-400 uppercase tracking-wide">Primary Hub</div>
                <div className="text-sm font-bold text-white">{DEPOT_LOCATION.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">{DEPOT_LOCATION.address}</div>
                <div className="mt-2 text-xs text-slate-300 flex items-center gap-3">
                  <span>Available Couriers: {drivers.filter((d) => d.status === 'available').length}</span>
                  <span>Pending Orders: {orders.filter((o) => o.status === 'pending').length}</span>
                </div>
              </div>
            )}

            {selectedEntity.type === 'driver' && (() => {
              const drv = drivers.find((d) => d.id === selectedEntity.id);
              if (!drv) return null;
              return (
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-slate-800 rounded-lg">{getVehicleIcon(drv.vehicleType)}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{drv.name}</div>
                        <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                          {drv.vehicleModel} ({drv.licensePlate})
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        drv.status === 'delivering'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : drv.status === 'available'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {drv.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Rating</span>
                      <span className="font-semibold text-amber-400">★ {drv.rating}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Today's Runs</span>
                      <span className="font-semibold text-white">{drv.completedDeliveriesToday} done</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Battery / Fuel</span>
                      <span className="font-semibold text-emerald-400">{drv.batteryOrFuelLevel}%</span>
                    </div>
                  </div>

                  {drv.activeOrderId && (
                    <div className="mt-2 p-1.5 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-xs flex items-center justify-between text-emerald-300">
                      <span>Delivering Order: {drv.activeOrderId}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {selectedEntity.type === 'order' && (() => {
              const ord = orders.find((o) => o.id === selectedEntity.id);
              if (!ord) return null;
              return (
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{ord.orderNumber}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                            ord.priority === 'urgent'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : ord.priority === 'express'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {ord.priority}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium mt-0.5">{ord.customerName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-cyan-400">{ord.etaMinutes} mins ETA</div>
                      <div className="text-[10px] text-slate-400">By {ord.estimatedDeliveryTime}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 mt-2 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
                    <span>{ord.deliveryAddress}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">
                      Courier:{' '}
                      <strong className="text-white">{ord.assignedDriverName || 'Unassigned'}</strong>
                    </span>
                    <button
                      onClick={() => onSelectOrder && onSelectOrder(ord)}
                      className="text-cyan-400 hover:text-cyan-300 font-medium underline text-xs"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => setSelectedEntity(null)}
              className="ml-2 text-slate-500 hover:text-white text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-3 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg text-[11px] text-slate-400 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Central Depot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Courier Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>Dropoff Destination</span>
        </div>
      </div>
    </div>
  );
};
