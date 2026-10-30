import React from 'react';
import { Order, OrderStatus } from '../types/delivery';
import {
  Package,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">{order.orderNumber}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                  order.priority === 'urgent'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : order.priority === 'express'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {order.priority}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {order.status.replace('_', ' ')}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Registered on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        </div>

        {/* Quick Route Strip */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Pickup Depot
            </div>
            <div className="text-slate-200 font-medium">{order.pickupAddress}</div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Delivery Destination
            </div>
            <div className="text-slate-200 font-medium">{order.deliveryAddress}</div>
            <div className="text-[11px] text-cyan-400 mt-0.5">Route Distance: {order.distanceKm} km</div>
          </div>
        </div>

        {/* ETA Breakdown Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-bold text-white">Predictive ML ETA Breakdown</span>
            </div>
            <div className="text-xs text-purple-300 font-semibold">
              Confidence: {order.etaBreakdown?.confidenceScore || 95}%
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Total Predicted</span>
              <span className="text-base font-bold text-cyan-400">{order.etaMinutes} mins</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Target Arrival</span>
              <span className="text-base font-bold text-white">{order.estimatedDeliveryTime}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Traffic Condition</span>
              <span className="text-xs font-semibold text-amber-400 capitalize">{order.trafficCondition}</span>
            </div>
            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Weather Friction</span>
              <span className="text-xs font-semibold text-emerald-400 capitalize">{order.weatherCondition}</span>
            </div>
          </div>

          {order.etaBreakdown?.factors && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              {order.etaBreakdown.factors.map((f, i) => (
                <div key={i} className="flex justify-between text-[11px] text-slate-400">
                  <span>{f.label}</span>
                  <span className="font-mono text-slate-300">{f.impact}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer & Driver Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Customer Details
            </div>
            <div className="text-sm font-bold text-white">{order.customerName}</div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{order.customerPhone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{order.customerEmail}</span>
            </div>
            <div className="pt-1 text-[11px] text-slate-400">
              <strong>Instructions:</strong> {order.deliveryNotes || 'None specified'}
            </div>
            <div className="pt-1 flex items-center gap-2">
              <span className="text-slate-500">Verification PIN:</span>
              <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                {order.proofOfDeliveryPin}
              </span>
            </div>
          </div>

          {/* Assigned Driver */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Courier
            </div>
            {order.assignedDriverName ? (
              <>
                <div className="text-sm font-bold text-cyan-400">{order.assignedDriverName}</div>
                <div className="text-slate-400">
                  Vehicle: <strong className="text-slate-200 uppercase">{order.assignedDriverVehicle}</strong>
                </div>
                <div className="text-slate-400">
                  Status: <span className="text-emerald-400 font-semibold">Active Run</span>
                </div>
              </>
            ) : (
              <div className="text-amber-400 font-semibold py-4">No driver assigned yet</div>
            )}
          </div>
        </div>

        {/* Order Items & Totals */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Package Contents
          </div>
          <div className="bg-slate-950 rounded-xl border border-slate-800 divide-y divide-slate-800/80 text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-200 font-medium">{item.name}</span>
                  <span className="text-slate-500 ml-2">x{item.quantity}</span>
                </div>
                <span className="font-semibold text-white">
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="p-3 flex items-center justify-between bg-slate-900/40 font-bold text-white">
              <span>Total Value (Weight: {order.packageWeightKg} kg)</span>
              <span className="text-cyan-400">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Status Timeline History */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Status Timeline & Audit Log
          </div>
          <div className="space-y-2 border-l-2 border-slate-800 pl-4 ml-2">
            {order.statusTimeline.map((step, idx) => (
              <div key={idx} className="relative text-xs">
                <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase">{step.status.replace('_', ' ')}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{step.timestamp}</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">{step.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {order.status !== 'delivered' && order.status !== 'cancelled' ? (
            <button
              onClick={() => onUpdateStatus(order.id, 'cancelled', 'Cancelled by dispatcher')}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              Cancel Order
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
