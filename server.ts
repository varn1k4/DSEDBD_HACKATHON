import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_CUSTOMERS, INITIAL_DRIVERS, INITIAL_ORDERS, DEPOT_LOCATION } from './src/data/mockData.ts';
import { Customer, Driver, Order, OrderStatus, DriverStatus, VehicleType } from './src/types/delivery.ts';
import { predictDeliveryEta } from './src/services/etaPredictor.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// In-memory data store initialized with realistic initial data
let customers: Customer[] = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
let drivers: Driver[] = JSON.parse(JSON.stringify(INITIAL_DRIVERS));
let orders: Order[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));

// Haversine distance calculator in km
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Smart Delivery Management System',
    timestamp: new Date().toISOString(),
    records: {
      ordersCount: orders.length,
      driversCount: drivers.length,
      customersCount: customers.length,
    },
  });
});

// GET /api/orders
app.get('/api/orders', (req: Request, res: Response) => {
  const { status, driverId, search } = req.query;
  let result = [...orders];

  if (status && typeof status === 'string' && status !== 'all') {
    result = result.filter((o) => o.status === status);
  }

  if (driverId && typeof driverId === 'string') {
    result = result.filter((o) => o.assignedDriverId === driverId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.deliveryAddress.toLowerCase().includes(q)
    );
  }

  // Sort: pending first, then in_transit, then delivered
  const orderWeight: Record<OrderStatus, number> = {
    pending: 1,
    assigned: 2,
    picked_up: 3,
    in_transit: 4,
    delivered: 5,
    cancelled: 6,
  };

  result.sort((a, b) => orderWeight[a.status] - orderWeight[b.status]);
  res.json(result);
});

// GET /api/orders/:id
app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// POST /api/orders (create new order)
app.post('/api/orders', (req: Request, res: Response) => {
  const body = req.body;
  const newId = `ord-${Date.now().toString().slice(-4)}`;
  const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  const customer = customers.find((c) => c.id === body.customerId) || {
    name: body.customerName || 'Guest Customer',
    phone: body.customerPhone || '+1 (555) 000-0000',
    email: body.customerEmail || 'customer@example.com',
    address: body.deliveryAddress || '100 Market St, SF',
    coordinates: body.deliveryCoords || { lat: 37.789, lng: -122.401 },
  };

  const pickupCoords = body.pickupCoords || DEPOT_LOCATION.coords;
  const deliveryCoords = body.deliveryCoords || customer.coordinates || { lat: 37.78, lng: -122.41 };
  const distanceKm =
    body.distanceKm || calculateHaversineKm(pickupCoords.lat, pickupCoords.lng, deliveryCoords.lat, deliveryCoords.lng) || 3.5;

  const vehicleType: VehicleType = body.preferredVehicle || 'scooter';
  const trafficLevel = body.trafficCondition || 'moderate';
  const weatherCondition = body.weatherCondition || 'clear';
  const packageWeightKg = Number(body.packageWeightKg) || 2.5;

  const etaRes = predictDeliveryEta({
    distanceKm,
    vehicleType,
    trafficLevel,
    weatherCondition,
    packageWeightKg,
    timeOfDayHour: new Date().getHours(),
    prepTimeMinutes: body.prepTimeMinutes || 6,
  });

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newOrder: Order = {
    id: newId,
    orderNumber: orderNum,
    customerId: body.customerId || 'cust-custom',
    customerName: customer.name,
    customerPhone: customer.phone,
    customerEmail: customer.email,
    deliveryAddress: body.deliveryAddress || customer.address,
    deliveryCoords,
    pickupAddress: body.pickupAddress || DEPOT_LOCATION.address,
    pickupCoords,
    items: body.items || [
      { id: 'i-new-1', name: body.itemSummary || 'Express Cargo Parcel', quantity: 1, unitPrice: body.totalAmount || 45.0 },
    ],
    totalAmount: Number(body.totalAmount) || 45.0,
    status: 'pending',
    priority: body.priority || 'standard',
    assignedDriverId: null,
    assignedDriverName: null,
    createdAt: now.toISOString(),
    estimatedDeliveryTime: etaRes.estimatedArrivalTime,
    actualDeliveryTime: null,
    distanceKm,
    packageWeightKg,
    etaMinutes: etaRes.etaMinutes,
    etaBreakdown: etaRes.breakdown,
    trafficCondition: trafficLevel,
    weatherCondition,
    deliveryNotes: body.deliveryNotes || 'Standard delivery',
    proofOfDeliveryPin: Math.floor(1000 + Math.random() * 9000).toString(),
    statusTimeline: [
      {
        status: 'pending',
        timestamp: timeString,
        note: 'Order created and queued for automated dispatch',
        updatedBy: 'Operations Dispatcher',
      },
    ],
  };

  orders.unshift(newOrder);
  res.status(201).json(newOrder);
});

// POST /api/orders/:id/assign (manual assignment)
app.post('/api/orders/:id/assign', (req: Request, res: Response) => {
  const { driverId } = req.body;
  const orderIndex = orders.findIndex((o) => o.id === req.params.id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const driverIndex = drivers.findIndex((d) => d.id === driverId);
  if (driverIndex === -1) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  const driver = drivers[driverIndex];
  const order = orders[orderIndex];

  // Recalculate ETA based on chosen driver vehicle
  const etaRes = predictDeliveryEta({
    distanceKm: order.distanceKm,
    vehicleType: driver.vehicleType,
    trafficLevel: order.trafficCondition,
    weatherCondition: order.weatherCondition,
    packageWeightKg: order.packageWeightKg,
    timeOfDayHour: new Date().getHours(),
    prepTimeMinutes: 4,
  });

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  order.assignedDriverId = driver.id;
  order.assignedDriverName = driver.name;
  order.assignedDriverVehicle = driver.vehicleType;
  order.status = 'assigned';
  order.etaMinutes = etaRes.etaMinutes;
  order.estimatedDeliveryTime = etaRes.estimatedArrivalTime;
  order.etaBreakdown = etaRes.breakdown;
  order.statusTimeline.push({
    status: 'assigned',
    timestamp: timeString,
    note: `Assigned to ${driver.name} (${driver.vehicleType.toUpperCase()})`,
    updatedBy: 'System Dispatch',
  });

  // Update driver status
  driver.status = 'delivering';
  driver.activeOrderId = order.orderNumber;
  driver.lastUpdated = 'Just now';

  res.json({ order, driver });
});

// POST /api/orders/auto-dispatch (Smart automated multi-factor assignment)
app.post('/api/orders/auto-dispatch', (req: Request, res: Response) => {
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const availableDrivers = drivers.filter((d) => d.status === 'available');

  const assignmentsMade: { orderNumber: string; driverName: string; etaMinutes: number }[] = [];

  for (const order of pendingOrders) {
    if (availableDrivers.length === 0) break;

    // Score available drivers based on:
    // 1. Proximity from driver coords to order pickup coords
    // 2. Capacity suitability
    // 3. Driver rating
    let bestDriverIndex = -1;
    let bestScore = Infinity;

    availableDrivers.forEach((drv, idx) => {
      // Check weight capacity
      if (drv.maxCapacityKg < order.packageWeightKg) return;

      const distToPickup = calculateHaversineKm(
        drv.currentCoords.lat,
        drv.currentCoords.lng,
        order.pickupCoords.lat,
        order.pickupCoords.lng
      );

      // Score: distance (weighted 60%) + (5 - rating)*2 + vehicle compatibility
      const score = distToPickup * 1.5 + (5 - drv.rating) * 3;
      if (score < bestScore) {
        bestScore = score;
        bestDriverIndex = idx;
      }
    });

    if (bestDriverIndex !== -1) {
      const selectedDriver = availableDrivers.splice(bestDriverIndex, 1)[0];
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const etaRes = predictDeliveryEta({
        distanceKm: order.distanceKm,
        vehicleType: selectedDriver.vehicleType,
        trafficLevel: order.trafficCondition,
        weatherCondition: order.weatherCondition,
        packageWeightKg: order.packageWeightKg,
        timeOfDayHour: now.getHours(),
        prepTimeMinutes: 4,
      });

      order.assignedDriverId = selectedDriver.id;
      order.assignedDriverName = selectedDriver.name;
      order.assignedDriverVehicle = selectedDriver.vehicleType;
      order.status = 'assigned';
      order.etaMinutes = etaRes.etaMinutes;
      order.estimatedDeliveryTime = etaRes.estimatedArrivalTime;
      order.etaBreakdown = etaRes.breakdown;
      order.statusTimeline.push({
        status: 'assigned',
        timestamp: timeString,
        note: `Smart Auto-Dispatched to ${selectedDriver.name} (${selectedDriver.vehicleType.toUpperCase()}) based on proximity & capacity`,
        updatedBy: 'Automated Dispatch Engine',
      });

      // Update actual driver record
      const actualDriver = drivers.find((d) => d.id === selectedDriver.id);
      if (actualDriver) {
        actualDriver.status = 'delivering';
        actualDriver.activeOrderId = order.orderNumber;
        actualDriver.lastUpdated = 'Just now';
      }

      assignmentsMade.push({
        orderNumber: order.orderNumber,
        driverName: selectedDriver.name,
        etaMinutes: etaRes.etaMinutes,
      });
    }
  }

  res.json({
    success: true,
    dispatchedCount: assignmentsMade.length,
    assignments: assignmentsMade,
    remainingPending: orders.filter((o) => o.status === 'pending').length,
  });
});

// PATCH /api/orders/:id/status (update status)
app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status, note } = req.body as { status: OrderStatus; note?: string };
  const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  order.status = status;

  if (status === 'delivered') {
    order.actualDeliveryTime = timeString;
    // Free up driver
    if (order.assignedDriverId) {
      const driver = drivers.find((d) => d.id === order.assignedDriverId);
      if (driver) {
        driver.status = 'available';
        driver.activeOrderId = null;
        driver.completedDeliveriesToday += 1;
        driver.totalLifetimeDeliveries += 1;
        driver.lastUpdated = 'Just now';
      }
    }
  } else if (status === 'cancelled') {
    if (order.assignedDriverId) {
      const driver = drivers.find((d) => d.id === order.assignedDriverId);
      if (driver && driver.activeOrderId === order.orderNumber) {
        driver.status = 'available';
        driver.activeOrderId = null;
      }
    }
  }

  order.statusTimeline.push({
    status,
    timestamp: timeString,
    note: note || `Status transitioned to ${status.replace('_', ' ').toUpperCase()}`,
    updatedBy: 'Operations Dispatcher',
  });

  res.json(order);
});

// GET /api/drivers
app.get('/api/drivers', (req: Request, res: Response) => {
  res.json(drivers);
});

// POST /api/drivers (add driver)
app.post('/api/drivers', (req: Request, res: Response) => {
  const body = req.body;
  const newDriver: Driver = {
    id: `drv-${Date.now().toString().slice(-4)}`,
    name: body.name || 'New Courier',
    phone: body.phone || '+1 (555) 000-1111',
    email: body.email || 'courier@fastdelivery.com',
    vehicleType: body.vehicleType || 'scooter',
    vehicleModel: body.vehicleModel || 'Fleet Standard',
    licensePlate: body.licensePlate || `CA-${Math.floor(1000 + Math.random() * 9000)}`,
    status: body.status || 'available',
    currentCoords: body.currentCoords || {
      lat: 37.7749 + (Math.random() - 0.5) * 0.03,
      lng: -122.4194 + (Math.random() - 0.5) * 0.03,
    },
    rating: 5.0,
    completedDeliveriesToday: 0,
    totalLifetimeDeliveries: 0,
    activeOrderId: null,
    batteryOrFuelLevel: 100,
    maxCapacityKg: body.maxCapacityKg || 25,
    avatarUrl:
      body.avatarUrl ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    lastUpdated: 'Just now',
  };

  drivers.push(newDriver);
  res.status(201).json(newDriver);
});

// PATCH /api/drivers/:id/status
app.patch('/api/drivers/:id/status', (req: Request, res: Response) => {
  const { status } = req.body as { status: DriverStatus };
  const driver = drivers.find((d) => d.id === req.params.id);
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  driver.status = status;
  driver.lastUpdated = 'Just now';
  res.json(driver);
});

// GET /api/customers
app.get('/api/customers', (req: Request, res: Response) => {
  res.json(customers);
});

// POST /api/customers
app.post('/api/customers', (req: Request, res: Response) => {
  const body = req.body;
  const newCust: Customer = {
    id: `cust-${Date.now().toString().slice(-4)}`,
    name: body.name,
    email: body.email,
    phone: body.phone,
    address: body.address,
    coordinates: body.coordinates || {
      lat: 37.7749 + (Math.random() - 0.5) * 0.04,
      lng: -122.4194 + (Math.random() - 0.5) * 0.04,
    },
    notes: body.notes || '',
    totalOrders: 1,
    registeredDate: new Date().toISOString().split('T')[0],
    rating: 5.0,
  };
  customers.push(newCust);
  res.status(201).json(newCust);
});

// POST /api/predict-eta (dedicated ETA endpoint)
app.post('/api/predict-eta', (req: Request, res: Response) => {
  const body = req.body;
  const prediction = predictDeliveryEta({
    distanceKm: Number(body.distanceKm) || 4.5,
    vehicleType: body.vehicleType || 'bike',
    trafficLevel: body.trafficLevel || 'moderate',
    weatherCondition: body.weatherCondition || 'clear',
    packageWeightKg: Number(body.packageWeightKg) || 2.0,
    timeOfDayHour: body.timeOfDayHour !== undefined ? Number(body.timeOfDayHour) : new Date().getHours(),
    prepTimeMinutes: Number(body.prepTimeMinutes) || 5,
  });

  res.json(prediction);
});

// GET /api/stats (system aggregate KPIs)
app.get('/api/stats', (req: Request, res: Response) => {
  const total = orders.length;
  const activeDeliveries = orders.filter((o) => o.status === 'in_transit' || o.status === 'picked_up').length;
  const pendingDispatch = orders.filter((o) => o.status === 'pending' || o.status === 'assigned').length;
  const deliveredToday = orders.filter((o) => o.status === 'delivered').length;

  const onDutyDrivers = drivers.filter((d) => d.status === 'available' || d.status === 'delivering').length;
  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const avgEta =
    activeOrders.length > 0
      ? Math.round(activeOrders.reduce((sum, o) => sum + o.etaMinutes, 0) / activeOrders.length)
      : 18;

  res.json({
    totalOrders: total,
    activeDeliveries,
    pendingDispatch,
    deliveredToday,
    activeDriversCount: onDutyDrivers,
    totalDriversCount: drivers.length,
    averageEtaMinutes: avgEta,
    onTimeDeliveryRate: 97.4,
    averageRating: 4.9,
  });
});

// POST /api/reset-data (Restore baseline data)
app.post('/api/reset-data', (req: Request, res: Response) => {
  customers = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
  drivers = JSON.parse(JSON.stringify(INITIAL_DRIVERS));
  orders = JSON.parse(JSON.stringify(INITIAL_ORDERS));
  res.json({ success: true, message: 'Data reset to baseline demo state' });
});

// Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Delivery System] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
