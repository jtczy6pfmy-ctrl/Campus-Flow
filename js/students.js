/**
 * Campus Flow - Active Student Roster Management
 * File: students.js
 */

// Global state keys for LocalStorage
const ACTIVE_STUDENTS_KEY = 'campus_flow_active_students';
const ARCHIVED_STUDENTS_KEY = 'campus_flow_archived_students';

// Default mockup dataset with photos
const MOCKUP_STUDENTS = [
  { 
    id: '100001', 
    name: 'Marcus Chen', 
    grade: '11', 
    status: 'ON CAMPUS', 
    isActive: true, 
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    enrolledDate: '2023-08-25'
  },
  { 
    id: '100002', 
    name: 'Sarah Jenkins', 
    grade: '12', 
    status: 'OFF CAMPUS', 
    isActive: true, 
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    enrolledDate: '2022-08-20'
  },
  { 
    id: '100003', 
    name: 'Amara Patel', 
    grade: '10', 
    status: 'ON CAMPUS', 
    isActive: true, 
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    enrolledDate: '2024-08-22'
  },
  { 
    id: '100004', 
    name: 'David Rodriguez', 
    grade: '12', 
    status: 'ON CAMPUS', 
    isActive: true, 
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    enrolledDate: '2022-08-20'
  },
  { 
    id: '100005', 
    name: 'Elena Rostova', 
    grade: '9', 
    status: 'OFF CAMPUS', 
    isActive: true, 
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    enrolledDate: '2025-08-28'
  }
];

// Initialize data storage with defaults if empty
let activeStudents = JSON.parse(localStorage.getItem(ACTIVE_STUDENTS_KEY)) || MOCKUP_STUDENTS;
let archivedStudents = JSON.parse(localStorage.getItem(ARCHIVED_STUDENTS_KEY)) || [];

// Save current arrays to localStorage
function persistData() {
  localStorage.setItem(ACTIVE_STUDENTS_KEY, JSON.stringify(activeStudents));
  localStorage.setItem(ARCHIVED_STUDENTS_KEY, JSON.stringify(archivedStudents));
  renderRoster();
  updateMetrics();
}

/**
 * Renders active students to the UI table with avatar photos
 */
function renderRoster() {
  const tableBody = document.getElementById('active-roster-body');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  // Filter out soft-deleted/withdrawn students from primary view
  const visibleStudents = activeStudents.filter(student => student.isActive);

  if (visibleStudents.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No active students found.</td></tr>`;
    return;
  }

  visibleStudents.forEach(student => {
    // Generate fallback initial avatar if photo is missing
    const photoUrl = student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=3b82f6&color=fff`;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${student.id}</strong></td>
      <td>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <img src="${photoUrl}" alt="${student.name}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color);" />
          <span>${student.name}</span>
        </div>
      </td>
      <td>Grade ${student.grade}</td>
      <td>
        <span class="status-badge ${student.status === 'ON CAMPUS' ? 'badge-online' : 'badge-offline'}">
          ${student.status}
        </span>
      </td>
      <td>
        <button class="btn btn-sm" onclick="toggleStudentStatus('${student.id}')">Toggle Status</button>
        <button class="btn btn-sm btn-warning" onclick="withdrawStudent('${student.id}')">Withdraw</button>
        ${student.grade === '12' ? `<button class="btn btn-sm btn-primary" onclick="graduateStudent('${student.id}')">Graduate</button>` : ''}
      </td>
    `;
    tableBody.appendChild(row);
  });
}

/**
 * Updates dashboard metric counters
 */
function updateMetrics() {
  const totalCountEl = document.getElementById('total-students-count');
  const onCampusCountEl = document.getElementById('on-campus-count');

  const activeOnly = activeStudents.filter(s => s.isActive);
  const onCampusOnly = activeOnly.filter(s => s.status === 'ON CAMPUS');

  if (totalCountEl) totalCountEl.textContent = activeOnly.length;
  if (onCampusCountEl) onCampusCountEl.textContent = onCampusOnly.length;
}

/**
 * Adds a new student from modal form
 */
function addStudent(id, name, grade, photo) {
  // Prevent duplicate ID entry
  const exists = activeStudents.some(s => s.id === id);
  if (exists) {
    alert(`Student ID ${id} already exists!`);
    return false;
  }

  const newStudent = {
    id,
    name,
    grade,
    photo: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`,
    status: 'OFF CAMPUS',
    isActive: true,
    enrolledDate: new Date().toISOString()
  };

  activeStudents.push(newStudent);
  persistData();
  return true;
}

/**
 * Toggles ON CAMPUS / OFF CAMPUS status
 */
function toggleStudentStatus(id) {
  const student = activeStudents.find(s => s.id === id);
  if (student) {
    student.status = student.status === 'ON CAMPUS' ? 'OFF CAMPUS' : 'ON CAMPUS';
    persistData();
  }
}

/**
 * Soft-deletes / withdraws a student (preserves audit record)
 */
function withdrawStudent(id) {
  if (confirm(`Are you sure you want to withdraw student ID: ${id}?`)) {
    const student = activeStudents.find(s => s.id === id);
    if (student) {
      student.isActive = false;
      student.status = 'WITHDRAWN';
      student.withdrawnDate = new Date().toISOString();
      persistData();
    }
  }
}

/**
 * Moves an individual student from active roster to archived database
 */
function graduateStudent(id) {
  const index = activeStudents.findIndex(s => s.id === id);
  if (index !== -1) {
    const [student] = activeStudents.splice(index, 1);
    
    // Convert to archived record format
    const graduatedRecord = {
      ...student,
      status: 'GRADUATED',
      isActive: false,
      graduationDate: new Date().toISOString().split('T')[0],
      transcriptAvailable: true
    };

    archivedStudents.push(graduatedRecord);
    persistData();
  }
}

/**
 * Batch graduates all Grade 12 seniors
 */
function batchGraduateSeniors() {
  const seniors = activeStudents.filter(s => s.grade === '12' && s.isActive);
  if (seniors.length === 0) {
    alert("No eligible Grade 12 seniors found on active roster.");
    return;
  }

  if (confirm(`Graduate and archive ${seniors.length} senior(s)?`)) {
    seniors.forEach(senior => graduateStudent(senior.id));
  }
}

// Event Listeners Initialization
document.addEventListener('DOMContentLoaded', () => {
  renderRoster();
  updateMetrics();

  // Modal elements
  const modal = document.getElementById('add-student-modal');
  const btnAdd = document.getElementById('btn-add-student');
  const btnCancel = document.getElementById('modal-cancel');
  const formAdd = document.getElementById('add-student-form');
  const btnGraduateBatch = document.getElementById('btn-batch-graduate');

  // Open Add Student Modal
  if (btnAdd && modal) {
    btnAdd.addEventListener('click', () => modal.showModal());
  }

  // Close Modal
  if (btnCancel && modal) {
    btnCancel.addEventListener('click', () => modal.close());
  }

  // Handle Add Student Form Submit
  if (formAdd) {
    formAdd.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('student-name').value.trim();
      const id = document.getElementById('student-id').value.trim();
      const grade = document.getElementById('student-grade').value;
      const photo = document.getElementById('student-photo').value.trim();

      if (addStudent(id, name, grade, photo)) {
        formAdd.reset();
        modal.close();
      }
    });
  }

  // Batch Graduate Button
  if (btnGraduateBatch) {
    btnGraduateBatch.addEventListener('click', batchGraduateSeniors);
  }
});
