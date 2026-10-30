# Smart Delivery Management System (VELOX)

An enterprise platform for managing customer orders, fleet delivery personnel, automated dispatch assignments, real-time status tracking, delivery history, and predictive machine learning ETA modeling.

---

## Architecture Overview

This project comprises three tightly integrated components:

1. **Frontend (React 19 + TypeScript + Tailwind CSS)**
   - **Operations & Live Map Tower**: Interactive cartographic GPS telematics, driver routes, and dropoff markers.
   - **Orders Pipeline**: Multi-stage state machine (`pending` ➔ `assigned` ➔ `picked_up` ➔ `in_transit` ➔ `delivered`), urgency tiers, and delivery PIN verification.
   - **Fleet Personnel Management**: Live courier statuses (`available`, `delivering`, `break`, `offline`), vehicle modalities, battery/fuel telemetry, and ratings.
   - **Interactive ML ETA Studio**: Real-time multi-factor parameter simulation sandbox with SHAP-style feature attribution bars.
   - **Customer Live Tracking Portal**: End-user tracking view with step-by-step progress stepper, courier details, and verification PIN.
   - **Delivery History & Analytics**: SLA compliance reporting, historical metrics, and CSV export.
   - **Customers Directory**: Central customer registry with delivery addresses and notes.

2. **Full-Stack Backend (Node.js + Express + TypeScript)**
   - `GET /api/orders` & `POST /api/orders`: Order lifecycle and dynamic routing.
   - `POST /api/orders/auto-dispatch`: Automated multi-factor courier-to-order matching algorithm.
   - `POST /api/orders/:id/assign`: Courier assignment and ETA recalculation.
   - `PATCH /api/orders/:id/status`: Status pipeline progression and completion audit trail.
   - `GET /api/drivers` & `PATCH /api/drivers/:id/status`: Fleet telematics and status updates.
   - `GET /api/customers` & `POST /api/customers`: Customer address registry.
   - `POST /api/predict-eta`: Dedicated predictive regression engine.
   - `GET /api/stats`: Aggregate fleet KPIs.

3. **Predictive ML ETA Component (Python)**
   - Located in `/backend_python/`
   - Gradient-boosted regression formulation factoring:
     - Distance (km)
     - Vehicle Modalities (E-Bike, Scooter, EV Cargo, Car, Van)
     - Traffic Congestion Index & Diurnal Rush Hour Multipliers
     - Micro-Climate Weather Friction (Clear, Rain, Storm, Snow)
     - Payload Weight Drag (kg)
     - Depot Fulfillment Staging & Doorstep Handover / Parking
   - Includes standalone CLI mode (`python3 eta_predictor.py`), test suite (`python3 test_predictor.py`), and JSON pipeline.

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ & npm
- Python 3.9+ (optional for running standalone Python scripts)

### 2. Frontend & Backend Setup
```bash
# Install dependencies
npm install

# Start full-stack development server on port 3000
npm run dev

# Or build for production
npm run build
npm start
```

### 3. Python ML Component Execution
```bash
cd backend_python

# Run interactive demo
python3 eta_predictor.py

# Run unit tests
python3 test_predictor.py

# Run with JSON stdin input
echo '{"distanceKm": 5.0, "vehicleType": "scooter", "trafficLevel": "heavy"}' | python3 eta_predictor.py --json
```

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/orders` | List and filter active and past orders |
| `POST` | `/api/orders` | Create a new delivery order with ML ETA |
| `POST` | `/api/orders/:id/assign` | Assign a courier to an order |
| `POST` | `/api/orders/auto-dispatch` | Smart batch assignment of pending orders |
| `PATCH` | `/api/orders/:id/status` | Advance order status with audit log |
| `GET` | `/api/drivers` | Retrieve fleet couriers and statuses |
| `POST` | `/api/drivers` | Register a new courier |
| `PATCH` | `/api/drivers/:id/status` | Update driver availability status |
| `GET` | `/api/customers` | Retrieve customer address directory |
| `POST` | `/api/customers` | Register a new customer |
| `POST` | `/api/predict-eta` | Calculate predictive ETA with feature breakdown |
| `GET` | `/api/stats` | Retrieve aggregate fleet performance KPIs |
| `POST` | `/api/reset-data` | Revert to baseline demo dataset |
