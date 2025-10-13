// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pool from "./Service.js"; // MySQL connection

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* =============================
   USER SIGNUP
============================= */
app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, password, role || "user"]
    );

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============================
   USER LOGIN
============================= */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("✅ Logged in:", user.name, "Role:", user.role);

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============================
   SUBMIT COMPLAINT
============================= */
app.post("/complaints", async (req, res) => {
  const { userId, submissionType, subject, description, filePath } = req.body;

  try {
    if (!subject || !description) {
      return res.status(400).json({ message: "Subject and Description required" });
    }

    const [result] = await pool.query(
      `INSERT INTO complaints (user_id, submission_type, subject, description, file_path)
       VALUES (?, ?, ?, ?, ?)`,
      [userId || null, submissionType, subject, description, filePath || null]
    );

    // Log initial status
    await pool.query(
      `INSERT INTO status_logs (complaint_id, status, comment, updated_by)
       VALUES (?, ?, ?, ?)`,
      [
        result.insertId,
        "Submitted",
        "Complaint has been submitted and is awaiting review.",
        userId || null,
      ]
    );

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaintId: result.insertId,
    });
  } catch (err) {
    console.error("Complaint error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============================
   GET USER COMPLAINTS
============================= */
app.get("/complaints/user/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await pool.query(
      `SELECT id, status, subject, description, file_path, created_at
       FROM complaints WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Get complaints error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============================
   GET SINGLE COMPLAINT DETAILS
============================= */
app.get("/complaints/:id", async (req, res) => {
  const complaintId = req.params.id;

  try {
    const [rows] = await pool.query("SELECT * FROM complaints WHERE id = ?", [complaintId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Get complaint error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============================
   GET STATUS LOGS FOR A COMPLAINT
============================= */
app.get("/statuslogs/:id", async (req, res) => {
  const complaintId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.status, s.comment, s.updated_at, u.name AS updated_by_name
       FROM status_logs s
       LEFT JOIN users u ON s.updated_by = u.id
       WHERE s.complaint_id = ?
       ORDER BY s.updated_at ASC`,
      [complaintId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No status updates yet" });
    }

    res.json(rows);
  } catch (err) {
    console.error("Get status logs error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============================
   ADMIN: GET ALL COMPLAINTS
============================= */
app.get("/admin/complaints", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, 
             u.name AS user_name, 
             s.name AS assigned_name
      FROM complaints c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users s ON c.assigned_to = s.id
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Admin complaints error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============================
   ADMIN: UPDATE COMPLAINT STATUS / ASSIGN STAFF
============================= */
app.put("/admin/complaints/:id", async (req, res) => {
  const complaintId = req.params.id;
  const { status, assigned_to, admin_id } = req.body;

  console.log("🟡 Update request:", { complaintId, status, assigned_to, admin_id });

  try {
    const [check] = await pool.query("SELECT * FROM complaints WHERE id = ?", [complaintId]);
    if (check.length === 0) {
      console.warn("⚠️ Complaint not found:", complaintId);
      return res.status(404).json({ message: "Complaint not found" });
    }

    await pool.query(
      `UPDATE complaints
       SET status = ?, assigned_to = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, assigned_to || null, complaintId]
    );

    await pool.query(
      `INSERT INTO status_logs (complaint_id, status, comment, updated_by)
       VALUES (?, ?, ?, ?)`,
      [complaintId, status, "Status updated by admin", admin_id || null]
    );

    console.log("✅ Complaint updated successfully:", complaintId);
    res.json({ message: "Complaint updated successfully" });
  } catch (err) {
    console.error("❌ Update complaint error:", err);
    res.status(500).json({ message: "Failed to update complaint", error: err.message });
  }
});

/* =============================
   ADMIN: GET ALL STAFF
============================= */
app.get("/admin/staff", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT id, name, email FROM users WHERE role = 'staff'`);
    res.json(rows);
  } catch (err) {
    console.error("Admin staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============================
   START SERVER
============================= */
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
  console.log("✅ Database connected successfully");
});
