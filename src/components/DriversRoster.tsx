import React, { useState } from 'react';
import { Driver, DriverStatus, VehicleType } from '../types/delivery';
import {
  Users,
  Bike,
  Navigation,
  Car,
  Truck,
  Zap,
  Star,
  BatteryCharging,
  CheckCircle,
  PlusCircle,
  Phone,
  Mail,
  Filter,
  Shield,
  Activity,
  Package,
} from 'lucide-react';

interface DriversRosterProps {
  drivers: Driver[];
  onSelectDriver: (driver: Driver) => void;
  onUpdateDriverStatus: (driverId: string, status: DriverStatus) => void;
  onOpenAddDriver: () => void;
}

export const DriversRoster: React.FC<DriversRosterProps> = ({
  drivers,
  onSelectDriver,
  onUpdateDriverStatus,
  onOpenAddDriver,
}) => {
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case 'bike':
        return <Bike className="w-4 h-4 text-emerald-400" />;
      case 'scooter':
        return <Navigation className="w-4 h-4 text-cyan-400 rotate-45" />;
      case 'car':
        return <Car className="w-4 h-4 text-amber-400" />;
      case 'van':
        return <Truck className="w-4 h-4 text-indigo-400" />;
      case 'ev_cargo':
        return <Zap className="w-4 h-4 text-emerald-300" />;
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    if (vehicleFilter !== 'all' && d.vehicleType !== vehicleFilter) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    return true;
  });

  const availableCount = drivers.filter((d) => d.status === 'available').length;
  const deliveringCount = drivers.filter((d) => d.status === 'delivering').length;
  const breakCount = drivers.filter((d) => d.status === 'break').length;

  return (
    <div className="space-y-6">
      {/* Fleet Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Active Couriers</div>
          <div className="text-2xl font-bold text-white mt-1">{drivers.length}</div>
          <div className="text-[11px] text-cyan-400 mt-1 font-medium">100% Verified Fleet</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">En Route (Delivering)</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{deliveringCount}</div>
          <div className="text-[11px] text-emerald-500 mt-1 font-medium">Active dispatches</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Ready for Orders</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{availableCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Available now</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400">Fleet Satisfaction</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">4.92 ★</div>
          <div className="text-[11px] text-slate-400 mt-1">Based on 6,560 ratings</div>
        </div>
      </div>

      {/* Filter and Add Courier Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="delivering">Delivering</option>
              <option value="break">On Break</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Vehicle Filter */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Vehicle:</span>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Vehicles</option>
              <option value="bike">E-Bike</option>
              <option value="scooter">Electric Scooter</option>
              <option value="ev_cargo">EV Cargo Van</option>
              <option value="car">Hybrid Car</option>
              <option value="van">High-Roof Van</option>
            </select>
          </div>
        </div>

        <button
          onClick={onOpenAddDriver}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/30 whitespace-nowrap"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Fleet Courier</span>
        </button>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => {
          const isAvailable = driver.status === 'available';
          const isDelivering = driver.status === 'delivering';
          const isOnBreak = driver.status === 'break';

          return (
            <div
              key={driver.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all space-y-4 shadow-sm"
            >
              {/* Driver Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={driver.avatarUrl}
                    alt={driver.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span>{driver.name}</span>
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center">
                        <Star className="w-3 h-3 fill-amber-400 inline" /> {driver.rating}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span className="p-0.5 bg-slate-800 rounded">{getVehicleIcon(driver.vehicleType)}</span>
                      <span>{driver.vehicleModel}</span>
                    </div>
                  </div>
                </div>

                {/* Status Switcher Dropdown */}
                <select
                  value={driver.status}
                  onChange={(e) => onUpdateDriverStatus(driver.id, e.target.value as DriverStatus)}
                  disabled={isDelivering}
                  className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1 border focus:outline-none ${
                    isDelivering
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 cursor-not-allowed'
                      : isAvailable
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 cursor-pointer'
                      : isOnBreak
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 cursor-pointer'
                      : 'bg-slate-800 text-slate-400 border-slate-700 cursor-pointer'
                  }`}
                >
                  <option value="available">Available</option>
                  <option value="delivering" disabled>Delivering</option>
                  <option value="break">On Break</option>
                  <option value="offline">Offline</option>
                </select>
              </div>

              {/* Courier Performance & Telemetry Strip */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Today's Runs</span>
                  <span className="font-bold text-white">{driver.completedDeliveriesToday} delivered</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Battery / Fuel</span>
                  <span
                    className={`font-bold ${
                      driver.batteryOrFuelLevel > 50
                        ? 'text-emerald-400'
                        : driver.batteryOrFuelLevel > 20
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {driver.batteryOrFuelLevel}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Max Payload</span>
                  <span className="font-bold text-slate-300">{driver.maxCapacityKg} kg</span>
                </div>
              </div>

              {/* Active Delivery Order Strip */}
              {driver.activeOrderId ? (
                <div className="p-2.5 bg-emerald-950/30 border border-emerald-800/40 rounded-lg flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Active Run: <strong>{driver.activeOrderId}</strong></span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 animate-pulse">● In Transit</span>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-950/40 border border-slate-800 rounded-lg text-xs text-slate-500 flex items-center justify-between">
                  <span>No active delivery assigned</span>
                  <span className="text-[10px] text-slate-500">Standby</span>
                </div>
              )}

              {/* Contact & Plate Footnote */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Plate: <strong className="text-slate-200">{driver.licensePlate}</strong></span>
                <div className="flex items-center gap-3">
                  <a href={`tel:${driver.phone}`} className="text-slate-400 hover:text-cyan-400">
                    <Phone className="w-3.5 h-3.5 inline mr-1" />
                    Call
                  </a>
                  <button
                    onClick={() => onSelectDriver(driver)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Inspect →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
