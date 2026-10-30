import React, { useState, useEffect, useCallback } from 'react';
import { Customer, Driver, Order, OrderStatus, DriverStatus, SystemStats } from './types/delivery';
import { INITIAL_CUSTOMERS, INITIAL_DRIVERS, INITIAL_ORDERS } from './data/mockData';
import { Navigation, ActiveTab } from './components/Navigation';
import { DispatchOverview } from './components/DispatchOverview';
import { OrdersPipeline } from './components/OrdersPipeline';
import { DriversRoster } from './components/DriversRoster';
import { EtaPredictorStudio } from './components/EtaPredictorStudio';
import { CustomerTrackingPortal } from './components/CustomerTrackingPortal';
import { DeliveryHistory } from './components/DeliveryHistory';
import { CustomersManager } from './components/CustomersManager';
import { OrderDetailModal } from './components/OrderDetailModal';
import { NewOrderModal } from './components/NewOrderModal';
import { AddDriverModal } from './components/AddDriverModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dispatch');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [isSimulatingGps, setIsSimulatingGps] = useState(true);
  const [isAutoDispatching, setIsAutoDispatching] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Show Toast helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Fetch initial data from server APIs
  const refreshData = useCallback(async () => {
    try {
      const [ordersRes, driversRes, customersRes] = await Promise.all([
        fetch('/api/orders').catch(() => null),
        fetch('/api/drivers').catch(() => null),
        fetch('/api/customers').catch(() => null),
      ]);

      if (ordersRes && ordersRes.ok) {
        const data = await ordersRes.json();
        if (Array.isArray(data) && data.length > 0) setOrders(data);
      }
      if (driversRes && driversRes.ok) {
        const data = await driversRes.json();
        if (Array.isArray(data) && data.length > 0) setDrivers(data);
      }
      if (customersRes && customersRes.ok) {
        const data = await customersRes.json();
        if (Array.isArray(data) && data.length > 0) setCustomers(data);
      }
    } catch {
      // Fallback already pre-seeded with rich INITIAL constants
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // GPS Simulation Interval: Gently nudges active courier coordinates along their transit route
  useEffect(() => {
    if (!isSimulatingGps) return;

    const interval = setInterval(() => {
      setDrivers((prevDrivers) =>
        prevDrivers.map((drv) => {
          if (drv.status !== 'delivering') return drv;

          // Jiggle slightly towards dropoff coordinates
          const deltaLat = (Math.random() - 0.48) * 0.0015;
          const deltaLng = (Math.random() - 0.48) * 0.0015;

          return {
            ...drv,
            currentCoords: {
              lat: drv.currentCoords.lat + deltaLat,
              lng: drv.currentCoords.lng + deltaLng,
            },
            lastUpdated: 'Just now',
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulatingGps]);

  // Derived KPIs
  const stats: SystemStats = {
    totalOrders: orders.length,
    activeDeliveries: orders.filter((o) => o.status === 'in_transit' || o.status === 'picked_up').length,
    pendingDispatch: orders.filter((o) => o.status === 'pending').length,
    deliveredToday: orders.filter((o) => o.status === 'delivered').length,
    activeDriversCount: drivers.filter((d) => d.status === 'available' || d.status === 'delivering').length,
    totalDriversCount: drivers.length,
    averageEtaMinutes:
      orders.length > 0 ? Math.round(orders.reduce((sum, o) => sum + o.etaMinutes, 0) / orders.length) : 18,
    onTimeDeliveryRate: 97.4,
    averageRating: 4.9,
  };

  // Assign Driver to Order Handler
  const handleAssignDriver = async (orderId: string, driverId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
        setDrivers((prev) => prev.map((d) => (d.id === driverId ? data.driver : d)));
        showToast(`Courier ${data.driver.name} assigned to ${data.order.orderNumber}`);
      } else {
        // Local state fallback
        const drv = drivers.find((d) => d.id === driverId);
        if (!drv) return;
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'assigned',
                  assignedDriverId: drv.id,
                  assignedDriverName: drv.name,
                  assignedDriverVehicle: drv.vehicleType,
                }
              : o
          )
        );
        setDrivers((prev) =>
          prev.map((d) => (d.id === driverId ? { ...d, status: 'delivering', activeOrderId: orderId } : d))
        );
        showToast(`Courier assigned successfully`);
      }
    } catch {
      showToast('Assignment saved locally', 'info');
    }
  };

  // Smart Auto-Dispatch Handler
  const handleAutoDispatch = async () => {
    setIsAutoDispatching(true);
    try {
      const res = await fetch('/api/orders/auto-dispatch', {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        showToast(
          `Smart Dispatch: Successfully matched and routed ${data.dispatchedCount} orders to nearest couriers!`
        );
        await refreshData();
      } else {
        showToast('Auto-dispatch finished', 'info');
      }
    } catch {
      showToast('Auto-dispatch finished', 'info');
    } finally {
      setIsAutoDispatching(false);
    }
  };

  // Update Order Status Handler
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(updated);
        }
        showToast(`Order status updated to ${status.replace('_', ' ').toUpperCase()}`);
        await refreshData();
      } else {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
        showToast(`Order status updated`);
      }
    } catch {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    }
  };

  // Update Driver Status Handler
  const handleUpdateDriverStatus = async (driverId: string, status: DriverStatus) => {
    try {
      const res = await fetch(`/api/drivers/${driverId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const updated = await res.json();
        setDrivers((prev) => prev.map((d) => (d.id === driverId ? updated : d)));
        showToast(`Courier status changed to ${status.toUpperCase()}`);
      } else {
        setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, status } : d)));
      }
    } catch {
      setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, status } : d)));
    }
  };

  // Create Order Handler
  const handleCreateOrder = async (orderData: any) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        const newOrder = await res.json();
        setOrders((prev) => [newOrder, ...prev]);
        showToast(`Order ${newOrder.orderNumber} created with ETA ${newOrder.etaMinutes} mins!`);
      }
    } catch {
      showToast('Order queued in dispatch system');
    }
  };

  // Add Driver Handler
  const handleAddDriver = async (driverData: Partial<Driver>) => {
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driverData),
      });

      if (res.ok) {
        const newDrv = await res.json();
        setDrivers((prev) => [...prev, newDrv]);
        showToast(`Courier ${newDrv.name} registered into active fleet!`);
      }
    } catch {
      showToast('Courier added to fleet roster');
    }
  };

  // Add Customer Handler
  const handleAddCustomer = async (custData: Partial<Customer>) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custData),
      });

      if (res.ok) {
        const newCust = await res.json();
        setCustomers((prev) => [...prev, newCust]);
        showToast(`Customer ${newCust.name} added to address book`);
      }
    } catch {
      showToast('Customer registered');
    }
  };

  // Reset Data Handler
  const handleResetData = async () => {
    try {
      await fetch('/api/reset-data', { method: 'POST' });
      await refreshData();
      showToast('System data re-initialized to default demo state', 'info');
    } catch {
      setOrders(INITIAL_ORDERS);
      setDrivers(INITIAL_DRIVERS);
      setCustomers(INITIAL_CUSTOMERS);
      showToast('Demo data reloaded', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl text-xs font-medium text-white animate-in slide-in-from-top-2">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header & Tab Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingOrdersCount={stats.pendingDispatch}
        activeDeliveriesCount={stats.activeDeliveries}
        availableDriversCount={drivers.filter((d) => d.status === 'available').length}
        onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
        onAutoDispatch={handleAutoDispatch}
        onResetData={handleResetData}
        isAutoDispatching={isAutoDispatching}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dispatch' && (
          <DispatchOverview
            orders={orders}
            drivers={drivers}
            stats={stats}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
            onSelectDriver={(drv) => {
              setSelectedDriver(drv);
              setActiveTab('drivers');
            }}
            onAssignDriver={handleAssignDriver}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onAutoDispatch={handleAutoDispatch}
            onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
            isSimulatingGps={isSimulatingGps}
            onToggleSimulatingGps={() => setIsSimulatingGps(!isSimulatingGps)}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersPipeline
            orders={orders}
            drivers={drivers}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
            onAssignDriver={handleAssignDriver}
            onUpdateStatus={handleUpdateOrderStatus}
            onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
          />
        )}

        {activeTab === 'drivers' && (
          <DriversRoster
            drivers={drivers}
            onSelectDriver={(drv) => setSelectedDriver(drv)}
            onUpdateDriverStatus={handleUpdateDriverStatus}
            onOpenAddDriver={() => setIsAddDriverModalOpen(true)}
          />
        )}

        {activeTab === 'eta_studio' && <EtaPredictorStudio />}

        {activeTab === 'customer_portal' && (
          <CustomerTrackingPortal orders={orders} drivers={drivers} />
        )}

        {activeTab === 'history' && (
          <DeliveryHistory orders={orders} drivers={drivers} onSelectOrder={(ord) => setSelectedOrder(ord)} />
        )}

        {activeTab === 'customers' && (
          <CustomersManager customers={customers} onAddCustomer={handleAddCustomer} />
        )}
      </main>

      {/* Modals & Drawers */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        customers={customers}
        onCreateOrder={handleCreateOrder}
      />

      <AddDriverModal
        isOpen={isAddDriverModalOpen}
        onClose={() => setIsAddDriverModalOpen(false)}
        onAddDriver={handleAddDriver}
      />

      {/* Footer (Clean enterprise style, no download mentions) */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Velox Smart Logistics Telematics Engine • Operations Tower SF</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>ML Model v2.4 (R² 0.942)</span>
            <span>SLA Compliance: 97.4%</span>
            <span>Active Drivers: {drivers.length}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
