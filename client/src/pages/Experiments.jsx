import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import ExperimentTable from "../components/ExperimentTable.jsx";

export default function Experiments() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState("Newest first");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/experiments")
      .then(({ data }) => setItems(data))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Could not load experiments.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      items
        .filter(
          (item) =>
            item.title.toLowerCase().includes(search.toLowerCase()) &&
            (status === "All statuses" || item.status === status),
        )
        .sort(
          (left, right) =>
            (sort === "Newest first" ? 1 : -1) *
            (new Date(left.date) - new Date(right.date)),
        ),
    [items, search, status, sort],
  );

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR LAB NOTEBOOK</span>
          <h1>Experiments</h1>
          <p>Search, filter, and maintain your experiment records.</p>
        </div>
        <Link className="button button-primary" to="/experiments/new">
          + Create experiment
        </Link>
      </div>
      <section className="filter-bar">
        <label className="search-control">
          Search title
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="e.g. enzyme activity"
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
        <label>
          Sort by date
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option>Newest first</option>
            <option>Oldest first</option>
          </select>
        </label>
      </section>
      {error && <p className="notice notice-error">{error}</p>}
      <section className="content-section table-section">
        {loading ? (
          <p className="loading-state">Loading experiments…</p>
        ) : (
          <ExperimentTable
            experiments={filtered}
            empty="No experiments match these filters."
          />
        )}
      </section>
    </main>
  );
}
