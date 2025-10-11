const API_URL = "http://localhost:3000/students";

async function fetchStudents() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch");
    return await res.json();
  } catch (err) {
    console.error(err);
    alert("Error loading students.");
    return [];
  }
}

async function renderStudents() {
  const students = await fetchStudents();
  const searchValue = document
    .getElementById("searchInput")
    .value.toLowerCase();
  const tbody = document.getElementById("studentsTableBody");
  tbody.innerHTML = "";

  students
    .filter(
      (s) =>
        s.fullName.toLowerCase().includes(searchValue) ||
        s.program.toLowerCase().includes(searchValue)
    )
    .forEach((s, index) => {
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${s.studentId}</td>
          <td>${s.fullName}</td>
          <td>${s.gender}</td>
          <td>${s.gmail}</td>
          <td>${s.program}</td>
          <td>${s.yearLevel}</td>
          <td>${s.university}</td>
          <td>
           <button class="btn btn-sm btn-danger" onclick="deleteStudent('${
             s.studentId
           }')">Delete</button>
          </td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });
}

async function addStudent(event) {
  event.preventDefault();

  const student = {
    studentId: document.getElementById("studentId").value.trim(),
    fullName: document.getElementById("fullName").value.trim(),
    gender: document.getElementById("gender").value.trim(),
    gmail: document.getElementById("gmail").value.trim(),
    program: document.getElementById("program").value.trim(),
    yearLevel: document.getElementById("yearLevel").value.trim(),
    university: document.getElementById("university").value.trim(),
  };

  if (!student.gmail.endsWith("@gmail.com")) {
    alert("Please use a valid Gmail address.");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student),
    });
    if (!res.ok) throw new Error("Failed to add");

    document.getElementById("studentForm").reset();
    renderStudents();
  } catch (err) {
    console.error(err);
    alert("Error adding student.");
  }
}

async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete");
    renderStudents();
  } catch (err) {
    console.error(err);
    alert("Error deleting student.");
  }
}

document.getElementById("studentForm").addEventListener("submit", addStudent);
document
  .getElementById("searchInput")
  .addEventListener("input", renderStudents);

renderStudents();
