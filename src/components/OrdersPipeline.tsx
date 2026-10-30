import React, { useState } from 'react';
import { Driver, Order, OrderPriority, OrderStatus } from '../types/delivery';
import {
  Package,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  User,
  MapPin,
  ChevronRight,
  PlusCircle,
  Calendar,
  XCircle,
  DollarSign,
  Tag,
  Key,
} from 'lucide-react';

interface OrdersPipelineProps {
  orders: Order[];
  drivers: Driver[];
  onSelectOrder: (order: Order) => void;
  onAssignDriver: (orderId: string, driverId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  onOpenNewOrder: () => void;
}

export const OrdersPipeline: React.FC<OrdersPipelineProps> = ({
  orders,
  drivers,
  onSelectOrder,
  onAssignDriver,
  onUpdateStatus,
  onOpenNewOrder,
}) => {
  const [activeStatusTab, setActiveStatusTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  const [completionNote, setCompletionNote] = useState<string>('');
  const [selectedDriverForOrder, setSelectedDriverForOrder] = useState<Record<string, string>>({});

  const availableDrivers = drivers.filter((d) => d.status === 'available');

  const filteredOrders = orders.filter((o) => {
    if (activeStatusTab !== 'all' && o.status !== activeStatusTab) return false;
    if (priorityFilter !== 'all' && o.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q);
      const matchAddr = o.deliveryAddress.toLowerCase().includes(q);
      const matchDriver = o.assignedDriverName?.toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchAddr && !matchDriver) return false;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Pending Dispatch
          </span>
        );
      case 'assigned':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Assigned
          </span>
        );
      case 'picked_up':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Picked Up
          </span>
        );
      case 'in_transit':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            In Transit
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-700 text-slate-300 border border-slate-600">
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: OrderPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
            Urgent
          </span>
        );
      case 'express':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
            Express
          </span>
        );
      case 'standard':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium uppercase bg-slate-800 text-slate-400">
            Standard
          </span>
        );
    }
  };

  const handleCompleteOrderSubmission = (order: Order) => {
    const note = completionNote || (pinInput ? `Verified with PIN [${pinInput}]` : 'Handed directly to recipient');
    onUpdateStatus(order.id, 'delivered', note);
    setCompletingOrderId(null);
    setPinInput('');
    setCompletionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Filters, Add Order */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order number, customer, address, or courier..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Priority Filter & New Order Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="express">Express</option>
              <option value="standard">Standard</option>
            </select>
          </div>

          <button
            onClick={onOpenNewOrder}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-600/30 whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none border-b border-slate-800 pb-2 text-xs">
        {[
          { id: 'all', label: 'All Orders', count: orders.length },
          { id: 'pending', label: 'Pending Dispatch', count: orders.filter((o) => o.status === 'pending').length },
          { id: 'assigned', label: 'Assigned', count: orders.filter((o) => o.status === 'assigned').length },
          { id: 'in_transit', label: 'In Transit', count: orders.filter((o) => o.status === 'in_transit').length },
          { id: 'delivered', label: 'Delivered', count: orders.filter((o) => o.status === 'delivered').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveStatusTab(tab.id)}
            className={`px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeStatusTab === tab.id
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeStatusTab === tab.id ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Order Details</th>
                <th className="py-3.5 px-4">Customer & Address</th>
                <th className="py-3.5 px-4">Courier</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Predicted ETA</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No orders matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Order ID & Items */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{ord.orderNumber}</span>
                        {getPriorityBadge(ord.priority)}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {ord.items.length} item{ord.items.length > 1 ? 's' : ''} • ${ord.totalAmount.toFixed(2)} • {ord.packageWeightKg} kg
                      </div>
                    </td>

                    {/* Customer & Address */}
                    <td className="py-3.5 px-4 max-w-[220px]">
                      <div className="font-semibold text-slate-200">{ord.customerName}</div>
                      <div className="text-slate-400 text-[11px] truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                        <span title={ord.deliveryAddress}>{ord.deliveryAddress}</span>
                      </div>
                    </td>

                    {/* Assigned Courier */}
                    <td className="py-3.5 px-4">
                      {ord.assignedDriverName ? (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          <div>
                            <div className="font-medium text-slate-200">{ord.assignedDriverName}</div>
                            <div className="text-[10px] text-slate-500 uppercase">{ord.assignedDriverVehicle}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <select
                            value={selectedDriverForOrder[ord.id] || ''}
                            onChange={(e) =>
                              setSelectedDriverForOrder({ ...selectedDriverForOrder, [ord.id]: e.target.value })
                            }
                            className="bg-slate-950 border border-slate-700 text-slate-300 text-[11px] rounded px-2 py-1 focus:outline-none"
                          >
                            <option value="">Assign...</option>
                            {availableDrivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.vehicleType})
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => {
                              const dId = selectedDriverForOrder[ord.id];
                              if (dId) onAssignDriver(ord.id, dId);
                            }}
                            disabled={!selectedDriverForOrder[ord.id]}
                            className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded text-[11px] font-semibold"
                          >
                            Go
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">{getStatusBadge(ord.status)}</td>

                    {/* ETA Prediction */}
                    <td className="py-3.5 px-4">
                      {ord.status === 'delivered' ? (
                        <div className="text-slate-400 text-xs">
                          Delivered at <strong className="text-emerald-400">{ord.actualDeliveryTime}</strong>
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-cyan-400 text-xs">{ord.etaMinutes} mins ETA</div>
                          <div className="text-[10px] text-slate-500">Target {ord.estimatedDeliveryTime}</div>
                        </div>
                      )}
                    </td>

                    {/* Action Controls */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {ord.status === 'assigned' && (
                          <button
                            onClick={() => onUpdateStatus(ord.id, 'picked_up', 'Parcel collected from depot')}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-semibold rounded transition-all"
                            title="Mark parcel as picked up by courier"
                          >
                            Picked Up
                          </button>
                        )}

                        {ord.status === 'picked_up' && (
                          <button
                            onClick={() => onUpdateStatus(ord.id, 'in_transit', 'Courier on the road')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded transition-all"
                            title="Advance courier to in-transit status"
                          >
                            Start Transit
                          </button>
                        )}

                        {ord.status === 'in_transit' && (
                          <button
                            onClick={() => setCompletingOrderId(ord.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Complete
                          </button>
                        )}

                        <button
                          onClick={() => onSelectOrder(ord)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded transition-all"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Order Delivery Completion Verification */}
      {completingOrderId && (() => {
        const ord = orders.find((o) => o.id === completingOrderId);
        if (!ord) return null;
        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Complete Delivery</h3>
                    <p className="text-xs text-slate-400">{ord.orderNumber} • {ord.customerName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCompletingOrderId(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Destination:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[200px]">{ord.deliveryAddress}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Courier:</span>
                  <span className="text-cyan-400 font-medium">{ord.assignedDriverName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Expected Customer PIN:</span>
                  <span className="text-amber-400 font-mono font-bold tracking-widest">{ord.proofOfDeliveryPin}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Customer Verification PIN (Optional)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="e.g. 4821"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Handover Notes / Proof of Delivery
                </label>
                <input
                  type="text"
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  placeholder="e.g. Handed to customer at door / Left at concierge"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setCompletingOrderId(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCompleteOrderSubmission(ord)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-600/30"
                >
                  Confirm Delivery
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
