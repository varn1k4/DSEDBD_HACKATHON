import React, { useState, useMemo } from 'react';
import { Customer, OrderPriority, TrafficLevel, VehicleType, WeatherCondition } from '../types/delivery';
import { predictDeliveryEta } from '../services/etaPredictor';
import {
  Package,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  DollarSign,
  AlertCircle,
  Truck,
  Plus,
  Trash2,
} from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onCreateOrder: (orderData: any) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  customers,
  onCreateOrder,
}) => {
  if (!isOpen) return null;

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [customCustomerName, setCustomCustomerName] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(customers[0]?.address || '');
  const [priority, setPriority] = useState<OrderPriority>('standard');
  const [packageWeightKg, setPackageWeightKg] = useState<number>(3.5);
  const [distanceKm, setDistanceKm] = useState<number>(4.2);
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [preferredVehicle, setPreferredVehicle] = useState<VehicleType>('scooter');
  const [trafficCondition, setTrafficCondition] = useState<TrafficLevel>('moderate');
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('clear');

  // Items
  const [items, setItems] = useState([
    { id: '1', name: 'Standard Delivery Parcel', quantity: 1, unitPrice: 45.0 },
  ]);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Live ETA Preview
  const etaPreview = useMemo(() => {
    return predictDeliveryEta({
      distanceKm,
      vehicleType: preferredVehicle,
      trafficLevel: trafficCondition,
      weatherCondition,
      packageWeightKg,
      timeOfDayHour: new Date().getHours(),
      prepTimeMinutes: 5,
    });
  }, [distanceKm, preferredVehicle, trafficCondition, weatherCondition, packageWeightKg]);

  const totalAmount = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);

  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setDeliveryAddress(cust.address);
      if (cust.notes) setDeliveryNotes(cust.notes);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), name: 'Additional Logistics Item', quantity: 1, unitPrice: 20.0 },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateOrder({
      customerId: selectedCustomerId,
      customerName: selectedCustomer ? selectedCustomer.name : customCustomerName || 'Walk-in Client',
      customerPhone: selectedCustomer ? selectedCustomer.phone : '+1 (555) 444-1212',
      customerEmail: selectedCustomer ? selectedCustomer.email : 'client@fastdelivery.com',
      deliveryAddress,
      deliveryCoords: selectedCustomer ? selectedCustomer.coordinates : { lat: 37.78, lng: -122.41 },
      distanceKm,
      packageWeightKg,
      priority,
      preferredVehicle,
      trafficCondition,
      weatherCondition,
      deliveryNotes,
      items,
      totalAmount,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">Create New Delivery Dispatch</h2>
              <p className="text-xs text-slate-400">Register order into fleet routing queue</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-base">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Select Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Dispatch Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as OrderPriority)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="standard">Standard Routing</option>
                <option value="express">Express (Priority Queue)</option>
                <option value="urgent">Urgent Rush (Immediate Dispatch)</option>
              </select>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Dropoff Delivery Address *</label>
            <input
              type="text"
              required
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Route & Cargo Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Estimated Distance (km)</label>
              <input
                type="number"
                min="0.5"
                max="50"
                step="0.1"
                value={distanceKm}
                onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Total Weight (kg)</label>
              <input
                type="number"
                min="0.2"
                max="300"
                step="0.1"
                value={packageWeightKg}
                onChange={(e) => setPackageWeightKg(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vehicle Modality</label>
              <select
                value={preferredVehicle}
                onChange={(e) => setPreferredVehicle(e.target.value as VehicleType)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="bike">E-Bike (Lightweight fast)</option>
                <option value="scooter">Electric Scooter</option>
                <option value="ev_cargo">EV Cargo (Green Eco)</option>
                <option value="car">Hybrid Car</option>
                <option value="van">High-Roof Van (Heavy / Bulk)</option>
              </select>
            </div>
          </div>

          {/* Real-time Predictive ETA Strip inside modal */}
          <div className="bg-gradient-to-r from-purple-950/40 via-slate-950 to-cyan-950/40 border border-purple-500/30 rounded-xl p-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-white font-bold">Predicted Delivery ETA: {etaPreview.etaMinutes} mins</div>
                <div className="text-[11px] text-slate-400">
                  Target Arrival: {etaPreview.estimatedArrivalTime} • {etaPreview.confidenceScore}% Model Confidence
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
              ML Engine Live
            </span>
          </div>

          {/* Delivery Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Special Delivery Notes</label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="e.g. Ring buzzer 14B, leave on front porch"
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all"
            >
              Dispatch Order (${totalAmount.toFixed(2)})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
