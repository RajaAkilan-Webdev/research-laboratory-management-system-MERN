import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import ExperimentForm from "../components/ExperimentForm.jsx";

export default function ExperimentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    api
      .get(`/experiments/${id}`)
      .then(({ data }) => setExperiment(data))
      .catch((requestError) =>
        setError(
          requestError.response?.data?.message || "Could not load experiment.",
        ),
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function save(form) {
    setError("");
    setBusy(true);
    try {
      const { data } = id
        ? await api.put(`/experiments/${id}`, form)
        : await api.post("/experiments", form);
      navigate(`/experiments/${data._id}`);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not save experiment.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <main className="page-shell">
        <p className="loading-state">Loading experiment…</p>
      </main>
    );
  return (
    <main className="page-shell narrow-shell">
      <Link
        className="back-link"
        to={id ? `/experiments/${id}` : "/researcher/experiments"}
      >
        ← Back
      </Link>
      <div className="page-heading compact-heading">
        <div>
          <span className="eyebrow">EXPERIMENT RECORD</span>
          <h1>{id ? "Edit experiment" : "New experiment"}</h1>
          <p>Start with the key details. You can add records after saving.</p>
        </div>
      </div>
      {error && !experiment && <p className="notice notice-error">{error}</p>}
      {(!id || experiment) && (
        <ExperimentForm
          initialValue={experiment}
          onSubmit={save}
          busy={busy}
          error={error}
        />
      )}
    </main>
  );
}
