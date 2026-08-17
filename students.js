/*
  CAMPUS FLOW
  Student Database
*/

const CAMPUS_FLOW_STUDENTS = {

  "100001": {
    id: "100001",
    firstName: "John",
    lastName: "Doe",
    grade: "9",
    homeroom: "101",
    cardNumber: "100001",
    active: true
  },

  "100002": {
    id: "100002",
    firstName: "Jane",
    lastName: "Smith",
    grade: "10",
    homeroom: "204",
    cardNumber: "100002",
    active: true
  },

  "100003": {
    id: "100003",
    firstName: "Michael",
    lastName: "Johnson",
    grade: "11",
    homeroom: "305",
    cardNumber: "100003",
    active: true
  }

};


/*
  Find a student using
  the ID-card number.
*/

function findStudentByCard(cardNumber) {

  const id =
    String(cardNumber)
      .trim()
      .toUpperCase();

  const student =
    CAMPUS_FLOW_STUDENTS[id];

  if (!student) {
    return null;
  }

  if (!student.active) {
    return null;
  }

  return student;

}


/*
  Return the student's
  full name.
*/

function getStudentName(student) {

  if (!student) {
    return "";
  }

  return (
    student.firstName +
    " " +
    student.lastName
  );

}


/*
  Return a formatted
  student record.
*/

function formatStudent(student) {

  if (!student) {
    return null;
  }

  return {

    id: student.id,

    name:
      getStudentName(student),

    grade:
      student.grade,

    homeroom:
      student.homeroom,

    cardNumber:
      student.cardNumber,

    active:
      student.active

  };

}


/*
  Check whether an ID
  exists in the database.
*/

function studentExists(cardNumber) {

  return (
    findStudentByCard(cardNumber)
    !== null
  );

}


/*
  Count active students.
*/

function getStudentDatabaseCount() {

  return Object.values(
    CAMPUS_FLOW_STUDENTS
  ).filter(
    student =>
      student.active === true
  ).length;

}
