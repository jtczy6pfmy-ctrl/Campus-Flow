/**
 * Campus Flow - Alumni Archive & Transcript Generator
 * File: js/archive.js
 */

const ARCHIVED_KEY = 'campus_flow_archived_students';

/**
 * Retrieves archived students array from LocalStorage
 */
function getArchivedStudents() {
  return JSON.parse(localStorage.getItem(ARCHIVED_KEY)) || [];
}

/**
 * Renders the archived graduates roster into the UI
 * @param {Array} list Optional filtered array to display
 */
function renderArchiveRoster(list = null) {
  const tableBody = document.getElementById('archive-roster-body');
  if (!tableBody) return;

  const records = list || getArchivedStudents();
  tableBody.innerHTML = '';

  if (records.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No archived graduate records found.</td></tr>`;
    return;
  }

  records.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${student.id}</strong></td>
      <td>${student.name}</td>
      <td>${student.graduationDate || 'N/A'}</td>
      <td>
        <span class="status-badge badge-graduated">GRADUATED</span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="viewTranscript('${student.id}')">📄 View Transcript</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

/**
 * Filters the archived roster by name or student ID
 */
function handleArchiveSearch(query) {
  const searchTerm = query.toLowerCase().trim();
  const archives = getArchivedStudents();

  const filtered = archives.filter(student => 
    student.name.toLowerCase().includes(searchTerm) ||
    student.id.toLowerCase().includes(searchTerm)
  );

  renderArchiveRoster(filtered);
}

/**
 * Generates and displays an official transcript view inside a modal
 * @param {string} studentId 
 */
function viewTranscript(studentId) {
  const archives = getArchivedStudents();
  const student = archives.find(s => s.id === studentId);

  if (!student) {
    alert("Record not found!");
    return;
  }

  // Generate sample transcript course history if missing
  const courseHistory = student.courses || [
    { code: 'ENG-401', title: 'AP Literature & Composition', grade: 'A', credits: 1.0 },
    { code: 'MTH-302', title: 'Calculus BC', grade: 'A-', credits: 1.0 },
    { code: 'SCI-400', title: 'Physics C', grade: 'B+', credits: 1.0 },
    { code: 'HIS-201', title: 'US History', grade: 'A', credits: 1.0 },
    { code: 'PE-101', title: 'Physical Education', grade: 'Pass', credits: 0.5 }
  ];

  // Render Transcript Modal UI
  let transcriptModal = document.getElementById('transcript-modal');
  
  if (!transcriptModal) {
    transcriptModal = document.createElement('dialog');
    transcriptModal.id = 'transcript-modal';
    transcriptModal.className = 'app-modal transcript-dialog';
    document.body.appendChild(transcriptModal);
  }

  transcriptModal.innerHTML = `
    <div class="transcript-paper" id="printable-transcript">
      <header class="transcript-header">
        <h2>OFFICIAL HIGH SCHOOL TRANSCRIPT</h2>
        <p class="school-name">CAMPUS FLOW ACADEMY</p>
      </header>
      
      <section class="student-meta-grid">
        <div><strong>Student Name:</strong> ${student.name}</div>
        <div><strong>Student ID:</strong> ${student.id}</div>
        <div><strong>Status:</strong> ${student.status}</div>
        <div><strong>Graduation Date:</strong> ${student.graduationDate || 'N/A'}</div>
      </section>

      <hr class="divider">

      <h3>Academic Record</h3>
      <table class="transcript-table">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Title</th>
            <th>Grade</th>
            <th>Credits</th>
          </tr>
        </thead>
        <tbody>
          ${courseHistory.map(c => `
            <tr>
              <td>${c.code}</td>
              <td>${c.title}</td>
              <td><strong>${c.grade}</strong></td>
              <td>${c.credits.toFixed(1)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="transcript-summary">
        <p><strong>Cumulative GPA:</strong> 3.84</p>
        <p><strong>Total Credits Earned:</strong> 24.5</p>
      </div>

      <footer class="transcript-footer">
        <p><i>Official electronic transcript produced automatically by Campus Flow.</i></p>
      </footer>
    </div>

    <menu class="modal-actions no-print">
      <button class="btn btn-secondary" onclick="document.getElementById('transcript-modal').close()">Close</button>
      <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save PDF</button>
    </menu>
  `;

  transcriptModal.showModal();
}

// Global scope attachment for inline event handlers
window.viewTranscript = viewTranscript;

// Initialize event listeners when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  renderArchiveRoster();

  const searchInput = document.getElementById('archive-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => handleArchiveSearch(e.target.value));
  }
});
