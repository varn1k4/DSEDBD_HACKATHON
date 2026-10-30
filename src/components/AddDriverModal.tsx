import React, { useState } from 'react';
import { Driver, VehicleType } from '../types/delivery';
import { Users, Truck, PlusCircle } from 'lucide-react';

interface AddDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDriver: (driverData: Partial<Driver>) => void;
}

export const AddDriverModal: React.FC<AddDriverModalProps> = ({
  isOpen,
  onClose,
  onAddDriver,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('scooter');
  const [vehicleModel, setVehicleModel] = useState('Niu NQi GTS Pro');
  const [licensePlate, setLicensePlate] = useState(`CA-${Math.floor(1000 + Math.random() * 9000)}`);
  const [maxCapacityKg, setMaxCapacityKg] = useState<number>(20);

  const handleVehicleTypeChange = (v: VehicleType) => {
    setVehicleType(v);
    if (v === 'bike') {
      setVehicleModel('Specialized Turbo Vado E-Bike');
      setMaxCapacityKg(15);
    } else if (v === 'scooter') {
      setVehicleModel('Niu NQi GTS Pro');
      setMaxCapacityKg(22);
    } else if (v === 'ev_cargo') {
      setVehicleModel('Rivian EDV 500 Fleet');
      setMaxCapacityKg(250);
    } else if (v === 'car') {
      setVehicleModel('Toyota Prius Prime Hybrid');
      setMaxCapacityKg(80);
    } else if (v === 'van') {
      setVehicleModel('Mercedes-Benz Sprinter 2500');
      setMaxCapacityKg(600);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddDriver({
      name,
      phone: phone || '+1 (555) 777-8899',
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@fastcourier.com`,
      vehicleType,
      vehicleModel,
      licensePlate,
      maxCapacityKg,
      status: 'available',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">Register Fleet Courier</h2>
              <p className="text-xs text-slate-400">Add personnel to active dispatch roster</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Courier Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Leo Armstrong"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="courier@fastdelivery.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => handleVehicleTypeChange(e.target.value as VehicleType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="bike">E-Bike</option>
                <option value="scooter">Electric Scooter</option>
                <option value="ev_cargo">EV Cargo</option>
                <option value="car">Car / Hybrid</option>
                <option value="van">Van</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">License Plate</label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500 uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vehicle Model</label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Max Capacity (kg)</label>
              <input
                type="number"
                value={maxCapacityKg}
                onChange={(e) => setMaxCapacityKg(parseInt(e.target.value) || 10)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-600/30"
            >
              Add Courier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
