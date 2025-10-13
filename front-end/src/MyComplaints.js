import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyComplaint.css";

const MyComplaints = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const userId = 1; // Replace with actual logged-in user ID

  useEffect(() => {
    fetch(`http://localhost:5000/complaints/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setComplaints(data))
      .catch((err) => console.error(err));
  }, [userId]);

  return (
    <div className="mc-container">
      <div className="mc-header">
        <span className="mc-header-title">My Complaints</span>
      </div>
      <div className="mc-list">
        {complaints.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "40px", color: "#888" }}>
            No complaints found.
          </div>
        ) : (
          complaints.map((c) => (
            <div
              key={c.id}
              className="mc-item"
              onClick={() => navigate(`/complaints/${c.id}`)}
            >
              <div className="mc-item-row">
                <span className="mc-item-id">#{c.id}</span>
                <span className={`mc-status ${c.status ? c.status.replace(" ", "-").toLowerCase() : ""}`}>
                  {c.status || "Submitted"}
                </span>
              </div>
              <div className="mc-item-subject">{c.subject}</div>
              <div className="mc-item-date">
                {c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}
              </div>
            </div>
          ))
        )}
      </div>
      <nav className="mc-bottom-nav">
        <button onClick={() => navigate("/dashboard")}>
          <span role="img" aria-label="home">🏠</span>
          <div>Dashboard</div>
        </button>
        <button onClick={() => navigate("/submit-complaint")}>
          <span role="img" aria-label="plus">➕</span>
          <div>Submit Complaint</div>
        </button>
        <button className="active" onClick={() => navigate("/my-complaints")}>
          <span role="img" aria-label="doc">📄</span>
          <div>My Complaints</div>
        </button>
        <button onClick={() => navigate("/profile")}>
          <span role="img" aria-label="profile">👤</span>
          <div>Profile</div>
        </button>
      </nav>
    </div>
  );
};

export default MyComplaints;