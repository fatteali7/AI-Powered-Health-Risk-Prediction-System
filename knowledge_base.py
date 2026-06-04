class HealthKnowledgeBase:
    """
    Rule-based system using Forward Chaining (Module 2.2)
    Represents medical domain knowledge as IF-THEN rules.
    """

    def __init__(self):
        # These are the facts we reason over
        self.facts = {}
        # Fired rules
        self.fired_rules = []

    def load_facts(self, patient_data: dict):
        """Convert patient input into logical facts."""
        self.facts = {
            'high_bmi':         patient_data['bmi'] > 30,
            'very_high_bmi':    patient_data['bmi'] > 35,
            'elderly':          patient_data['age'] > 60,
            'middle_aged':      40 < patient_data['age'] <= 60,
            'high_bp':          patient_data['blood_pressure'] > 130,
            'very_high_bp':     patient_data['blood_pressure'] > 160,
            'high_cholesterol': patient_data['cholesterol'] > 200,
            'diabetic_range':   patient_data['blood_sugar'] > 140,
            'smoker':           patient_data['smoking'] == 1,
            'inactive':         patient_data['exercise_hours'] < 2,
            'family_risk':      patient_data['family_history'] == 1,
            'drinker':          patient_data['alcohol'] == 1,
            'sleep_deprived':   patient_data['sleep_hours'] < 6,
        }
        self.fired_rules = []

    def forward_chain(self):
        """
        Forward Chaining Engine:
        Apply rules until no new facts can be derived.
        Returns lists of triggered health warnings, recommendations, and diet plans.
        """
        warnings = []
        recommendations = []
        diet_plans = []

        # ---------- RULES & WARNINGS ----------
        if self.facts['high_bp'] and self.facts['high_cholesterol']:
            warnings.append("⚠️ Combined high BP + high cholesterol = elevated cardiovascular risk.")
            self.fired_rules.append("R1: Cardiovascular Risk")

        if self.facts['diabetic_range'] and self.facts['high_bmi']:
            warnings.append("⚠️ High BMI + elevated blood sugar suggests Type-2 Diabetes risk.")
            self.fired_rules.append("R2: Diabetes Risk")

        if self.facts['very_high_bmi'] and self.facts['inactive']:
            warnings.append("⚠️ Severe obesity + inactivity — very high metabolic risk.")
            self.fired_rules.append("R3: Metabolic Risk")

        if self.facts['smoker'] and self.facts['high_bp']:
            warnings.append("⚠️ Smoking + high blood pressure significantly raises stroke risk.")
            self.fired_rules.append("R4: Stroke Risk")

        if self.facts['elderly'] and self.facts['family_risk']:
            warnings.append("⚠️ Age > 60 with family history — recommend regular cardiac screening.")
            self.fired_rules.append("R5: Genetic+Age Risk")

        if self.facts['sleep_deprived'] and self.facts['drinker']:
            warnings.append("⚠️ Poor sleep + alcohol = risk of hypertension and mental health issues.")
            self.fired_rules.append("R6: Lifestyle Risk")

        # ---------- RECOMMENDATIONS ----------
        if self.facts['high_bmi'] or self.facts['inactive']:
            recommendations.append("🏃 Increase physical activity to at least 30 min/day, 5 days/week.")
        if self.facts['smoker']:
            recommendations.append("🚭 Quit smoking immediately. Seek cessation support.")
        if self.facts['high_bp']:
            recommendations.append("💊 Monitor blood pressure daily. Reduce salt intake.")
        if self.facts['high_cholesterol']:
            recommendations.append("🩺 Consult a doctor about lipid-lowering strategies.")
        if self.facts['diabetic_range']:
            recommendations.append("🩸 Get fasting blood glucose test. Consult an endocrinologist.")
        if self.facts['sleep_deprived']:
            recommendations.append("😴 Aim for 7-9 hours of sleep per night.")
        if self.facts['drinker']:
            recommendations.append("🍺 Reduce alcohol consumption to recommended safe limits.")
        if self.facts['family_risk']:
            recommendations.append("🏥 Schedule regular preventive health checkups every 6 months.")

        # ---------- DIET PLANS ----------
        if self.facts['high_bp']:
            diet_plans.append("🥦 **DASH Diet:** Focus on vegetables, fruits, and whole grains. Reduce sodium (salt) intake to lower blood pressure.")
        if self.facts['high_cholesterol']:
            diet_plans.append("🥑 **Mediterranean Diet:** High in healthy fats (olive oil, avocados), fish, and nuts. Strictly limit saturated and trans fats.")
        if self.facts['diabetic_range']:
            diet_plans.append("🥗 **Low-Glycemic Diet:** Avoid sugary foods and refined carbs. Eat more fiber-rich foods like beans, lentils, and leafy greens to stabilize blood sugar.")
        if self.facts['high_bmi']:
            diet_plans.append("🍽️ **Caloric Deficit Diet:** Practice portion control. Prioritize lean proteins and vegetables over calorie-dense processed foods.")

        if not warnings:
            warnings.append("✅ No critical rule violations detected.")
        if not recommendations:
            recommendations.append("✅ Maintain your current healthy lifestyle!")
        if not diet_plans:
            diet_plans.append("🍏 Maintain your current balanced diet!")

        return warnings, recommendations, diet_plans