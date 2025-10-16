import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const { user, logout } = useContext(AuthContext);

  // Fetch all complaints
  const fetchComplaints = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  }, []);

  // Fetch staff list (higher authorities)
  const fetchStaff = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/staff");
      setStaffList(res.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  }, []);

  // Update complaint (assign or change status)
  const updateComplaint = async (id, status, assigned_to) => {
    if (!user) {
      alert("Session expired. Please log in again.");
      logout();
      return;
    }

    try {
      await axios.put(`http://localhost:5000/admin/complaints/${id}`, {
        status,
        assigned_to,
        admin_id: user.id,
      });
      fetchComplaints();
    } catch (err) {
      console.error("❌ Failed to update complaint:", err);
      alert("Failed to update complaint.");
    }
  };

  // Escalate complaint to higher authority
  const escalateComplaint = async (id) => {
    if (!user) {
      alert("Session expired. Please log in again.");
      logout();
      return;
    }

    const confirmEscalate = window.confirm(
      "Are you sure you want to escalate this complaint?"
    );
    if (!confirmEscalate) return;

    try {
      await axios.post(`http://localhost:5000/admin/complaints/${id}/escalate`, {
        higher_authority_id: user.id, // For simplicity
        notify_all: true,
      });
      alert("Complaint escalated successfully!");
      fetchComplaints();
    } catch (err) {
      console.error("❌ Escalation failed:", err);
      alert("Failed to escalate complaint.");
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchStaff();
  }, [fetchComplaints, fetchStaff]);

  return (
    <div className="dashboard-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>

      <table className="complaint-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Escalated</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {complaints.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                No complaints found.
              </td>
            </tr>
          ) : (
            complaints.map((c) => (
              <tr
                key={c.id}
                className={c.escalated ? "escalated-row" : ""}
              >
                <td>{c.id}</td>
                <td>{c.user_name || "Anonymous"}</td>
                <td>{c.subject}</td>
                <td>{c.status}</td>
                <td>
                  <select
                    value={c.assigned_to || ""}
                    onChange={(e) =>
                      updateComplaint(c.id, c.status, e.target.value)
                    }
                  >
                    <option value="">Unassigned</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {c.escalated ? (
                    <span className="escalated-flag">
                      ✅ Yes (
                      {c.escalated_at
                        ? new Date(c.escalated_at).toLocaleString()
                        : ""}
                      )
                    </span>
                  ) : (
                    "No"
                  )}
                </td>
                <td>
                  <div className="admin-actions">
                    <select
                      value={c.status}
                      onChange={(e) =>
                        updateComplaint(c.id, e.target.value, c.assigned_to)
                      }
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    {!c.escalated && (
                      <button
                        className="escalate-btn"
                        onClick={() => escalateComplaint(c.id)}
                      >
                        🚀 Escalate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
