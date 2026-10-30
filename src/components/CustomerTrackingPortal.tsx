import React, { useState } from 'react';
import { Driver, Order } from '../types/delivery';
import {
  Package,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Key,
  Star,
  ChevronDown,
} from 'lucide-react';

interface CustomerTrackingPortalProps {
  orders: Order[];
  drivers: Driver[];
}

export const CustomerTrackingPortal: React.FC<CustomerTrackingPortalProps> = ({
  orders,
  drivers,
}) => {
  // Default to an active order
  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    activeOrders.find((o) => o.status === 'in_transit')?.id || activeOrders[0]?.id || ''
  );

  const currentOrder = orders.find((o) => o.id === selectedOrderId) || activeOrders[0];
  const assignedDriver = drivers.find((d) => d.id === currentOrder?.assignedDriverId);

  if (!currentOrder) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        No orders available for customer tracking.
      </div>
    );
  }

  // Stepper calculations
  const steps = [
    { id: 'pending', label: 'Order Confirmed', time: '13:40' },
    { id: 'assigned', label: 'Courier Assigned', time: '13:42' },
    { id: 'picked_up', label: 'Parcel Picked Up', time: '13:48' },
    { id: 'in_transit', label: 'Out for Delivery', time: '13:50' },
    { id: 'delivered', label: 'Delivered', time: currentOrder.actualDeliveryTime || 'Pending' },
  ];

  const statusOrder = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered'];
  const currentIndex = statusOrder.indexOf(currentOrder.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Customer Order Switcher (for demo flexibility) */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-300">Live Customer Tracking View:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 font-medium"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} - {o.customerName} ({o.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Tracking Portal View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Banner with ETA */}
        <div className="bg-gradient-to-r from-cyan-900/50 via-slate-900 to-blue-900/50 p-6 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
                Estimated Delivery Arrival
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {currentOrder.status === 'delivered' ? 'Delivered' : `Arriving by ${currentOrder.estimatedDeliveryTime}`}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {currentOrder.status === 'delivered'
                  ? `Completed at ${currentOrder.actualDeliveryTime}`
                  : `Estimated remaining time: ~${currentOrder.etaMinutes} minutes`}
              </div>
            </div>

            {/* Verification PIN Code Badge */}
            <div className="bg-slate-950/80 border border-amber-500/40 rounded-xl p-3 text-center sm:text-right">
              <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1 justify-center sm:justify-end">
                <Key className="w-3 h-3" /> Delivery Verification PIN
              </div>
              <div className="text-2xl font-mono font-black text-white tracking-widest mt-0.5">
                {currentOrder.proofOfDeliveryPin}
              </div>
              <div className="text-[10px] text-slate-400">Share with courier at doorstep</div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-8">
            <div className="grid grid-cols-5 gap-2 relative">
              {/* Connector line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0">
                <div
                  className="h-full bg-cyan-500 transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, (currentIndex / (steps.length - 1)) * 100))}%`,
                  }}
                ></div>
              </div>

              {steps.map((step, idx) => {
                const isPassed = idx <= currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                  <div key={step.id} className="relative z-10 text-center space-y-1">
                    <div
                      className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isPassed && !isCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div
                      className={`text-[11px] font-semibold truncate ${
                        isCurrent ? 'text-cyan-400' : isPassed ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Driver & Delivery Information Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Assigned Courier Profile */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Your Delivery Partner
            </div>

            {assignedDriver ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={assignedDriver.avatarUrl}
                    alt={assignedDriver.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500/40"
                  />
                  <div>
                    <div className="font-bold text-white text-base flex items-center gap-2">
                      <span>{assignedDriver.name}</span>
                      <span className="text-xs text-amber-400 font-semibold flex items-center">
                        <Star className="w-3.5 h-3.5 fill-amber-400 inline" /> {assignedDriver.rating}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {assignedDriver.vehicleModel} • {assignedDriver.licensePlate}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium mt-1">
                      {assignedDriver.completedDeliveriesToday} deliveries completed today
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <a
                    href={`tel:${assignedDriver.phone}`}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Call Courier</span>
                  </a>
                  <button
                    onClick={() => alert(`Messaging channel opened with ${assignedDriver.name}`)}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Send Note</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                A courier is being assigned to your order.
              </div>
            )}
          </div>

          {/* Right Column: Destination & Package Details */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 text-xs">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Delivery Destination
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">{currentOrder.deliveryAddress}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Recipient: {currentOrder.customerName} ({currentOrder.customerPhone})
                  </div>
                </div>
              </div>

              {currentOrder.deliveryNotes && (
                <div className="p-2.5 bg-slate-900 rounded-lg text-slate-300 text-[11px] border border-slate-800">
                  <strong>Delivery Notes:</strong> {currentOrder.deliveryNotes}
                </div>
              )}
            </div>

            {/* Package Items */}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-slate-400 font-semibold mb-2">Package Items ({currentOrder.items.length})</div>
              <div className="space-y-1.5">
                {currentOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between text-slate-300">
                    <span>
                      {it.name} <span className="text-slate-500">x{it.quantity}</span>
                    </span>
                    <span className="font-medium text-white">${(it.unitPrice * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
