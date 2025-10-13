import React from "react";
import { useNavigate } from "react-router-dom";
import "./SubmitComplaint.css";

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user session or token here if needed
    navigate("/login");
  };

  return (
    <div className="sc-container">
      <div className="sc-header" style={{ justifyContent: "space-between" }}>
        <span className="sc-header-title">Profile</span>
        <button
          className="sc-logout-btn"
          style={{
            background: "#222",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "6px 16px",
            fontWeight: "500",
            cursor: "pointer",
            marginLeft: "auto"
          }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h3>Your Profile</h3>
        <p>Manage your account information here.</p>
      </div>
      <nav className="sc-bottom-nav">
        <button onClick={() => navigate("/dashboard")}>
          <span role="img" aria-label="home">🏠</span>
          <div>Dashboard</div>
        </button>
        <button onClick={() => navigate("/submit-complaint")}>
          <span role="img" aria-label="plus">➕</span>
          <div>Submit Complaint</div>
        </button>
        <button onClick={() => navigate("/my-complaints")}>
          <span role="img" aria-label="doc">📄</span>
          <div>My Complaints</div>
        </button>
        <button className="active" onClick={() => navigate("/profile")}>
          <span role="img" aria-label="profile">👤</span>
          <div>Profile</div>
        </button>
      </nav>
    </div>
  );
};

export default Profile;