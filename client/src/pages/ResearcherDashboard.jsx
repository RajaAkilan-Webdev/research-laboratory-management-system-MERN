import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import DashboardCard from "../components/DashboardCard.jsx";
import ExperimentTable from "../components/ExperimentTable.jsx";

export default function ResearcherDashboard() {
  const [experiments, setExperiments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    api
      .get("/experiments")
      .then(({ data }) => setExperiments(data))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Could not load experiments.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">RESEARCHER WORKSPACE</span>
          <h1>Good work, {user?.name?.split(" ")[0]}.</h1>
          <p>Your laboratory activity at a glance.</p>
        </div>
        <Link className="button button-primary" to="/experiments/new">
          + Create experiment
        </Link>
      </div>
      {error && <p className="notice notice-error">{error}</p>}
      <section className="metric-grid">
        <DashboardCard
          label="My experiments"
          value={experiments.length}
          note="All records"
          accent="blue"
        />
        <DashboardCard
          label="Completed"
          value={
            experiments.filter((item) => item.status === "Completed").length
          }
          accent="green"
        />
        <DashboardCard
          label="In progress"
          value={
            experiments.filter((item) => item.status === "In Progress").length
          }
          accent="cyan"
        />
        <DashboardCard
          label="Planned"
          value={experiments.filter((item) => item.status === "Planned").length}
          accent="amber"
        />
      </section>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LATEST ACTIVITY</span>
            <h2>Recent experiments</h2>
          </div>
          <Link to="/researcher/experiments" className="text-link">
            View all experiments →
          </Link>
        </div>
        {loading ? (
          <p className="loading-state">Loading experiments…</p>
        ) : (
          <ExperimentTable
            experiments={experiments.slice(0, 5)}
            empty="Your experiments will appear here."
          />
        )}
      </section>
    </main>
  );
}
