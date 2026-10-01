import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function Researchers() {
  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  useEffect(() => {
    api
      .get("/admin/researchers")
      .then(({ data }) => setResearchers(data))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Could not load researchers.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  async function removeResearcher(researcher) {
    if (
      !window.confirm(
        `Remove ${researcher.name} and permanently delete their experiments and related records?`,
      )
    )
      return;
    setError("");
    setDeletingId(researcher._id);
    try {
      await api.delete(`/admin/researchers/${researcher._id}`);
      setResearchers((current) =>
        current.filter((item) => item._id !== researcher._id),
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not remove researcher.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="page-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">USER MANAGEMENT</span>
          <h1>Researchers</h1>
          <p>Registered laboratory researchers.</p>
        </div>
        <span className="count-label">{researchers.length} total</span>
      </div>
      {error && <p className="notice notice-error">{error}</p>}
      <section className="content-section table-section">
        {loading ? (
          <p className="loading-state">Loading researchers…</p>
        ) : researchers.length === 0 ? (
          <div className="empty-state">No researchers registered yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {researchers.map((researcher) => (
                  <tr key={researcher._id}>
                    <td>
                      <strong>{researcher.name}</strong>
                    </td>
                    <td>{researcher.email}</td>
                    <td>
                      {new Date(researcher.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="role-label">Researcher</span>
                    </td>
                    <td>
                      <button
                        className="button button-danger-outline button-small"
                        type="button"
                        disabled={deletingId === researcher._id}
                        onClick={() => removeResearcher(researcher)}
                      >
                        {deletingId === researcher._id ? "Removing…" : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
