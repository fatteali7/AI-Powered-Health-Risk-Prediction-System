// ============================================================
// HealthSense — History Saver (FINAL CLEAN VERSION)
// ============================================================

const STORAGE_KEY = 'healthsense_history';

function saveAssessmentToHistory() {
  console.log("🚀 Saving assessment...");

  const reportEl = document.getElementById('assistantReportData');

  if (!reportEl) {
    console.log("❌ assistantReportData NOT found");
    return;
  }

  try {
    const raw = reportEl.textContent.trim();
    const data = JSON.parse(raw);

    if (!data.risk_level) {
      console.log("❌ Missing risk_level");
      return;
    }

    let history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    const entry = {
      ...data,
      timestamp: new Date().toISOString()
    };

    // Prevent duplicate saves
    const last = history[history.length - 1];
    if (last) {
      const diff = new Date() - new Date(last.timestamp);

      if (
        diff < 10000 &&
        last.bmi == entry.bmi &&
        last.blood_pressure == entry.blood_pressure &&
        last.risk_level == entry.risk_level
      ) {
        console.log("⚠️ Duplicate prevented");
        return;
      }
    }

    history.push(entry);

    if (history.length > 50) {
      history = history.slice(-50);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    console.log("✅ Saved successfully!", history);

  } catch (e) {
    console.error("❌ Error:", e);
  }
}


// RUN AFTER PAGE LOAD
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(saveAssessmentToHistory, 100);
});