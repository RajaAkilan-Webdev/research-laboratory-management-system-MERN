import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import DashboardCard from "../components/DashboardCard.jsx";
import ExperimentTable from "../components/ExperimentTable.jsx";

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then(({ data }) => setSummary(data))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Could not load dashboard.",
        ),
      );
  }, []);
  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">LABORATORY OVERVIEW</span>
          <h1>Admin dashboard</h1>
          <p>Review researchers and laboratory records.</p>
        </div>
        <Link className="button button-outline" to="/admin/records">
          All records
        </Link>
      </div>
      {error && <p className="notice notice-error">{error}</p>}
      {!summary ? (
        <p className="loading-state">Loading dashboard…</p>
      ) : (
        <>
          <section className="metric-grid">
            <DashboardCard
              label="Researchers"
              value={summary.totalResearchers}
              accent="blue"
            />
            <DashboardCard
              label="Experiments"
              value={summary.totalExperiments}
              accent="cyan"
            />
            <DashboardCard
              label="Completed"
              value={summary.completedExperiments}
              accent="green"
            />
            <DashboardCard
              label="Active experiments"
              value={summary.activeExperiments}
              accent="amber"
            />
          </section>
          <section className="content-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">RECENT SUBMISSIONS</span>
                <h2>Recent experiments</h2>
              </div>
              <Link to="/admin/researchers" className="text-link">
                Manage researchers →
              </Link>
            </div>
            <ExperimentTable
              experiments={summary.recentExperiments}
              admin
              empty="No laboratory records yet."
            />
          </section>
        </>
      )}
    </main>
  );
}
