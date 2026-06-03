from flask import Flask, render_template, request, session
from agent import HealthRiskAgent
import json

app = Flask(__name__)
app.secret_key = 'healthrisk2024'
agent = HealthRiskAgent()

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    form_data = request.form.to_dict()
    result = agent.decide_and_act(form_data)
    session['result'] = json.dumps(result)
    session['form_data'] = json.dumps(form_data)
    return render_template('result.html', result=result)

@app.route('/recommendations')
def recommendations():
    result = session.get('result')
    if not result:
        return render_template('index.html')
    result = json.loads(result)
    return render_template('recommendations.html', result=result)

@app.route('/doctor-report')
def doctor_report():
    result = session.get('result')
    form_data = session.get('form_data')
    if not result:
        return render_template('index.html')
    result = json.loads(result)
    form_data = json.loads(form_data)
    return render_template('doctor_report.html', result=result, patient=form_data)

@app.route('/progress')
def progress():
    return render_template('progress.html')

if __name__ == '__main__':
    from waitress import serve
    print("Starting production WSGI server on http://127.0.0.1:5000")
    serve(app, host='127.0.0.1', port=5000)