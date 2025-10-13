import React from "react";
import { useNavigate } from "react-router-dom";
import "./SubmitComplaint.css";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="sc-container">
      <div className="sc-header">
        <span className="sc-header-title">Dashboard</span>
      </div>
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h3>Welcome to your Dashboard!</h3>
        <p>Here you can see an overview of your activity.</p>
      </div>
      <nav className="sc-bottom-nav">
        <button className="active" onClick={() => navigate("/dashboard")}>
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
        <button onClick={() => navigate("/profile")}>
          <span role="img" aria-label="profile">👤</span>
          <div>Profile</div>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;