export type VehicleType = 'bike' | 'scooter' | 'car' | 'van' | 'ev_cargo';

export type DriverStatus = 'available' | 'delivering' | 'break' | 'offline';

export type OrderStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';

export type OrderPriority = 'standard' | 'express' | 'urgent';

export type TrafficLevel = 'low' | 'moderate' | 'heavy' | 'severe';

export type WeatherCondition = 'clear' | 'rain' | 'storm' | 'snow';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  coordinates: Coordinates;
  notes?: string;
  totalOrders: number;
  registeredDate: string;
  rating?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  licensePlate: string;
  status: DriverStatus;
  currentCoords: Coordinates;
  rating: number;
  completedDeliveriesToday: number;
  totalLifetimeDeliveries: number;
  activeOrderId: string | null;
  batteryOrFuelLevel: number; // percentage 0-100
  maxCapacityKg: number;
  avatarUrl: string;
  lastUpdated: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface EtaBreakdown {
  baseTravelMinutes: number;
  trafficDelayMinutes: number;
  weatherDelayMinutes: number;
  prepBufferMinutes: number;
  stopHandoverMinutes: number;
  totalPredictedMinutes: number;
  confidenceScore: number; // 0 - 100%
  factors: {
    label: string;
    impact: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

export interface StatusTimelineEntry {
  status: OrderStatus;
  timestamp: string;
  note: string;
  updatedBy?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryCoords: Coordinates;
  pickupAddress: string;
  pickupCoords: Coordinates;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  priority: OrderPriority;
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  assignedDriverVehicle?: VehicleType;
  createdAt: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime: string | null;
  distanceKm: number;
  packageWeightKg: number;
  etaMinutes: number;
  etaBreakdown: EtaBreakdown;
  statusTimeline: StatusTimelineEntry[];
  deliveryNotes: string;
  proofOfDeliveryPin: string;
  trafficCondition: TrafficLevel;
  weatherCondition: WeatherCondition;
}

export interface EtaPredictionRequest {
  distanceKm: number;
  vehicleType: VehicleType;
  trafficLevel: TrafficLevel;
  weatherCondition: WeatherCondition;
  packageWeightKg: number;
  timeOfDayHour: number; // 0 - 23
  prepTimeMinutes: number;
}

export interface EtaPredictionResponse {
  etaMinutes: number;
  etaFormatted: string;
  estimatedArrivalTime: string;
  confidenceScore: number;
  breakdown: EtaBreakdown;
  modelDetails: {
    algorithm: string;
    r2Score: number;
    maeMinutes: number;
    baselineVsSmartSavingsMinutes: number;
  };
}

export interface SystemStats {
  totalOrders: number;
  activeDeliveries: number;
  pendingDispatch: number;
  deliveredToday: number;
  activeDriversCount: number;
  totalDriversCount: number;
  averageEtaMinutes: number;
  onTimeDeliveryRate: number; // e.g. 96.4%
  averageRating: number;
}
