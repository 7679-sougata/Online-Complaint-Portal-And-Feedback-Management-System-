// EscalateComplaint.js
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./EscalateComplaint.css";

export default function EscalateComplaint() {
  const { id } = useParams(); // complaint ID from route
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [authorities, setAuthorities] = useState([]);
  const [selectedAuthority, setSelectedAuthority] = useState("");
  const [notifyAll, setNotifyAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch complaint details
  useEffect(() => {
    axios
      .get(`http://localhost:5000/complaints/${id}`)
      .then((res) => setComplaint(res.data))
      .catch(() => setMessage("Failed to fetch complaint details."));
  }, [id]);

  // Fetch higher authorities (admins/staff)
  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/staff")
      .then((res) => setAuthorities(res.data))
      .catch(() => setMessage("Failed to fetch authority list."));
  }, []);

  const handleEscalate = async () => {
    if (!selectedAuthority) {
      alert("Please select a higher authority to escalate.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/admin/complaints/${id}/escalate`, {
        higher_authority_id: selectedAuthority,
        notify_all: notifyAll,
      });

      setMessage("Complaint escalated successfully!");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      console.error(err);
      setMessage("Failed to escalate complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="escalate-container">
      <div className="escalate-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ←
        </button>
        <h2>Escalate Complaint</h2>
      </div>

      {complaint ? (
        <>
          {/* Complaint Details */}
          <div className="complaint-details">
            <h3>Complaint Details</h3>
            <div className="complaint-box">
              <div className="icon">📄</div>
              <div className="details">
                <p className="subject">{complaint.subject}</p>
                <p className="id">Complaint ID: {complaint.id}</p>
              </div>
            </div>
          </div>

          {/* Escalation Options */}
          <div className="options-section">
            <h3>Escalation Options</h3>
            <select
              className="authority-select"
              value={selectedAuthority}
              onChange={(e) => setSelectedAuthority(e.target.value)}
            >
              <option value="">Select Higher Authority</option>
              {authorities.map((auth) => (
                <option key={auth.id} value={auth.id}>
                  {auth.name} ({auth.email})
                </option>
              ))}
            </select>

            <div className="notify-toggle">
              <label>Notify All Parties</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notifyAll}
                  onChange={(e) => setNotifyAll(e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          {message && <div className="message">{message}</div>}

          {/* Escalate Button */}
          <button
            onClick={handleEscalate}
            className="escalate-btn"
            disabled={loading}
          >
            {loading ? "Escalating..." : "Escalate Complaint"}
          </button>
        </>
      ) : (
        <p className="loading">Loading complaint...</p>
      )}
    </div>
  );
}
