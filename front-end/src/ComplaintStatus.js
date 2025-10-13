import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ComplaintStatus.css";

const ComplaintStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [statusLogs, setStatusLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch complaint
    fetch(`http://localhost:5000/complaints/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setComplaint(data);
        } else {
          setError("Complaint not found.");
        }
      })
      .catch(() => setError("Error fetching complaint."));

    // Fetch status logs
    fetch(`http://localhost:5000/statuslogs/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setStatusLogs(data);
        } else {
          setStatusLogs([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching logs:", err);
        setStatusLogs([]);
      });
  }, [id]);

  if (error)
    return (
      <div className="sc-container">
        <div className="sc-header">
          <button className="sc-back-btn" onClick={() => navigate(-1)}>
            &#8592;
          </button>
          <span className="sc-header-title">Complaint Status</span>
        </div>
        <div style={{ marginTop: "32px", color: "red", textAlign: "center" }}>
          {error}
        </div>
      </div>
    );

  if (!complaint) return <div className="sc-container">Loading...</div>;

  const steps = ["Submitted", "In Progress", "Resolved"];
  const currentStep =
    complaint.status && steps.includes(complaint.status)
      ? steps.indexOf(complaint.status) + 1
      : 1;

  return (
    <div className="sc-container">
      <div className="sc-header">
        <button className="sc-back-btn" onClick={() => navigate(-1)}>
          &#8592;
        </button>
        <span className="sc-header-title">Complaint Status</span>
      </div>

      <div style={{ marginTop: "16px" }}>
        <div style={{ fontWeight: "600", fontSize: "1.1rem" }}>
          Complaint ID: #{complaint.id}
        </div>
        <div className="sc-status-box" style={{ margin: "18px 0" }}>
          <div>Status</div>
          <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
            {complaint.status}
          </div>
        </div>

        {/* ✅ Progress tracker */}
        <div className="progress-container">
          {steps.map((step, index) => (
            <div
              key={step}
              className={`step ${index + 1 <= currentStep ? "active" : ""}`}
            >
              <div className="circle">{index + 1}</div>
              <div className="label">{step}</div>
              {index < steps.length - 1 && <div className="line"></div>}
            </div>
          ))}
        </div>

        {/* ✅ Status history */}
        <div className="status-log">
          <h3>Status History</h3>
          {statusLogs.length === 0 ? (
            <p>No status updates yet.</p>
          ) : (
            <ul>
              {statusLogs.map((log, idx) => (
                <li key={idx}>
                  <strong>{log.status}</strong>
                  {log.comment && <span> — {log.comment}</span>}
                  <div className="time">
                    {log.updated_at
                      ? new Date(log.updated_at).toLocaleString("en-IN", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ✅ Bottom Navigation */}
      <nav className="sc-bottom-nav">
        <button onClick={() => navigate("/dashboard")}>
          <span role="img" aria-label="home">
            🏠
          </span>
          <div>Dashboard</div>
        </button>
        <button onClick={() => navigate("/submit-complaint")}>
          <span role="img" aria-label="plus">
            ➕
          </span>
          <div>Submit Complaint</div>
        </button>
        <button className="active" onClick={() => navigate("/my-complaints")}>
          <span role="img" aria-label="doc">
            📄
          </span>
          <div>My Complaints</div>
        </button>
        <button onClick={() => navigate("/profile")}>
          <span role="img" aria-label="profile">
            👤
          </span>
          <div>Profile</div>
        </button>
      </nav>
    </div>
  );
};

export default ComplaintStatus;
