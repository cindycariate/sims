require("dotenv").config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "students.json");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log("DATA_FILE PATH:", DATA_FILE);

// Helper: read students
function readStudents() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Helper: write students
function writeStudents(students) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(students, null, 2));
}

// GET all students
app.get("/students", (req, res) => {
  const students = readStudents();
  res.json(students);
});

// POST new student
app.post("/students", (req, res) => {
  const students = readStudents();
  const newStudent = req.body;

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

  if (
    students.some(
      (s) => s.studentId.toLowerCase() === newStudent.studentId.toLowerCase()
    )
  ) {
    return res.status(400).json({ error: "Student ID already exists" });
  }

  students.push(newStudent);
  writeStudents(students);
  res.json({ message: "Student added", student: newStudent });
});

// DELETE student by ID
app.delete("/students/:id", (req, res) => {
  const students = readStudents();
  const filtered = students.filter(
    (s) => s.studentId.toLowerCase() !== req.params.id.toLowerCase()
  );
  writeStudents(filtered);
  res.json({ message: "Student deleted" });
});

// Serve main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Gemini Chat (using @google/genai) ---
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  const students = readStudents();

  if (!message) return res.status(400).json({ error: "Message is required." });

  if (!students.length)
    return res.json({
      reply: "The student dataset is empty. Add records first.",
    });

  try {
    const prompt = `
You are an assistant that analyzes STUDENT DATA only.
Answer based ONLY on the provided dataset.

USER QUESTION:
${message}

STUDENT DATA:
${JSON.stringify(students, null, 2)}

If the question is unrelated to students, answer:
"I can only answer questions about the student data."
    `;

    const output = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const reply = output.text || "No reply from Gemini API.";
    res.json({ reply });
  } catch (err) {
    console.error("GEMINI ERROR:", err);
    res.status(500).json({
      error: "Failed to connect to Gemini API. Check your API key or network.",
    });
  }
});

// Start server
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
