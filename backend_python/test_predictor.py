#!/usr/bin/env python3
"""
Unit test suite for the Smart Delivery ETA Predictor
"""
import unittest
from eta_predictor import DeliveryEtaPredictor

class TestEtaPredictor(unittest.TestCase):
    def setUp(self):
        self.predictor = DeliveryEtaPredictor()

    def test_baseline_prediction_reasonable_range(self):
        # 5 km bike in clear weather, moderate traffic
        res = self.predictor.predict(
            distance_km=5.0,
            vehicle_type="bike",
            traffic_level="moderate",
            weather_condition="clear",
            package_weight_kg=2.0,
            time_of_day_hour=14,
            prep_time_minutes=5.0
        )
        self.assertIn("predicted_eta_minutes", res)
        # Should be between 15 and 35 mins
        self.assertGreaterEqual(res["predicted_eta_minutes"], 15.0)
        self.assertLessEqual(res["predicted_eta_minutes"], 35.0)
        self.assertGreaterEqual(res["confidence_score_pct"], 80.0)

    def test_traffic_escalation(self):
        low_traffic = self.predictor.predict(distance_km=10.0, vehicle_type="car", traffic_level="low", time_of_day_hour=14)
        heavy_traffic = self.predictor.predict(distance_km=10.0, vehicle_type="car", traffic_level="heavy", time_of_day_hour=14)
        self.assertGreater(heavy_traffic["predicted_eta_minutes"], low_traffic["predicted_eta_minutes"])

    def test_weather_penalty(self):
        clear_weather = self.predictor.predict(distance_km=8.0, vehicle_type="bike", weather_condition="clear")
        storm_weather = self.predictor.predict(distance_km=8.0, vehicle_type="bike", weather_condition="storm")
        self.assertGreater(storm_weather["predicted_eta_minutes"], clear_weather["predicted_eta_minutes"])

    def test_vehicle_comparison(self):
        # On a clear open highway (15 km), car should be faster than a bike
        bike_res = self.predictor.predict(distance_km=15.0, vehicle_type="bike", traffic_level="low")
        car_res = self.predictor.predict(distance_km=15.0, vehicle_type="car", traffic_level="low")
        self.assertLess(car_res["breakdown"]["base_travel_minutes"], bike_res["breakdown"]["base_travel_minutes"])

if __name__ == "__main__":
    unittest.main()
