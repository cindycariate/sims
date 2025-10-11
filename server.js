const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = "students.json";

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // your folder with index.html

// 🔹 Helper: read students
function readStudents() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, "utf8");
  try {
    return JSON.parse(data);
  } catch (err) {
    console.error("Error parsing JSON:", err);
    return [];
  }
}

// 🔹 Helper: write students
function writeStudents(students) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
}

// 🔹 GET all students
app.get("/students", (req, res) => {
  const students = readStudents();
  res.json(students);
});

// 🔹 POST new student
app.post("/students", (req, res) => {
  const students = readStudents();
  const newStudent = req.body;

  // validation
  if (
    !newStudent.studentId ||
    !newStudent.fullName ||
    !newStudent.gender ||
    !newStudent.gmail ||
    !newStudent.program ||
    !newStudent.yearLevel ||
    !newStudent.university
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // check duplicate ID
  const exists = students.some(
    (s) => s.studentId.toLowerCase() === newStudent.studentId.toLowerCase()
  );
  if (exists) {
    return res.status(400).json({ error: "Student ID already exists" });
  }

  students.push(newStudent);
  writeStudents(students);
  res.json({ message: "Student added", student: newStudent });
});

// 🔹 DELETE student by ID
app.delete("/students/:id", (req, res) => {
  const students = readStudents();
  const id = req.params.id;
  const filtered = students.filter(
    (s) => s.studentId.toLowerCase() !== id.toLowerCase()
  );
  writeStudents(filtered);
  res.json({ message: "Student deleted" });
});

// 🔹 Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔹 Start server
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
