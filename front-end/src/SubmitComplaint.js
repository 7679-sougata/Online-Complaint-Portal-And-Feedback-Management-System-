import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SubmitComplaint.css";

const SubmitComplaint = () => {
  const [submissionType, setSubmissionType] = useState("Public");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  // Replace with actual logged-in user ID from your auth/session
  const userId = 1;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          submissionType,
          subject,
          description,
          filePath: file ? file.name : null,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setSubject("");
        setDescription("");
        setFile(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("Failed to submit complaint");
    }
  };

  return (
    <div className="sc-container">
      <div className="sc-header">
        <button className="sc-back-btn" onClick={() => navigate(-1)}>
          &#8592;
        </button>
        <span className="sc-header-title">Submit Complaint</span>
      </div>
      <form className="sc-form" onSubmit={handleSubmit}>
        <label className="sc-label">Submission Type</label>
        <div className="sc-type-btns">
          <button
            type="button"
            className={submissionType === "Public" ? "active" : ""}
            onClick={() => setSubmissionType("Public")}
          >
            Public
          </button>
          <button
            type="button"
            className={submissionType === "Anonymous" ? "active" : ""}
            onClick={() => setSubmissionType("Anonymous")}
          >
            Anonymous
          </button>
        </div>

        <label className="sc-label">Complaint Details</label>
        <input
          type="text"
          className="sc-input"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <textarea
          className="sc-textarea"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label className="sc-label">Attachments (Optional)</label>
        <div className="sc-attachment-box">
          <div className="sc-media-title">Add Media</div>
          <div className="sc-media-desc">Attach images or videos to support your complaint.</div>
          <label className="sc-upload-btn">
            Upload
            <input
              type="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
              accept="image/*,video/*"
            />
          </label>
        </div>

        <button type="submit" className="sc-submit-btn">
          Submit Complaint
        </button>
      </form>

      <nav className="sc-bottom-nav">
        <button onClick={() => navigate("/dashboard")}>
          <span role="img" aria-label="home">🏠</span>
          <div>Dashboard</div>
        </button>
        <button className="active" onClick={() => navigate("/submit-complaint")}>
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

export default SubmitComplaint;