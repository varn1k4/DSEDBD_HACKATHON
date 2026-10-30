# Smart Delivery ETA Prediction Component (Python)

This component contains the machine learning regression model designed for the **Smart Delivery Management System**. It accurately forecasts delivery arrival time (ETA) under dynamic urban conditions.

## Key Features & Model Inputs
1. **Distance Metrics**: Route distance in kilometers.
2. **Vehicle Modality**: Base speed and traffic penetration parameters for Bike, Scooter, EV Cargo, Car, and Van.
3. **Traffic Congestion Index**: Multiplier factoring low, moderate, heavy, and severe traffic with rush hour diurnal cycle modifiers (morning & evening peaks).
4. **Weather Condition**: Real-time slowdown multipliers for clear, rain, storm, and snow.
5. **Payload Drag**: Package weight scaling factor.
6. **Fulfillment & Handover Buffer**: Depot prep time plus doorstep handover and parking friction.

## Quick Start

### 1. Run Interactive CLI Demo
```bash
python3 eta_predictor.py
```

### 2. Run Test Suite
```bash
python3 test_predictor.py
```

### 3. Programmatic Usage in Python
```python
from eta_predictor import DeliveryEtaPredictor

predictor = DeliveryEtaPredictor()
result = predictor.predict(
    distance_km=6.5,
    vehicle_type="scooter",
    traffic_level="heavy",
    weather_condition="rain",
    package_weight_kg=3.2,
    time_of_day_hour=18,
    prep_time_minutes=8.0
)

print(f"Predicted ETA: {result['predicted_eta_minutes']} mins")
print(f"Estimated Arrival: {result['estimated_arrival_time']}")
print(f"Confidence: {result['confidence_score_pct']}%")
```

### 4. JSON Stdin Pipeline (Direct Node/Express Interop)
```bash
echo '{"distanceKm": 7.5, "vehicleType": "bike", "trafficLevel": "moderate"}' | python3 eta_predictor.py --json
```
