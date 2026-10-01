import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import ExperimentTable from "../components/ExperimentTable.jsx";

export default function LaboratoryRecords() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  useEffect(() => {
    api
      .get("/admin/experiments")
      .then(({ data }) => setItems(data))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message ||
            "Could not load laboratory records.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  async function removeExperiment(experiment) {
    if (
      !window.confirm(
        `Delete "${experiment.title}" and all its related records? This cannot be undone.`,
      )
    )
      return;
    setError("");
    setDeletingId(experiment._id);
    try {
      await api.delete(`/admin/experiments/${experiment._id}`);
      setItems((current) =>
        current.filter((item) => item._id !== experiment._id),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not delete laboratory record.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) &&
          (status === "All statuses" || item.status === status),
      ),
    [items, search, status],
  );
  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMIN REVIEW</span>
          <h1>Laboratory records</h1>
          <p>Search and review experiments across the laboratory.</p>
        </div>
      </div>
      <section className="filter-bar">
        <label className="search-control">
          Search title
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search experiments"
          />
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>All statuses</option>
            <option>Planned</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </label>
      </section>
      {error && <p className="notice notice-error">{error}</p>}
      <section className="content-section table-section">
        {loading ? (
          <p className="loading-state">Loading laboratory records…</p>
        ) : (
          <ExperimentTable
            experiments={filtered}
            admin
            onDelete={removeExperiment}
            deletingId={deletingId}
            empty="No records match these filters."
          />
        )}
      </section>
    </main>
  );
}
