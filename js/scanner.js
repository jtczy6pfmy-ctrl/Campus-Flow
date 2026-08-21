/**
 * Campus Flow - ID Scanner & Quick Check-In Module
 * File: js/scanner.js
 */

// Buffer settings for hardware barcode / RFID readers
let barcodeBuffer = '';
let lastKeyTime = 0;
const SCANNER_SPEED_THRESHOLD_MS = 50; // Hardware scanners type keys < 50ms apart

document.addEventListener('DOMContentLoaded', () => {
  initManualLookup();
  initHardwareScannerListener();
});

/**
 * Connects the UI search input for manual student ID lookup
 */
function initManualLookup() {
  const scanInput = document.getElementById('scanner-input');
  const scanBtn = document.getElementById('btn-scanner-submit');

  if (scanInput) {
    scanInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        processScannedId(scanInput.value.trim());
        scanInput.value = '';
      }
    });
  }

  if (scanBtn && scanInput) {
    scanBtn.addEventListener('click', () => {
      processScannedId(scanInput.value.trim());
      scanInput.value = '';
    });
  }
}

/**
 * Global keypress listener to catch automatic RFID/Barcode hardware inputs
 */
function initHardwareScannerListener() {
  document.addEventListener('keydown', (e) => {
    // Ignore input if user is actively typing in a standard form field
    const activeElem = document.activeElement;
    if (activeElem && (activeElem.tagName === 'INPUT' || activeElem.tagName === 'TEXTAREA' || activeElem.tagName === 'SELECT')) {
      // If focused inside the scanner search bar, let initManualLookup handle it
      if (activeElem.id === 'scanner-input') return;
    }

    const currentTime = Date.now();

    // Reset buffer if time between keypresses is too long (human typing)
    if (currentTime - lastKeyTime > SCANNER_SPEED_THRESHOLD_MS) {
      barcodeBuffer = '';
    }

    lastKeyTime = currentTime;

    if (e.key === 'Enter') {
      if (barcodeBuffer.length >= 3) { // Minimum expected ID length
        e.preventDefault();
        processScannedId(barcodeBuffer.trim());
        barcodeBuffer = '';
      }
    } else if (e.key.length === 1) { // Single character keys
      barcodeBuffer += e.key;
    }
  });
}

/**
 * Searches active roster for the scanned ID and triggers state updates
 * @param {string} studentId 
 */
function processScannedId(studentId) {
  if (!studentId) return;

  // Fetch active students array initialized in students.js
  const rawData = localStorage.getItem('campus_flow_active_students');
  const activeStudents = rawData ? JSON.parse(rawData) : [];

  const student = activeStudents.find(s => s.id === studentId && s.isActive);

  if (!student) {
    renderScannerResult(null, studentId);
    return;
  }

  // Toggle status automatically upon scan (Check-in / Check-out)
  const previousStatus = student.status;
  student.status = student.status === 'ON CAMPUS' ? 'OFF CAMPUS' : 'ON CAMPUS';

  // Save back to LocalStorage
  localStorage.setItem('campus_flow_active_students', JSON.stringify(activeStudents));

  // Trigger UI updates across other components if functions exist
  if (typeof renderRoster === 'function') renderRoster();
  if (typeof updateMetrics === 'function') updateMetrics();

  renderScannerResult(student, studentId, previousStatus);
}

/**
 * Renders the scan result card on the screen
 */
function renderScannerResult(student, scannedId, previousStatus = '') {
  const resultContainer = document.getElementById('scanner-result-card');
  if (!resultContainer) return;

  if (!student) {
    resultContainer.innerHTML = `
      <div class="scan-card scan-error">
        <span class="scan-icon">⚠️</span>
        <div>
          <h3>Student Not Found</h3>
          <p>No active record associated with ID: <strong>${scannedId}</strong></p>
        </div>
      </div>
    `;
    return;
  }

  const isNowOnCampus = student.status === 'ON CAMPUS';

  resultContainer.innerHTML = `
    <div class="scan-card scan-success ${isNowOnCampus ? 'border-checkin' : 'border-checkout'}">
      <div class="scan-avatar">${student.name.charAt(0)}</div>
      <div class="scan-details">
        <h3>${student.name}</h3>
        <p>ID: <strong>${student.id}</strong> | Grade ${student.grade}</p>
        <div class="scan-status-change">
          <span>${previousStatus}</span> ➔ 
          <strong class="${isNowOnCampus ? 'text-success' : 'text-danger'}">${student.status}</strong>
        </div>
      </div>
    </div>
  `;
}
