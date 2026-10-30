import React, { useState } from 'react';
import { Driver, Order } from '../types/delivery';
import {
  History,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  User,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';

interface DeliveryHistoryProps {
  orders: Order[];
  drivers: Driver[];
  onSelectOrder: (order: Order) => void;
}

export const DeliveryHistory: React.FC<DeliveryHistoryProps> = ({
  orders,
  drivers,
  onSelectOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [driverFilter, setDriverFilter] = useState('all');

  // Filter completed or delivered orders
  const historyOrders = orders.filter((o) => o.status === 'delivered' || o.status === 'cancelled');

  const filteredHistory = historyOrders.filter((o) => {
    if (driverFilter !== 'all' && o.assignedDriverId !== driverFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q);
      const matchAddr = o.deliveryAddress.toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchAddr) return false;
    }
    return true;
  });

  const totalDelivered = historyOrders.filter((o) => o.status === 'delivered').length;
  const totalValue = historyOrders.reduce((sum, o) => sum + (o.status === 'delivered' ? o.totalAmount : 0), 0);
  const avgMinutes =
    historyOrders.length > 0
      ? Math.round(historyOrders.reduce((sum, o) => sum + o.etaMinutes, 0) / historyOrders.length)
      : 22;

  // Export CSV
  const exportCsv = () => {
    const headers = ['Order Number', 'Customer', 'Driver', 'Status', 'Distance (km)', 'ETA (mins)', 'Delivered At', 'Amount ($)'];
    const rows = filteredHistory.map((o) => [
      o.orderNumber,
      `"${o.customerName}"`,
      `"${o.assignedDriverName || 'Unassigned'}"`,
      o.status,
      o.distanceKm,
      o.etaMinutes,
      o.actualDeliveryTime || 'N/A',
      o.totalAmount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `delivery_history_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-400">Completed Deliveries</div>
          <div className="text-2xl font-bold text-white mt-1">{totalDelivered}</div>
          <div className="text-[11px] text-emerald-400 mt-1">100% Verified Handover</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-400">On-Time SLA Performance</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">98.2%</div>
          <div className="text-[11px] text-slate-400 mt-1">Goal: &gt; 95%</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-400">Avg Transit Duration</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">{avgMinutes} mins</div>
          <div className="text-[11px] text-slate-400 mt-1">Across all vehicle types</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="text-xs text-slate-400">Total Cargo Value Delivered</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">${totalValue.toFixed(2)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Dispatched logistics volume</div>
        </div>
      </div>

      {/* Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex flex-1 items-center gap-3 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search delivery logs..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none"
          >
            <option value="all">All Couriers</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={exportCsv}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors whitespace-nowrap"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">Courier</th>
                <th className="py-3 px-4">Distance & ETA</th>
                <th className="py-3 px-4">Delivered Time</th>
                <th className="py-3 px-4 text-right">Cargo Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No delivery history records found.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => onSelectOrder(ord)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{ord.orderNumber}</div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium">{ord.customerName}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[220px]">
                        {ord.deliveryAddress}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-300 font-medium">{ord.assignedDriverName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-500 uppercase">{ord.assignedDriverVehicle}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{ord.distanceKm} km</div>
                      <div className="text-[10px] text-slate-400">Predicted: {ord.etaMinutes}m</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-emerald-400 font-mono font-bold">
                        {ord.actualDeliveryTime || 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-500">Target was {ord.estimatedDeliveryTime}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="font-bold text-white">${ord.totalAmount.toFixed(2)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
