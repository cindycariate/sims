const API_BASE_URL = "http://localhost:3000";

// --- Student CRUD ---
const studentForm = document.getElementById("studentForm");
const studentTableBody = document.querySelector("#studentTable tbody");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const recordCount = document.getElementById("recordCount");
const genderFilter = document.getElementById("genderFilter");

async function loadStudents(searchTerm = "", genderFilterValue = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/students`);
    const students = await res.json();

    const filtered = students
      .filter(
        (s) =>
          s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((s) => {
        if (!genderFilterValue) return true;
        return s.gender.toLowerCase() === genderFilterValue.toLowerCase();
      });

    studentTableBody.innerHTML = "";
    recordCount.textContent = `Showing ${filtered.length} record(s).`;

    filtered.slice(0, 50).forEach((student) => {
      const row = studentTableBody.insertRow();
      row.insertCell().textContent = student.studentId;
      row.insertCell().textContent = student.fullName;
      row.insertCell().textContent = student.gender;
      row.insertCell().textContent = student.program;
      row.insertCell().textContent = student.yearLevel;
      const actionCell = row.insertCell();
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "delete-btn";
      delBtn.onclick = () => deleteStudent(student.studentId);
      actionCell.appendChild(delBtn);
    });
  } catch (err) {
    console.error(err);
    alert("Failed to load students.");
  }
}

async function addStudent(e) {
  e.preventDefault();
  const studentId = document.getElementById("studentId").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const gender = document.getElementById("gender").value;
  const program = document.getElementById("program").value.trim();
  const yearLevel = document.getElementById("yearLevel").value;

  if (!studentId || !fullName || !gender || !program || !yearLevel) {
    alert("Fill all required fields.");
    return;
  }

  const formData = {
    studentId,
    fullName,
    gender,
    program,
    yearLevel,
    gmail: `${studentId.toLowerCase().replace(/[^a-z0-9]/g, "")}@csu.edu.ph`,
    university: "Caraga State University",
  };

  try {
    const res = await fetch(`${API_BASE_URL}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      studentForm.reset();
      loadStudents();
    } else alert(`Error: ${data.error}`);
  } catch (err) {
    console.error(err);
    alert("Failed to add student.");
  }
}

async function deleteStudent(studentId) {
  if (!confirm(`Delete student ID ${studentId}?`)) return;
  try {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      loadStudents();
    } else alert(`Error: ${data.error}`);
  } catch (err) {
    console.error(err);
    alert("Failed to delete student.");
  }
}

// --- Search / Filter ---
function performSearchAndFilter() {
  loadStudents(searchInput.value, genderFilter.value);
}

studentForm.addEventListener("submit", addStudent);
searchBtn.addEventListener("click", performSearchAndFilter);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") performSearchAndFilter();
});
genderFilter.addEventListener("change", performSearchAndFilter);

document.addEventListener("DOMContentLoaded", () => {
  loadStudents();
});

// --- LLM Chat ---
const chatBox = document.getElementById("chatBox");
const chatMessage = document.getElementById("chatMessage");
const sendChatBtn = document.getElementById("sendChatBtn");

function addChatMessage(sender, text) {
  const msg = document.createElement("p");
  msg.className = sender === "user" ? "user-msg" : "llm-msg";
  msg.innerHTML = `<strong>${sender.toUpperCase()}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendChat() {
  const message = chatMessage.value.trim();
  if (!message) return;

  addChatMessage("user", message);
  chatMessage.value = "";

  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    addChatMessage("llm", data.reply || data.error || "No response.");
  } catch (err) {
    addChatMessage("llm", "ERROR: Cannot connect to server.");
  }
}

sendChatBtn.addEventListener("click", sendChat);
chatMessage.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendChat();
});
