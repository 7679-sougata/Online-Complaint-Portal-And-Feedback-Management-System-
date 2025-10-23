import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import pool from "./Service.js"; // MySQL connection


import fs from "fs";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";


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
    // ✅ Include both admin and staff roles in the list
    const [rows] = await pool.query(`
      SELECT id, name, email
      FROM users
      WHERE role IN ('admin', 'staff')
    `);
    res.json(rows);
  } catch (err) {
    console.error("Admin staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =============================
   ADMIN: ESCALATE COMPLAINT (Manual)
============================= */
app.post("/admin/complaints/:id/escalate", async (req, res) => {
  const complaintId = req.params.id;
  const { higher_authority_id, notify_all } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM complaints WHERE id = ?", [complaintId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    await pool.query(
      `UPDATE complaints
       SET status = 'Escalated',
           escalated = 1,
           escalated_at = NOW(),
           assigned_to = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [higher_authority_id, complaintId]
    );

    await pool.query(
      `INSERT INTO status_logs (complaint_id, status, comment, updated_by)
       VALUES (?, ?, ?, ?)`,
      [complaintId, "Escalated", "Complaint escalated to higher authority", higher_authority_id]
    );

    if (notify_all) {
      console.log(`📩 Notification: Complaint #${complaintId} escalated to user ID ${higher_authority_id}`);
    }

    res.status(200).json({ message: "Complaint escalated successfully" });
  } catch (err) {
    console.error("❌ Escalation error:", err);
    res.status(500).json({ message: "Failed to escalate complaint", error: err.message });
  }
});

/* =============================
   AUTO-ESCALATION CHECK (Runs hourly)
============================= */
const AUTO_ESCALATE_DAYS = 7; // threshold days
const HIGHER_AUTHORITY_ID = 1; // senior admin ID (update to match your DB)

async function autoEscalateComplaints() {
  try {
    const [pending] = await pool.query(
      `SELECT id FROM complaints
       WHERE status NOT IN ('Resolved', 'Closed')
         AND escalated = 0
         AND TIMESTAMPDIFF(DAY, updated_at, NOW()) >= ?`,
      [AUTO_ESCALATE_DAYS]
    );

    for (const c of pending) {
      await pool.query(
        `UPDATE complaints
         SET status = 'Escalated',
             escalated = 1,
             escalated_at = NOW(),
             assigned_to = ?,
             updated_at = NOW()
         WHERE id = ?`,
        [HIGHER_AUTHORITY_ID, c.id]
      );

      await pool.query(
        `INSERT INTO status_logs (complaint_id, status, comment, updated_by)
         VALUES (?, 'Escalated', 'Auto-escalated after 7 days of inactivity', ?)`,
        [c.id, HIGHER_AUTHORITY_ID]
      );

      console.log(`⚠️ Auto-escalated complaint #${c.id}`);
    }

    if (pending.length > 0) console.log(`✅ ${pending.length} complaints auto-escalated`);
  } catch (err) {
    console.error("❌ Auto-escalation error:", err);
  }
}

// Run every hour
setInterval(autoEscalateComplaints, 3600000);

/* =============================
   START SERVER
============================= */
app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
  console.log("✅ Database connected successfully");
});




/* =============================
   ADMIN: GENERATE REPORT & EXPORT (CSV / PDF)
   POST body: { startDate, endDate, submissionType, format, admin_id }
   startDate/endDate format: "YYYY-MM-DD"
============================= */
app.post("/admin/reports/export", async (req, res) => {
  const { startDate, endDate, submissionType, format, admin_id } = req.body;
  try {
    let query = `
      SELECT id, user_id, subject, submission_type, status, created_at, updated_at, escalated, escalated_at, assigned_to
      FROM complaints
      WHERE 1=1
    `;
    const params = [];

    if (startDate && endDate) {
      query += ` AND DATE(created_at) BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    if (submissionType && submissionType !== "All") {
      query += ` AND submission_type = ?`;
      params.push(submissionType);
    }

    // fetch data
    const [rows] = await pool.query(query, params);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "No complaints found in the given range" });
    }

    // optional: log the request in report_logs
    if (admin_id) {
      try {
        await pool.query(
          `INSERT INTO report_logs (admin_id, start_date, end_date, category, format)
           VALUES (?, ?, ?, ?, ?)`,
          [admin_id || null, startDate || null, endDate || null, submissionType || null, format || "csv"]
        );
      } catch (err) {
        console.warn("⚠️ Could not log report generation:", err.message);
      }
    }

    // CSV export
    if (format === "csv") {
      const { Parser } = await import("json2csv");
      const parser = new Parser();
      const csv = parser.parse(rows);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=complaint_report.csv");
      return res.send(csv);
    }

    // PDF export
    if (format === "pdf") {
      const PDFDocument = (await import("pdfkit")).default;
      const doc = new PDFDocument({ margin: 30, size: "A4" });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=complaint_report.pdf");
      doc.pipe(res);

      doc.fontSize(18).text("Complaint Report", { align: "center" });
      doc.moveDown();

      rows.forEach((r, i) => {
        doc.fontSize(12).text(`${i + 1}. ${r.subject}`);
        doc.fontSize(10).text(
          `ID: ${r.id} | Type: ${r.submission_type || "N/A"} | Status: ${r.status || "N/A"}`
        );
        doc.fontSize(10).text(`Created: ${new Date(r.created_at).toLocaleString()}`);
        doc.fontSize(10).text(
          `Escalated: ${r.escalated ? "Yes" : "No"} ${
            r.escalated_at ? `| Escalated At: ${new Date(r.escalated_at).toLocaleString()}` : ""
          }`
        );
        doc.moveDown();
      });

      doc.end();
      return; // end PDF stream
    }

    return res.status(400).json({ message: "Invalid export format. Use 'csv' or 'pdf'." });
  } catch (err) {
    console.error("❌ Report generation error:", err);
    return res.status(500).json({ message: "Server error generating report" });
  }
});

