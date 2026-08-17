// Campus Flow - Student Data

const students = [
  {
    id: "100001",
    firstName: "John",
    lastName: "Doe",
    grade: "9",
    status: "ON CAMPUS"
  }
];

let movementCount = 0;

function findStudent(studentId) {
  return students.find(student => student.id === studentId);
}

function changeStudentStatus(studentId) {
  const student = findStudent(studentId);

  if (!student) {
    return null;
  }

  if (student.status === "ON CAMPUS") {
    student.status = "OFF CAMPUS";
  } else {
    student.status = "ON CAMPUS";
  }

  movementCount++;

  return student;
}

function getStudentCount() {
  return students.length;
}

function getOnCampusCount() {
  return students.filter(
    student => student.status === "ON CAMPUS"
  ).length;
}

function getMovementCount() {
  return movementCount;
}
