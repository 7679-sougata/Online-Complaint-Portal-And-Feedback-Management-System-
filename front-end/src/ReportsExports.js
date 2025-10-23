import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import "./ReportsExports.css";

export default function ReportsExports() {
  const { user } = useContext(AuthContext); // admin user
  const [submissionTypes, setSubmissionTypes] = useState(["All"]);
  const [selectedType, setSelectedType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("csv");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/complaints")
      .then((res) => {
        const types = [
          "All",
          ...new Set(res.data.map((c) => c.submission_type || "Unspecified")),
        ];
        setSubmissionTypes(types);
      })
      .catch((err) => {
        console.error("Failed to load submission types", err);
      });
  }, []);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select a date range");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/admin/reports/export",
        {
          startDate,
          endDate,
          submissionType: selectedType,
          format,
          admin_id: user ? user.id : null,
        },
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: format === "csv" ? "text/csv" : "application/pdf",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download =
        format === "csv"
          ? "complaint_report.csv"
          : "complaint_report.pdf";
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Report generation failed", err);
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">
      <div className="report-container">
        <h2>Reports & Exports</h2>

        <div className="section">
          <h3>Report Parameters</h3>

          <label>Date Range</label>
          <div className="date-range">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="to-text">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <label>Submission Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {submissionTypes.map((type, idx) => (
              <option key={idx} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="section">
          <h3>Export Options</h3>
          <div className="export-buttons">
            <button
              className={format === "csv" ? "active" : ""}
              onClick={() => setFormat("csv")}
            >
              CSV
            </button>
            <button
              className={format === "pdf" ? "active" : ""}
              onClick={() => setFormat("pdf")}
            >
              PDF
            </button>
          </div>
        </div>

        <button
          className="generate-btn"
          onClick={handleGenerateReport}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>
    </div>
  );
}
