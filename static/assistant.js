// ============================================================
// HealthSense AI Assistant — Smart Chart Explainer + Progress Analyst
// ============================================================

const STORAGE_KEY = 'healthsense_history';

const SYSTEM_PROMPT = function(report, progressSummary) {
  var hasReport = report && report.risk_level;
  return `
You are HealthSense Assistant, a friendly and knowledgeable health AI embedded inside the HealthSense AI health risk prediction system.

${hasReport ? `
The user has completed a health assessment. Here are their results:
- Risk Level: ${report.risk_level} (Confidence: ${report.confidence}%)
- Age: ${report.age}, BMI: ${report.bmi}, Blood Pressure: ${report.blood_pressure} mmHg
- Cholesterol: ${report.cholesterol} mg/dL, Blood Sugar: ${report.blood_sugar} mg/dL
- Exercise: ${report.exercise_hours} hrs/week, Sleep: ${report.sleep_hours} hrs/night
- Smoker: ${report.smoking == 1 ? 'Yes' : 'No'}, Alcohol: ${report.alcohol == 1 ? 'Yes' : 'No'}, Family History: ${report.family_history == 1 ? 'Yes' : 'No'}
- Warnings triggered: ${report.warnings}
- Recommendations: ${report.recommendations}
` : 'The user is viewing the Progress Tracker page. No single assessment report is available, but history data may be present.'}

${progressSummary ? `
PROGRESS HISTORY ANALYSIS:
${progressSummary}
` : ''}

CHART KNOWLEDGE:
1. Risk Summary Card: Shows overall risk (Low/Medium/High), confidence %, rules triggered, warnings count, recommendations count.
2. Health Score Card: Each parameter scored 0-10. Green=good(8-10), Orange=ok(5-7), Red=bad(0-4).
3. Parameters vs Normal Range bar chart: Compares user values against healthy benchmarks.
4. BMI Analysis: Visual scale showing Underweight/Normal/Overweight/Obese with a pointer.
5. Training Loss Curve: Shows how the neural network learned during training.
6. Risk Level Over Time (progress): Line chart, lower is better.
7. BMI/BP/Sugar trend charts (progress): Line with dashed healthy max.
8. Exercise & Sleep bar chart (progress): Higher bars = better lifestyle habits.
9. Lifestyle Balance Wheel (recommendations): Polar area chart, bigger slice = better score.
10. Priority/Urgency chart (recommendations): Horizontal bar, longer red bar = needs most urgent attention.

Your job:
- Answer questions about health results and progress
- Explain any chart clearly when asked
- If progress data is available, analyse trends and tell what improved or worsened
- Be warm, supportive, concise (3-5 sentences unless asked for more)
- Never diagnose — educational assistant only
- Always suggest consulting a real doctor for medical decisions
`;
};

function getProgressSummary() {
  try {
    var history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (history.length < 2) return null;

    var first = history[0];
    var latest = history[history.length - 1];

    var improved = [];
    var worsened = [];
    var same = [];

    if (latest.bmi < first.bmi) improved.push('BMI improved (' + first.bmi + ' to ' + latest.bmi + ')');
    else if (latest.bmi > first.bmi) worsened.push('BMI increased (' + first.bmi + ' to ' + latest.bmi + ')');
    else same.push('BMI unchanged');

    if (latest.blood_pressure < first.blood_pressure) improved.push('Blood pressure improved (' + first.blood_pressure + ' to ' + latest.blood_pressure + ' mmHg)');
    else if (latest.blood_pressure > first.blood_pressure) worsened.push('Blood pressure increased (' + first.blood_pressure + ' to ' + latest.blood_pressure + ' mmHg)');

    if (latest.cholesterol < first.cholesterol) improved.push('Cholesterol improved (' + first.cholesterol + ' to ' + latest.cholesterol + ' mg/dL)');
    else if (latest.cholesterol > first.cholesterol) worsened.push('Cholesterol increased (' + first.cholesterol + ' to ' + latest.cholesterol + ' mg/dL)');

    if (latest.blood_sugar < first.blood_sugar) improved.push('Blood sugar improved (' + first.blood_sugar + ' to ' + latest.blood_sugar + ' mg/dL)');
    else if (latest.blood_sugar > first.blood_sugar) worsened.push('Blood sugar increased (' + first.blood_sugar + ' to ' + latest.blood_sugar + ' mg/dL)');

    if (latest.exercise_hours > first.exercise_hours) improved.push('Exercise increased (' + first.exercise_hours + ' to ' + latest.exercise_hours + ' hrs/week)');
    else if (latest.exercise_hours < first.exercise_hours) worsened.push('Exercise decreased (' + first.exercise_hours + ' to ' + latest.exercise_hours + ' hrs/week)');

    if (latest.sleep_hours > first.sleep_hours) improved.push('Sleep improved (' + first.sleep_hours + ' to ' + latest.sleep_hours + ' hrs/night)');
    else if (latest.sleep_hours < first.sleep_hours) worsened.push('Sleep decreased (' + first.sleep_hours + ' to ' + latest.sleep_hours + ' hrs/night)');

    return 'Total assessments: ' + history.length + '\n'
      + 'First risk level: ' + first.risk_level + ', Latest risk level: ' + latest.risk_level + '\n'
      + 'Improved: ' + (improved.length > 0 ? improved.join(', ') : 'Nothing yet') + '\n'
      + 'Worsened: ' + (worsened.length > 0 ? worsened.join(', ') : 'Nothing') + '\n'
      + 'Unchanged: ' + (same.length > 0 ? same.join(', ') : 'Nothing');
  } catch(e) { return null; }
}

function getProgressRuleResponse(message, historyData) {
  var msg = message.toLowerCase();
  if (historyData.length < 2) {
    return 'You need at least 2 assessments to see progress analysis. Complete another assessment and come back!';
  }
  var first = historyData[0];
  var latest = historyData[historyData.length - 1];

  if (msg.includes('progress') || msg.includes('trend') || msg.includes('improve') || msg.includes('better') || msg.includes('worse') || msg.includes('summar') || msg.includes('overview') || msg.includes('history') || msg.includes('change')) {
    var lines = ['Here\'s your progress across ' + historyData.length + ' assessments:'];
    lines.push('Risk: ' + first.risk_level + ' → ' + latest.risk_level + (latest.risk_level === first.risk_level ? ' (stable)' : ''));
    lines.push('BMI: ' + first.bmi + ' → ' + latest.bmi + (latest.bmi < first.bmi ? ' ✅ improved' : latest.bmi > first.bmi ? ' ⚠️ increased' : ' (unchanged)'));
    lines.push('Blood Pressure: ' + first.blood_pressure + ' → ' + latest.blood_pressure + ' mmHg' + (latest.blood_pressure < first.blood_pressure ? ' ✅' : latest.blood_pressure > first.blood_pressure ? ' ⚠️' : ''));
    lines.push('Blood Sugar: ' + first.blood_sugar + ' → ' + latest.blood_sugar + ' mg/dL' + (latest.blood_sugar < first.blood_sugar ? ' ✅' : latest.blood_sugar > first.blood_sugar ? ' ⚠️' : ''));
    lines.push('Exercise: ' + first.exercise_hours + ' → ' + latest.exercise_hours + ' hrs/wk' + (latest.exercise_hours > first.exercise_hours ? ' ✅' : latest.exercise_hours < first.exercise_hours ? ' ⚠️' : ''));
    lines.push('Sleep: ' + first.sleep_hours + ' → ' + latest.sleep_hours + ' hrs/night' + (latest.sleep_hours > first.sleep_hours ? ' ✅' : latest.sleep_hours < first.sleep_hours ? ' ⚠️' : ''));
    return lines.join('<br>');
  }
  if (msg.includes('bmi')) return 'Your BMI went from ' + first.bmi + ' to ' + latest.bmi + '. ' + (latest.bmi < first.bmi ? 'Great improvement!' : latest.bmi > first.bmi ? 'It has increased — focus on diet and exercise.' : 'It has stayed the same.');
  if (msg.includes('blood pressure') || msg.includes('bp')) return 'Blood pressure went from ' + first.blood_pressure + ' to ' + latest.blood_pressure + ' mmHg. ' + (latest.blood_pressure < first.blood_pressure ? 'Good improvement!' : latest.blood_pressure > first.blood_pressure ? 'It has increased — reduce salt and manage stress.' : 'No change.');
  if (msg.includes('sugar') || msg.includes('glucose')) return 'Blood sugar went from ' + first.blood_sugar + ' to ' + latest.blood_sugar + ' mg/dL. ' + (latest.blood_sugar < first.blood_sugar ? 'Good improvement!' : latest.blood_sugar > first.blood_sugar ? 'It has increased — reduce sugar intake.' : 'No change.');
  if (msg.includes('exercise') || msg.includes('workout')) return 'Exercise went from ' + first.exercise_hours + ' to ' + latest.exercise_hours + ' hrs/week. ' + (latest.exercise_hours > first.exercise_hours ? 'Great — keep it up!' : latest.exercise_hours < first.exercise_hours ? 'It dropped — try to increase activity.' : 'No change.');
  if (msg.includes('sleep')) return 'Sleep went from ' + first.sleep_hours + ' to ' + latest.sleep_hours + ' hrs/night. ' + (latest.sleep_hours > first.sleep_hours ? 'Better sleep — great!' : latest.sleep_hours < first.sleep_hours ? 'Sleep decreased — aim for 7-9 hours.' : 'No change.');
  if (msg.includes('risk')) return 'Your risk level went from ' + first.risk_level + ' to ' + latest.risk_level + ' across ' + historyData.length + ' assessments.';
  if (msg.includes('chart') || msg.includes('graph')) return 'The progress page shows 5 charts: Risk Level Over Time, BMI Trend, Blood Pressure Trend, Blood Sugar Trend, and Exercise & Sleep bars. Each chart compares your values over time — the dashed green line shows the healthy target.';
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) return 'Hi! 👋 I\'m your HealthSense Assistant. I can summarise your health progress across all your assessments. Try asking "Give me a progress summary" or "How has my BMI changed?"';
  if (msg.includes('thank')) return 'You\'re welcome! Keep tracking your health regularly for better insights. 😊';
  return null;
}

async function callClaudeAPI(message, report, chatHistory) {
  try {
    var progressSummary = getProgressSummary();
    var messages = chatHistory.concat([{ role: 'user', content: message }]);
    var response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT(report, progressSummary),
        messages: messages
      })
    });
    if (!response.ok) return null;
    var data = await response.json();
    return data.content && data.content[0] ? data.content[0].text : null;
  } catch(e) { return null; }
}

function initAssistant() {
  var reportEl = document.getElementById('assistantReportData');
  var report = {};
  try { if (reportEl) report = JSON.parse(reportEl.textContent); } catch(e) {}
  var hasReport = report && report.risk_level;

  var historyData = [];
  try { historyData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch(e) {}

  var isProgressPage = window.location.pathname === '/progress';

  // On progress page, enable assistant if there's history data
  var canChat = hasReport || (isProgressPage && historyData.length > 0);

  var suggestions = [];
  if (hasReport) {
    suggestions = [
      { text: 'Give me a full summary', label: 'Full Summary' },
      { text: 'Explain the score card', label: 'Score Card' },
      { text: 'What should I improve?', label: 'What to Improve?' },
      { text: historyData.length > 1 ? 'What improved in my progress?' : 'Explain my risk level', label: historyData.length > 1 ? 'Progress Analysis' : 'My Risk Level' }
    ];
  } else if (isProgressPage && historyData.length > 0) {
    suggestions = [
      { text: 'Give me a progress summary', label: 'Progress Summary' },
      { text: 'What has improved?', label: 'What Improved?' },
      { text: 'How has my BMI changed?', label: 'BMI Trend' },
      { text: 'Explain the charts', label: 'Explain Charts' }
    ];
  }

  var welcomeMsg = hasReport
    ? 'I\'ve read your health report — risk is <strong>' + report.risk_level + '</strong>' + (historyData.length > 1 ? ' and I can see <strong>' + historyData.length + ' assessments</strong> in your history' : '') + '. Ask me anything!'
    : isProgressPage && historyData.length > 0
      ? 'I can see <strong>' + historyData.length + ' health assessments</strong> in your history! Ask me to summarise your progress or explain any chart.'
      : isProgressPage
        ? 'Complete a health assessment first and I can analyse your progress here!'
        : 'Complete a health assessment and I can explain your results, charts, and progress!';

  var chatHistory = [];
  var isOpen = false;

  document.body.insertAdjacentHTML('beforeend',
    '<button class="assistant-bubble" id="assistantBubble" title="Ask HealthSense AI">'
    + '<span class="bubble-icon">🩺</span><span class="bubble-ping"></span></button>'

    + '<div class="assistant-panel" id="assistantPanel">'
    + '<div class="assistant-header">'
    + '<div class="assistant-header-left">'
    + '<div class="assistant-avatar">🩺</div>'
    + '<div><div class="assistant-name">HealthSense Assistant</div>'
    + '<div class="assistant-status"><span class="status-dot"></span> AI-Powered</div></div>'
    + '</div>'
    + '<button class="assistant-close" id="assistantClose">✕</button>'
    + '</div>'

    + '<div class="assistant-messages" id="assistantMessages">'
    + '<div class="assistant-msg bot"><div class="msg-bubble">👋 Hi! I\'m your <strong>HealthSense Assistant</strong>.<br><br>' + welcomeMsg + '</div></div>'
    + (suggestions.length > 0
      ? '<div class="assistant-suggestions"><div class="suggestions-label">Try asking:</div>'
        + suggestions.map(function(s) { return '<button class="suggestion-chip" onclick="sendSuggestion(\'' + s.text + '\')">' + s.label + '</button>'; }).join('')
        + '</div>'
      : '')
    + '</div>'

    + '<div class="assistant-input-row">'
    + '<input type="text" id="assistantInput" class="assistant-input" placeholder="' + (canChat ? 'Ask about your health...' : 'Complete an assessment first...') + '" ' + (canChat ? '' : 'disabled') + '/>'
    + '<button class="assistant-send" id="assistantSend" ' + (canChat ? '' : 'disabled') + '>➤</button>'
    + '</div></div>'

    + '<div class="assistant-overlay" id="assistantOverlay"></div>'
  );

  function openPanel() {
    isOpen = true;
    document.getElementById('assistantPanel').classList.add('open');
    document.getElementById('assistantOverlay').classList.add('show');
    document.getElementById('assistantBubble').classList.add('active');
  }

  function closePanel() {
    isOpen = false;
    document.getElementById('assistantPanel').classList.remove('open');
    document.getElementById('assistantOverlay').classList.remove('show');
    document.getElementById('assistantBubble').classList.remove('active');
  }

  document.getElementById('assistantBubble').addEventListener('click', function() { isOpen ? closePanel() : openPanel(); });
  document.getElementById('assistantClose').addEventListener('click', closePanel);
  document.getElementById('assistantOverlay').addEventListener('click', closePanel);

  async function sendMessage(text) {
    if (!text.trim() || !canChat) return;

    var messagesEl = document.getElementById('assistantMessages');
    var suggestionsEl = messagesEl.querySelector('.assistant-suggestions');
    if (suggestionsEl) suggestionsEl.remove();

    messagesEl.innerHTML += '<div class="assistant-msg user"><div class="msg-bubble">' + text + '</div></div>';
    messagesEl.innerHTML += '<div class="assistant-msg bot" id="typingIndicator"><div class="msg-bubble typing"><span></span><span></span><span></span></div></div>';
    messagesEl.scrollTop = messagesEl.scrollHeight;
    document.getElementById('assistantInput').value = '';

    var ruleAnswer;
    if (isProgressPage && !hasReport) {
      ruleAnswer = getProgressRuleResponse(text, historyData);
    } else {
      ruleAnswer = getRuleResponse(text, report, historyData);
    }

    var answer;
    if (ruleAnswer && text.split(' ').length <= 7) {
      await new Promise(function(r) { setTimeout(r, 500); });
      answer = ruleAnswer;
    } else {
      answer = await callClaudeAPI(text, report, chatHistory);
      if (!answer) answer = ruleAnswer || 'Try asking: "Give me a progress summary", "What improved?", or "How has my BMI changed?" 😊';
    }

    chatHistory.push({ role: 'user', content: text });
    chatHistory.push({ role: 'assistant', content: answer });
    if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

    var indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
    messagesEl.innerHTML += '<div class="assistant-msg bot"><div class="msg-bubble">' + answer.replace(/\n/g, '<br>').replace(/•/g, '<br>•') + '</div></div>';
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  document.getElementById('assistantSend').addEventListener('click', function() {
    sendMessage(document.getElementById('assistantInput').value);
  });
  document.getElementById('assistantInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage(e.target.value);
  });
  window.sendSuggestion = function(text) { sendMessage(text); };
}

function getRuleResponse(message, report, history) {
  var msg = message.toLowerCase();

  if (!report || !report.risk_level) return getProgressRuleResponse(message, history);

  if (msg.includes('score card') || msg.includes('scorecard') || msg.includes('score out of')) return 'The Health Score Card rates each parameter from 0-10. Green (8-10) means healthy, Orange (5-7) means borderline, Red (0-4) means needs attention. Your lowest scores are the areas to focus on first.';
  if (msg.includes('bar chart') || msg.includes('normal range') || msg.includes('benchmark')) return 'The Parameters vs Normal Range chart compares your values (coloured bars) against healthy benchmarks (grey bars). When your coloured bar is taller than the grey one, that parameter is above the healthy range.';
  if (msg.includes('loss curve') || msg.includes('training') || msg.includes('neural network')) return 'The Training Loss Curve shows how the neural network learned during training. The curve going downward means the model successfully learned to predict health risk. A smooth curve means good training.';
  if (msg.includes('risk summary') || msg.includes('summary card')) return 'The Risk Summary card shows your overall risk level (' + report.risk_level + '), the neural network\'s confidence (' + report.confidence + '%), how many rules were triggered, and your warnings and recommendations count.';
  if (msg.includes('progress') || msg.includes('trend') || msg.includes('over time') || msg.includes('improved') || msg.includes('history')) return getProgressRuleResponse(message, history);
  if (msg.includes('summary') || msg.includes('overview') || msg.includes('overall')) return 'Your health summary: Risk is ' + report.risk_level + ' with ' + report.confidence + '% confidence. ' + (report.bmi <= 24.9 ? 'BMI is normal ✅' : 'BMI needs attention ⚠️') + '. ' + (report.blood_pressure < 120 ? 'Blood pressure is normal ✅' : 'Blood pressure is elevated ⚠️') + '. ' + (report.blood_sugar <= 99 ? 'Blood sugar is normal ✅' : 'Blood sugar needs monitoring ⚠️') + '. ' + (report.exercise_hours >= 5 ? 'Exercise is adequate ✅' : 'Need more exercise ⚠️') + '. ' + (report.sleep_hours >= 7 ? 'Sleep is good ✅' : 'Need more sleep ⚠️') + '.';
  if (msg.includes('bmi') || msg.includes('weight') || msg.includes('obese')) return 'Your BMI is ' + report.bmi + '. ' + (report.bmi < 18.5 ? "That's underweight." : report.bmi <= 24.9 ? "That's in the healthy range! Great job." : report.bmi <= 29.9 ? 'Slightly overweight. Even a 5-10% reduction helps.' : 'Falls in the obese range. A doctor-guided plan would help.');
  if (msg.includes('blood pressure') || msg.includes('bp')) return 'Your blood pressure is ' + report.blood_pressure + ' mmHg. ' + (report.blood_pressure < 120 ? 'Perfectly normal!' : report.blood_pressure < 130 ? 'Slightly elevated. Reduce salt and exercise more.' : report.blood_pressure < 160 ? "That's high. Monitor regularly and see a doctor." : 'Very high — needs immediate medical attention.');
  if (msg.includes('cholesterol')) return 'Your cholesterol is ' + report.cholesterol + ' mg/dL. ' + (report.cholesterol < 180 ? 'Excellent!' : report.cholesterol < 200 ? 'Desirable, but watch your diet.' : report.cholesterol < 240 ? 'Borderline high. Reduce saturated fats.' : 'High — please see a doctor.');
  if (msg.includes('sugar') || msg.includes('glucose') || msg.includes('diabetes')) return 'Your blood sugar is ' + report.blood_sugar + ' mg/dL. ' + (report.blood_sugar <= 99 ? 'Normal range!' : report.blood_sugar <= 125 ? 'Pre-diabetic range. Reduce sugar intake.' : 'Diabetic range. Please consult a doctor.');
  if (msg.includes('sleep')) return 'You sleep ' + report.sleep_hours + ' hours per night. ' + (report.sleep_hours >= 7 && report.sleep_hours <= 9 ? 'Perfect!' : report.sleep_hours >= 6 ? 'Slightly low. Try to get at least 7 hours.' : 'Insufficient. Poor sleep affects heart and immunity.');
  if (msg.includes('exercise') || msg.includes('workout') || msg.includes('activity')) return 'You exercise ' + report.exercise_hours + ' hours per week. ' + (report.exercise_hours >= 5 ? "Great! You're meeting recommended levels." : report.exercise_hours >= 3 ? 'Decent, but try to reach 5+ hours per week.' : 'Too little. Even a 30-min daily walk helps.');
  if (msg.includes('risk') || msg.includes('level') || msg.includes('result')) return 'Your overall risk level is ' + report.risk_level + '. ' + (report.risk_level === 'Low' ? 'Great news! Keep up the good habits.' : report.risk_level === 'Medium' ? 'Some areas need attention. Focus on the recommendations.' : 'Several high-risk indicators. Please consult a doctor soon.');
  if (msg.includes('smok')) return report.smoking == 1 ? 'You smoke — a major risk factor for heart disease and cancer. Quitting gradually can dramatically improve your health.' : "You don't smoke — one of the best things for your health!";
  if (msg.includes('recommend') || msg.includes('suggest') || msg.includes('advice') || msg.includes('tip')) return 'Your top recommendations: ' + (report.recommendations ? report.recommendations.slice(0, 3).join(' | ') : 'Check your recommendations page.');
  if (msg.includes('warn') || msg.includes('alert') || msg.includes('danger')) return 'Your assessment flagged: ' + (report.warnings ? report.warnings.slice(0, 2).join(' | ') : 'No major warnings.');
  if (msg.includes('improve') || msg.includes('better') || msg.includes('fix') || msg.includes('help')) return 'Based on your results, focus on: ' + (report.bmi > 25 ? '• Weight management. ' : '') + (report.blood_pressure > 120 ? '• Lower blood pressure. ' : '') + (report.cholesterol > 180 ? '• Reduce cholesterol. ' : '') + (report.blood_sugar > 99 ? '• Manage blood sugar. ' : '') + (report.exercise_hours < 5 ? '• More exercise. ' : '') + (report.sleep_hours < 7 ? '• More sleep. ' : '') + (report.smoking == 1 ? '• Quit smoking. ' : '');
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) return "Hi there! 👋 I'm your HealthSense Assistant. Ask me anything about your results, charts, or progress!";
  if (msg.includes('thank')) return "You're welcome! 😊 Take care of yourself!";
  return null;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAssistant);
} else {
  initAssistant();
}