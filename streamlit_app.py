import streamlit as st
from agent import HealthRiskAgent

st.set_page_config(
    page_title="AI Health Risk Predictor",
    page_icon="🧠",
    layout="centered"
)

# Initialize agent (loaded once per session)
@st.cache_resource
def load_agent():
    return HealthRiskAgent()

agent = load_agent()

st.title("🧠 AI Health Risk Predictor")
st.write("Enter your vitals below to get an AI-powered health risk assessment and personalized recommendations.")

with st.form("health_form"):
    st.subheader("Patient Vitals")
    col1, col2 = st.columns(2)
    
    with col1:
        age = st.number_input("Age", min_value=1.0, max_value=120.0, value=30.0, step=1.0)
        bmi = st.number_input("BMI", min_value=10.0, max_value=60.0, value=22.0, step=0.1)
        blood_pressure = st.number_input("Systolic Blood Pressure", min_value=70.0, max_value=250.0, value=120.0, step=1.0)
        cholesterol = st.number_input("Cholesterol Level (mg/dL)", min_value=100.0, max_value=400.0, value=180.0, step=1.0)
        blood_sugar = st.number_input("Fasting Blood Sugar (mg/dL)", min_value=50.0, max_value=300.0, value=90.0, step=1.0)
        
    with col2:
        exercise_hours = st.number_input("Exercise (Hours/Week)", min_value=0.0, max_value=50.0, value=3.0, step=0.5)
        sleep_hours = st.number_input("Sleep (Hours/Night)", min_value=0.0, max_value=24.0, value=7.0, step=0.5)
        smoking = st.selectbox("Do you smoke?", options=[0, 1], format_func=lambda x: "Yes" if x == 1 else "No")
        alcohol = st.selectbox("Do you consume alcohol?", options=[0, 1], format_func=lambda x: "Yes" if x == 1 else "No")
        family_history = st.selectbox("Family history of heart disease?", options=[0, 1], format_func=lambda x: "Yes" if x == 1 else "No")

    submitted = st.form_submit_button("Analyze My Health 🚀")

if submitted:
    form_data = {
        'age': age,
        'bmi': bmi,
        'blood_pressure': blood_pressure,
        'cholesterol': cholesterol,
        'blood_sugar': blood_sugar,
        'smoking': smoking,
        'exercise_hours': exercise_hours,
        'family_history': family_history,
        'alcohol': alcohol,
        'sleep_hours': sleep_hours
    }
    
    with st.spinner("AI is analyzing your data..."):
        result = agent.decide_and_act(form_data)
        
    st.divider()
    
    # Create Tabs to mimic the rich multi-page experience of the previous app
    tab1, tab2, tab3 = st.tabs(["📊 Overview", "💡 Recommendations", "🩺 Doctor Report"])
    
    risk_level = result['risk_level']
    conf = result['confidence']
    color = result['risk_color']
    
    with tab1:
        st.markdown("<br>", unsafe_allow_html=True)
        # Custom HTML for big bold label
        st.markdown(f"<h1 style='text-align: center; color: #FF2A75; font-size: 3.5rem;'><i>{risk_level} Risk</i></h1>", unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        cols = st.columns([1, 2, 1])
        with cols[1]:
            st.metric(label="AI Confidence Level", value=f"{conf}%", delta="High Precision")
        
        st.markdown("<br>", unsafe_allow_html=True)
        if color == 'green':
            st.success("✅ Great job! You are at Low Risk. Keep up the good habits.")
        elif color == 'orange':
            st.warning("⚠️ You are at Medium Risk. Please review the actionable insights.")
        else:
            st.error("🚨 You are at High Risk! Please consult a doctor immediately.")
            
    with tab2:
        st.markdown("<br>", unsafe_allow_html=True)
        
        st.subheader("🚨 Detected Health Risks")
        if result.get('warnings'):
            for warning in result['warnings']:
                # The warning string already has an emoji from the backend, so we just print it
                st.error(f"{warning}")
        else:
            st.success("✅ No critical health risks detected.")
            
        st.markdown("<br>", unsafe_allow_html=True)
        st.subheader("💡 Suggestions to Overcome Risks")
        st.markdown("Here is your personalized action plan to improve your health and mitigate the risks above:")
        
        if result.get('recommendations'):
            for i, reco in enumerate(result['recommendations'], 1):
                st.info(f"**{i}.** {reco}")
        else:
            st.info("No specific recommendations at this time. Keep up the good work!")
            
    with tab3:
        st.markdown("<br>", unsafe_allow_html=True)
        st.subheader("Detailed Clinical Report")
        
        import pandas as pd
        report_data = {
            "Vital Sign": ["Age", "BMI", "Blood Pressure", "Cholesterol", "Blood Sugar", "Exercise Hours", "Sleep Hours", "Smoking", "Alcohol", "Family History"],
            "Patient Value": [
                age, bmi, blood_pressure, cholesterol, blood_sugar, 
                exercise_hours, sleep_hours, 
                "Yes" if smoking else "No", 
                "Yes" if alcohol else "No", 
                "Yes" if family_history else "No"
            ],
            "Healthy Target": [
                "-", "18.5 - 24.9", "< 120", "< 200", "< 100", "> 3", "7 - 9", "No", "No", "-"
            ]
        }
        df = pd.DataFrame(report_data)
        st.table(df)
        
        st.caption(f"Knowledge Base Rules Fired: {', '.join(result.get('fired_rules', [])) if result.get('fired_rules') else 'None'}")
