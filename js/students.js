/**
 * Campus Flow - High School Roster Management
 * Scale: 1,600 Active Students (~400 per Grade 9-12)
 * File: js/students.js
 */

const ACTIVE_STUDENTS_KEY = 'campus_flow_active_students';
const ARCHIVED_STUDENTS_KEY = 'campus_flow_archived_students';

// Pagination State
let currentPage = 1;
const rowsPerPage = 25;

/**
 * Generates a realistic 1,600-student dataset on first run
 */
function generateMockupDatabase() {
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Ethan', 'Chloe', 'Mason', 'Sophia', 'Liam', 'Emma', 'Noah', 'Ava', 'Lucas', 'Mia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
  const avatars = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80'
  ];

  const students = [];
  const grades = ['9', '10', '11', '12'];

  for (let i = 1; i <= 1600; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const grade = grades[(i - 1) % 4]; // Evenly splits ~400 students per grade
    const id = (100000 + i).toString();
    const isOnCampus = Math.random() > 0.15; // ~85% on campus
    const avatar = avatars[i % avatars.length];

    students.push({
      id: id,
      name: `${fn} ${ln}`,
      grade: grade,
      status: isOnCampus ? 'ON CAMPUS' : 'OFF CAMPUS',
      isActive: true,
      photo: avatar,
      enrolledDate: '2025-08-20'
    });
  }
  return students;
}

// Load from LocalStorage or generate 1,600 records
let activeStudents = JSON.parse(localStorage.getItem(ACTIVE_STUDENTS_KEY)) || generateMockupDatabase();
let archivedStudents = JSON.parse(localStorage.getItem(ARCHIVED_STUDENTS_KEY)) || [];

// Save back to LocalStorage
function persistData() {
  localStorage.setItem(ACTIVE_STUDENTS_KEY, JSON.stringify(activeStudents));
  localStorage.setItem(ARCHIVED_STUDENTS_KEY, JSON.stringify(archivedStudents));
  renderRoster();
  updateMetrics();
}

/**
 * Renders paginated active roster table
 */
function renderRoster() {
  const tableBody = document.getElementById('active-roster-body');
  if (!tableBody) return;

  const searchVal = (document.getElementById('roster-search')?.value || '').toLowerCase();
  
  // Filter active students and search filter
  const filteredStudents = activeStudents.filter(s => 
    s.isActive && (s.name.toLowerCase().includes(searchVal) || s.id.includes(searchVal))
  );

  tableBody.innerHTML = '';

  if (filteredStudents.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No students matching criteria.</td></tr>`;
    renderPaginationControls(0);
    return;
  }

  // Calculate slice range for current page
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  if (currentPage > totalPages) currentPage = 1;
  
  const startIdx = (currentPage - 1) * rowsPerPage;
  const paginatedItems = filteredStudents.slice(startIdx, startIdx + rowsPerPage);

  paginatedItems.forEach(student => {
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

  renderPaginationControls(filteredStudents.length);
}

/**
 * Creates/Updates pagination button controls
 */
function renderPaginationControls(totalItems) {
  let paginationContainer = document.getElementById('roster-pagination');
  
  if (!paginationContainer) {
    const rosterSection = document.getElementById('roster');
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'roster-pagination';
    paginationContainer.style.cssText = 'display: flex; justify: space-between; align-items: center; margin-top: 1rem; padding: 0.5rem 0;';
    rosterSection.appendChild(paginationContainer);
  }

  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  
  paginationContainer.innerHTML = `
    <span style="font-size: 0.9rem; color: var(--text-muted, #64748b);">
      Showing ${(totalItems === 0) ? 0 : (currentPage - 1) * rowsPerPage + 1} to ${Math.min(currentPage * rowsPerPage, totalItems)} of <strong>${totalItems}</strong> students
    </span>
    <div style="display: flex; gap: 0.5rem;">
      <button class="btn btn-sm" id="btn-prev-page" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
      <span style="display: flex; align-items: center; padding: 0 0.5rem; font-weight: 600;">Page ${currentPage} of ${totalPages}</span>
      <button class="btn btn-sm" id="btn-next-page" ${currentPage >= totalPages ? 'disabled' : ''}>Next</button>
    </div>
  `;

  document.getElementById('btn-prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderRoster();
    }
  });

  document.getElementById('btn-next-page')?.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderRoster();
    }
  });
}

/**
 * Updates metric summary counters
 */
function updateMetrics() {
  const totalCountEl = document.getElementById('total-students-count');
  const onCampusCountEl = document.getElementById('on-campus-count');

  const activeOnly = activeStudents.filter(s => s.isActive);
  const onCampusOnly = activeOnly.filter(s => s.status === 'ON CAMPUS');

  if (totalCountEl) totalCountEl.textContent = activeOnly.length.toLocaleString();
  if (onCampusCountEl) onCampusCountEl.textContent = onCampusOnly.length.toLocaleString();
}

function addStudent(id, name, grade, photo) {
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
    enrolledDate: new Date().toISOString().split('T')[0]
  };

  activeStudents.push(newStudent);
  persistData();
  return true;
}

function toggleStudentStatus(id) {
  const student = activeStudents.find(s => s.id === id);
  if (student) {
    student.status = student.status === 'ON CAMPUS' ? 'OFF CAMPUS' : 'ON CAMPUS';
    persistData();
  }
}

function withdrawStudent(id) {
  if (confirm(`Are you sure you want to withdraw student ID: ${id}?`)) {
    const student = activeStudents.find(s => s.id === id);
    if (student) {
      student.isActive = false;
      student.status = 'WITHDRAWN';
      persistData();
    }
  }
}

function graduateStudent(id) {
  const index = activeStudents.findIndex(s => s.id === id);
  if (index !== -1) {
    const [student] = activeStudents.splice(index, 1);
    archivedStudents.push({ ...student, status: 'GRADUATED', isActive: false });
    persistData();
  }
}

function batchGraduateSeniors() {
  const seniors = activeStudents.filter(s => s.grade === '12' && s.isActive);
  if (seniors.length === 0) {
    alert("No eligible Grade 12 seniors found.");
    return;
  }
  if (confirm(`Graduate and archive ${seniors.length} Grade 12 senior(s)?`)) {
    seniors.forEach(senior => graduateStudent(senior.id));
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  renderRoster();
  updateMetrics();

  document.getElementById('roster-search')?.addEventListener('input', () => {
    currentPage = 1;
    renderRoster();
  });

  const modal = document.getElementById('add-student-modal');
  document.getElementById('btn-add-student')?.addEventListener('click', () => modal?.showModal());
  document.getElementById('modal-cancel')?.addEventListener('click', () => modal?.close());

  document.getElementById('add-student-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('student-name').value.trim();
    const id = document.getElementById('student-id').value.trim();
    const grade = document.getElementById('student-grade').value;
    const photo = document.getElementById('student-photo').value.trim();

    if (addStudent(id, name, grade, photo)) {
      e.target.reset();
      modal?.close();
    }
  });

  document.getElementById('btn-batch-graduate')?.addEventListener('click', batchGraduateSeniors);
});
