import { useEffect, useState } from "react";
import axios from "axios";
import "./Reports.css";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from "chart.js";

import { Pie, Bar } from "react-chartjs-2";
import jsPDF from "jspdf";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function Reports() {

  const [data, setData] = useState(null);
  const [days, setDays] = useState("7");
  const [location, setLocation] = useState("");

  /* ================= FETCH ================= */

useEffect(() => {
  const fetchReports = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/reports/global?days=${days}&location=${location}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        }
      );

      setData(res.data);

    } catch (err) {
      console.error("Report fetch error:", err);
    }
  };

  fetchReports();
}, [days, location]);

  if (!data) return <div className="loading-text">Loading reports...</div>;

  /* ================= CHART DATA ================= */

  const petitionChart = {
    labels: ["Active", "Under Review", "Closed"],
    datasets: [
      {
        data: [
          data.petitions.active,
          data.petitions.underReview,
          data.petitions.closed
        ],
        backgroundColor: [
          "#22c55e",
          "#f59e0b",
          "#ef4444"
        ]
      }
    ]
  };

  const pollChart = {
    labels: ["Active Polls", "Closed Polls"],
    datasets: [
      {
        label: "Poll Count",
        data: [data.polls.active, data.polls.closed],
        backgroundColor: "#3b82f6"
      }
    ]
  };

  /* ================= EXPORT CSV ================= */

  const handleExportCSV = () => {

    const rows = [
      ["Category", "Value"],

      ["Total Petitions", data.petitions.total],
      ["Active Petitions", data.petitions.active],
      ["Under Review", data.petitions.underReview],
      ["Closed Petitions", data.petitions.closed],

      ["Total Polls", data.polls.total],
      ["Active Polls", data.polls.active],
      ["Closed Polls", data.polls.closed],

      ["Total Votes", data.engagement.votes],
      ["Total Signatures", data.engagement.signatures]
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "reports.csv";
    link.click();
  };

  /* ================= EXPORT PDF ================= */

  const handleExportPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Reports Dashboard", 20, 20);

    doc.setFontSize(12);

    doc.text(`Total Petitions: ${data.petitions.total}`, 20, 40);
    doc.text(`Active: ${data.petitions.active}`, 20, 50);
    doc.text(`Under Review: ${data.petitions.underReview}`, 20, 60);
    doc.text(`Closed: ${data.petitions.closed}`, 20, 70);

    doc.text(`Total Polls: ${data.polls.total}`, 20, 90);
    doc.text(`Active Polls: ${data.polls.active}`, 20, 100);
    doc.text(`Closed Polls: ${data.polls.closed}`, 20, 110);

    doc.text(`Total Votes: ${data.engagement.votes}`, 20, 130);
    doc.text(`Total Signatures: ${data.engagement.signatures}`, 20, 140);

    doc.save("reports.pdf");
  };

  /* ================= UI ================= */

  return (
    <div className="reports-page">

      <h2 className="reports-title">Reports & Analytics</h2>

      {/* FILTERS */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "16px"
      }}>

        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="">All time</option>
        </select>

        <input
          type="text"
          placeholder="Filter by location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

      </div>

      <button className="export-btn" onClick={handleExportCSV}>
        Export CSV
      </button>

      <button className="export-btn" onClick={handleExportPDF}>
        Export PDF
      </button>

      {/* CARDS */}
      <div className="report-cards">

        <div className="report-card">
          <div className="report-value">{data.petitions.total}</div>
          <div className="report-label">Total Petitions</div>
        </div>

        <div className="report-card">
          <div className="report-value">{data.polls.total}</div>
          <div className="report-label">Total Polls</div>
        </div>

        <div className="report-card">
          <div className="report-value">{data.engagement.votes}</div>
          <div className="report-label">Total Votes</div>
        </div>

        <div className="report-card">
          <div className="report-value">{data.engagement.signatures}</div>
          <div className="report-label">Total Signatures</div>
        </div>

      </div>

      {/* CHARTS */}
      <div className="chart-grid">

        <div className="chart-card">
          <div className="chart-title">Petition Status</div>
          <Pie data={petitionChart} />
        </div>

        <div className="chart-card">
          <div className="chart-title">Poll Activity</div>
          <Bar data={pollChart} />
        </div>

      </div>

    </div>
  );
}

export default Reports;