from knowledge_base import HealthKnowledgeBase
import joblib
import numpy as np

class HealthRiskAgent:
    """
    Goal-Based Intelligent Agent (Module 1.2)
    Perceives patient data, runs neural network prediction,
    applies knowledge base rules, and returns a structured result.
    """

    def __init__(self):
        self.model = joblib.load('saved_model/health_model.pkl')
        self.scaler = joblib.load('saved_model/scaler.pkl')
        self.kb = HealthKnowledgeBase()
        self.risk_labels = {0: 'Low', 1: 'Medium', 2: 'High'}
        self.risk_colors = {0: 'green', 1: 'orange', 2: 'red'}

    def perceive(self, form_data: dict) -> np.ndarray:
        features = np.array([[
            float(form_data['age']),
            float(form_data['bmi']),
            float(form_data['blood_pressure']),
            float(form_data['cholesterol']),
            float(form_data['blood_sugar']),
            int(form_data['smoking']),
            float(form_data['exercise_hours']),
            int(form_data['family_history']),
            int(form_data['alcohol']),
            float(form_data['sleep_hours'])
        ]])
        return features

    def decide_and_act(self, form_data: dict) -> dict:
        # Perceive
        X = self.perceive(form_data)
        X_scaled = self.scaler.transform(X)

        # Neural network prediction
        predictions, confidences = self.model.predict(X_scaled)
        risk_class = int(predictions[0])
        confidence = float(confidences[0]) * 100

        # Override: if all vitals are clearly healthy, force Low risk
        healthy = (
            float(form_data['bmi']) <= 24.9 and
            float(form_data['blood_pressure']) <= 120 and
            float(form_data['cholesterol']) <= 180 and
            float(form_data['blood_sugar']) <= 99 and
            float(form_data['exercise_hours']) >= 5 and
            float(form_data['sleep_hours']) >= 7 and
            int(form_data['smoking']) == 0 and
            int(form_data['alcohol']) == 0
        )
        if healthy:
            risk_class = 0

        # Knowledge base forward chaining
        self.kb.load_facts({
            'bmi':            float(form_data['bmi']),
            'age':            float(form_data['age']),
            'blood_pressure': float(form_data['blood_pressure']),
            'cholesterol':    float(form_data['cholesterol']),
            'blood_sugar':    float(form_data['blood_sugar']),
            'smoking':        int(form_data['smoking']),
            'exercise_hours': float(form_data['exercise_hours']),
            'family_history': int(form_data['family_history']),
            'alcohol':        int(form_data['alcohol']),
            'sleep_hours':    float(form_data['sleep_hours']),
        })
        warnings, recommendations, diet_plans = self.kb.forward_chain()

        return {
            'risk_level':      self.risk_labels[risk_class],
            'risk_color':      self.risk_colors[risk_class],
            'confidence':      round(confidence, 2),
            'warnings':        warnings,
            'recommendations': recommendations,
            'diet_plans':      diet_plans,
            'fired_rules':     self.kb.fired_rules,
            'patient_data':    form_data   # passed for charts & report
        }