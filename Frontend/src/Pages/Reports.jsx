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

const useCountUp = (end) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 500;
    const step = Math.ceil((end || 0) / (duration / 16));

    const counter = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(counter);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(counter);
  }, [end]);

  return count;
};

function Reports() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState("7");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError("");

      try {
        const url = `http://localhost:5000/api/reports?days=${days}${
          location ? `&location=${location}` : ""
        }`;

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`
          }
        });

        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [days, location]);

  const totals = data?.totals || {
    totalPetitions: 0,
    totalPolls: 0,
    totalVotes: 0,
    totalSignatures: 0
  };

  const petitionStatus = data?.petitionStatus || {
    active: 0,
    underReview: 0,
    closed: 0
  };

  const pollActivity = data?.pollActivity || {
    activePolls: 0,
    closedPolls: 0
  };

  const totalPetitions = useCountUp(totals.totalPetitions);
  const totalPolls = useCountUp(totals.totalPolls);
  const totalVotes = useCountUp(totals.totalVotes);
  const totalSignatures = useCountUp(totals.totalSignatures);

  if (loading) return <div className="loading-text">Loading reports...</div>;
  if (error) return <div className="loading-text error">{error}</div>;

  const closureRate =
    totals.totalPetitions > 0
      ? Math.min(
          Math.round((petitionStatus.closed / totals.totalPetitions) * 100),
          100
        )
      : 0;

  const insights = [
    {
      label: "Most Active Area",
      value: location || "Global"
    },
    {
      label: "Engagement Level",
      value:
        totals.totalSignatures > 20
          ? "High"
          : totals.totalSignatures > 5
          ? "Medium"
          : "Low"
    },
    {
      label: "Closure Rate",
      value: `${closureRate}%`
    }
  ];

  const petitionChart = {
    labels: ["Active", "Under Review", "Closed"],
    datasets: [
      {
        data: [
          petitionStatus.active,
          petitionStatus.underReview,
          petitionStatus.closed
        ],
        backgroundColor: ["#22c55e", "#f59e0b", "#ef4444"],
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  const pollChart = {
    labels: ["Active Polls", "Closed Polls"],
    datasets: [
      {
        label: "Poll Count",
        data: [pollActivity.activePolls, pollActivity.closedPolls],
        backgroundColor: ["#3b82f6", "#e5e7eb"],
        borderRadius: 8,
        borderWidth: 0
      }
    ]
  };

  const handleExportCSV = () => {
    const rows = [
      ["Category", "Value"],
      ["Total Petitions", totals.totalPetitions],
      ["Total Polls", totals.totalPolls],
      ["Total Votes", totals.totalVotes],
      ["Total Signatures", totals.totalSignatures]
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "reports.csv";
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Civix Reports Dashboard", 20, 20);

    doc.setFontSize(12);
    doc.text(`Total Petitions: ${totals.totalPetitions}`, 20, 40);
    doc.text(`Total Polls: ${totals.totalPolls}`, 20, 50);
    doc.text(`Total Votes: ${totals.totalVotes}`, 20, 60);
    doc.text(`Total Signatures: ${totals.totalSignatures}`, 20, 70);

    doc.save("reports.pdf");
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <h2 className="reports-title">Reports & Analytics</h2>
          <p className="reports-subtitle">
            Overview of petitions, polls, and engagement for the selected period.
          </p>
        </div>
      </div>

      <div className="reports-toolbar">
        <div className="filters">
          <div className="filter-group">
            <label className="filter-label">Date range</label>
            <select
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="filter-control"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Location</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Delhi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="filter-control"
            />
          </div>
        </div>

        <div className="export-buttons">
          <button className="btn-outline" onClick={handleExportCSV}>
            ⬇ CSV
          </button>
          <button className="btn-primary" onClick={handleExportPDF}>
            ⬇ PDF
          </button>
        </div>
      </div>

      <div className="report-cards">
        <div className="report-card blue">
          <div className="report-card-header">
            <span className="report-card-chip">Overall</span>
          </div>
          <div className="report-value">{totalPetitions}</div>
          <div className="report-label">Petitions</div>
        </div>

        <div className="report-card purple">
          <div className="report-card-header">
            <span className="report-card-chip">Participation</span>
          </div>
          <div className="report-value">{totalPolls}</div>
          <div className="report-label">Polls</div>
        </div>

        <div className="report-card green">
          <div className="report-card-header">
            <span className="report-card-chip">Decisions</span>
          </div>
          <div className="report-value">{totalVotes}</div>
          <div className="report-label">Votes</div>
        </div>

        <div className="report-card orange">
          <div className="report-card-header">
            <span className="report-card-chip">Support</span>
          </div>
          <div className="report-value">{totalSignatures}</div>
          <div className="report-label">Signatures</div>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-title">Petition closure rate</span>
          <span className="progress-value">{closureRate}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${closureRate}%` }}
          />
        </div>
      </div>

      <div className="insight-grid">
        {insights.map((item, i) => (
          <div key={i} className="insight-card">
            <div className="insight-label">{item.label}</div>
            <div className="insight-value">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Petition Status</div>
              <div className="chart-subtitle">
                Distribution of active, under review, and closed petitions.
              </div>
            </div>
          </div>
          <div className="chart-body">
            <Pie
              data={petitionChart}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { boxWidth: 14, usePointStyle: true }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <div>
              <div className="chart-title">Poll Activity</div>
              <div className="chart-subtitle">
                Comparison of currently active vs closed polls.
              </div>
            </div>
          </div>
          <div className="chart-body">
            <Bar
              data={pollChart}
              options={{
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  x: {
                    grid: { display: false }
                  },
                  y: {
                    grid: { color: "#f3f4f6" },
                    ticks: { stepSize: 1 }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
