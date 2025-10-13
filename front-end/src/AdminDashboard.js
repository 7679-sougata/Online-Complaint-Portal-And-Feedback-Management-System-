import React, { useEffect, useState, useCallback, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const { user, logout } = useContext(AuthContext);

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/admin/staff");
      setStaffList(res.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  }, []);

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
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.id}>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
