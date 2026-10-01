import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const recordConfig = {
  protocol: {
    label: "Protocol",
    endpoint: "/protocols",
    action: "Add protocol",
    fields: [
      ["materials", "Materials"],
      ["steps", "Steps"],
    ],
  },
  reaction: {
    label: "Reaction",
    endpoint: "/reactions",
    action: "Add reaction",
    fields: [
      ["reactants", "Reactants"],
      ["products", "Products"],
      ["conditions", "Conditions"],
    ],
  },
  observation: {
    label: "Observation",
    endpoint: "/observations",
    action: "Add observation",
    fields: [
      ["observation", "Observation"],
      ["date", "Date"],
    ],
  },
};

function dateLabel(value, time = false) {
  if (!value) return "—";
  return new Date(value).toLocaleString(
    undefined,
    time
      ? {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      : { day: "numeric", month: "short", year: "numeric" },
  );
}

export default function ExperimentDetails({ readOnly = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [experiment, setExperiment] = useState(null);
  const [protocols, setProtocols] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [observations, setObservations] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formKind, setFormKind] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState("");
  const [protocolSearch, setProtocolSearch] = useState("");
  const [protocolNotice, setProtocolNotice] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      if (readOnly) {
        const { data } = await api.get(`/admin/experiments/${id}`);
        setExperiment(data.experiment);
        setProtocols(data.protocols);
        setReactions(data.reactions);
        setObservations(data.observations);
        setHistory(data.history);
        setResult(data.experiment.result || "");
      } else {
        const [
          experimentData,
          protocolData,
          reactionData,
          observationData,
          historyData,
        ] = await Promise.all([
          api.get(`/experiments/${id}`),
          api.get(`/protocols/experiment/${id}`),
          api.get(`/reactions/experiment/${id}`),
          api.get(`/observations/experiment/${id}`),
          api.get(`/experiments/${id}/history`),
        ]);
        setExperiment(experimentData.data);
        setProtocols(protocolData.data);
        setReactions(reactionData.data);
        setObservations(observationData.data);
        setHistory(historyData.data);
        setResult(experimentData.data.result || "");
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not load experiment details.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, readOnly]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleProtocols = useMemo(
    () =>
      protocols.filter((item) =>
        `${item.materials} ${item.steps}`
          .toLowerCase()
          .includes(protocolSearch.toLowerCase()),
      ),
    [protocols, protocolSearch],
  );

  function openForm(kind, item = null) {
    const defaults =
      kind === "observation"
        ? { date: new Date().toISOString().slice(0, 10), observation: "" }
        : kind === "protocol"
          ? { materials: "", steps: "" }
          : { reactants: "", products: "", conditions: "" };
    setEditing(item);
    setFormKind(kind);
    setForm(
      item
        ? {
            ...item,
            date: item.date
              ? new Date(item.date).toISOString().slice(0, 10)
              : "",
          }
        : defaults,
    );
  }

  async function saveRecord(event) {
    event.preventDefault();
    const config = recordConfig[formKind];
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, experimentId: id };
      if (editing) await api.put(`${config.endpoint}/${editing._id}`, payload);
      else await api.post(config.endpoint, payload);
      setFormKind("");
      setEditing(null);
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not save record.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(kind, item) {
    if (
      !window.confirm(`Delete this ${recordConfig[kind].label.toLowerCase()}?`)
    )
      return;
    try {
      await api.delete(`${recordConfig[kind].endpoint}/${item._id}`);
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not delete record.",
      );
    }
  }

  async function saveResult(event) {
    event.preventDefault();
    try {
      await api.put(`/experiments/${id}`, { result });
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not save result.",
      );
    }
  }

  async function deleteExperiment() {
    if (
      !window.confirm(
        "Delete this experiment and its protocols, reactions, and observations?",
      )
    )
      return;
    try {
      await api.delete(`/experiments/${id}`);
      navigate("/researcher/experiments");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not delete experiment.",
      );
    }
  }

  async function viewPdf() {
    const previewWindow = window.open("about:blank", "_blank");
    if (!previewWindow) {
      setError("Allow pop-ups to preview the PDF.");
      return;
    }
    setPdfBusy(true);
    setError("");
    try {
      const { createExperimentPdf } =
        await import("../services/experimentPdf.js");
      const pdf = createExperimentPdf({
        experiment,
        researcherName,
        protocols,
        reactions,
        observations,
        history,
      });
      const pdfUrl = URL.createObjectURL(pdf.output("blob"));
      previewWindow.location.replace(pdfUrl);
      window.setTimeout(() => URL.revokeObjectURL(pdfUrl), 5 * 60 * 1000);
    } catch {
      previewWindow.close();
      setError("Could not create the experiment PDF.");
    } finally {
      setPdfBusy(false);
    }
  }

  async function downloadPdf() {
    setPdfBusy(true);
    setError("");
    try {
      const { createExperimentPdf, experimentPdfFilename } =
        await import("../services/experimentPdf.js");
      const pdf = createExperimentPdf({
        experiment,
        researcherName,
        protocols,
        reactions,
        observations,
        history,
      });
      pdf.save(experimentPdfFilename(experiment.title));
    } catch {
      setError("Could not create the experiment PDF.");
    } finally {
      setPdfBusy(false);
    }
  }

  function renderRecordForm() {
    if (!formKind) return null;
    const config = recordConfig[formKind];
    return (
      <form className="record-form" onSubmit={saveRecord}>
        <div className="record-form-header">
          <h3>
            {editing ? `Edit ${config.label.toLowerCase()}` : config.action}
          </h3>
          <button
            type="button"
            className="text-button"
            onClick={() => setFormKind("")}
          >
            Cancel
          </button>
        </div>
        <div className="record-fields">
          {config.fields.map(([name, label]) => (
            <label key={name}>
              {label}
              {name === "steps" ||
              name === "conditions" ||
              name === "observation" ? (
                <textarea
                  rows="3"
                  value={form[name] || ""}
                  onChange={(event) =>
                    setForm({ ...form, [name]: event.target.value })
                  }
                  required
                />
              ) : (
                <input
                  type={name === "date" ? "date" : "text"}
                  value={form[name] || ""}
                  onChange={(event) =>
                    setForm({ ...form, [name]: event.target.value })
                  }
                  required
                />
              )}
            </label>
          ))}
        </div>
        <button className="button button-primary" disabled={saving}>
          {saving ? "Saving…" : "Save record"}
        </button>
      </form>
    );
  }

  function renderActions(kind, item) {
    if (readOnly) return null;
    return (
      <div className="record-actions">
        <button className="text-button" onClick={() => openForm(kind, item)}>
          Edit
        </button>
        <button
          className="text-button text-danger"
          onClick={() => deleteRecord(kind, item)}
        >
          Delete
        </button>
      </div>
    );
  }

  if (loading)
    return (
      <main className="page-shell">
        <p className="loading-state">Loading experiment…</p>
      </main>
    );
  if (error && !experiment)
    return (
      <main className="page-shell">
        <p className="notice notice-error">{error}</p>
        <Link
          className="back-link"
          to={readOnly ? "/admin/records" : "/researcher/experiments"}
        >
          ← Back to records
        </Link>
      </main>
    );
  if (!experiment) return null;

  const researcherName =
    experiment.researcherId?.name || user?.name || "Researcher";
  return (
    <main className="page-shell detail-shell">
      <Link
        className="back-link"
        to={readOnly ? "/admin/records" : "/researcher/experiments"}
      >
        ← {readOnly ? "Laboratory records" : "Experiments"}
      </Link>
      {error && <p className="notice notice-error">{error}</p>}
      <section className="experiment-hero">
        <div className="experiment-title-block">
          <span className="eyebrow">
            {readOnly ? "ADMIN REVIEW" : "EXPERIMENT RECORD"}
          </span>
          <h1>{experiment.title}</h1>
          <p>{experiment.description || "No description provided."}</p>
        </div>
        <div className="hero-actions">
          <StatusBadge status={experiment.status} />
          <button
            className="button button-outline"
            disabled={pdfBusy}
            onClick={viewPdf}
          >
            {pdfBusy ? "Preparing PDF…" : "View PDF"}
          </button>
          <button
            className="button button-outline"
            disabled={pdfBusy}
            onClick={downloadPdf}
          >
            {pdfBusy ? "Preparing PDF…" : "Download PDF"}
          </button>
          {!readOnly && (
            <>
              <Link
                className="button button-outline"
                to={`/experiments/${id}/edit`}
              >
                Edit experiment
              </Link>
              <button
                className="button button-danger-outline"
                onClick={deleteExperiment}
              >
                Delete
              </button>
            </>
          )}
        </div>
        <div className="experiment-meta">
          <div>
            <span>Researcher</span>
            <strong>{researcherName}</strong>
          </div>
          <div>
            <span>Date</span>
            <strong>{dateLabel(experiment.date)}</strong>
          </div>
          <div>
            <span>Created</span>
            <strong>{dateLabel(experiment.createdAt)}</strong>
          </div>
        </div>
      </section>

      <section className="result-section">
        <div>
          <span className="eyebrow">RESULT / FINDING</span>
          <h2>Experiment result</h2>
        </div>
        {readOnly ? (
          <p className="result-value">{result || "No result recorded."}</p>
        ) : (
          <form className="result-form" onSubmit={saveResult}>
            <textarea
              value={result}
              onChange={(event) => setResult(event.target.value)}
              placeholder="Record the result or finding…"
              rows="2"
            />
            <button className="button button-primary">Save result</button>
          </form>
        )}
      </section>

      <div className="detail-grid">
        <section className="record-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">METHOD</span>
              <h2>
                Protocols{" "}
                <span className="section-count">{protocols.length}</span>
              </h2>
            </div>
            {!readOnly && (
              <button
                className="button button-small button-outline"
                onClick={() => openForm("protocol")}
              >
                + Add
              </button>
            )}
          </div>
          <label className="protocol-search">
            Search protocols
            <input
              value={protocolSearch}
              onChange={(event) => setProtocolSearch(event.target.value)}
              placeholder="Search steps or materials"
            />
          </label>
          {formKind === "protocol" && renderRecordForm()}
          {!visibleProtocols.length ? (
            <p className="inline-empty">No protocols recorded.</p>
          ) : (
            visibleProtocols.map((item) => (
              <article className="record-item" key={item._id}>
                <div className="record-item-heading">
                  <h3>Protocol</h3>
                  {renderActions("protocol", item)}
                </div>
                <p>
                  <strong>Materials</strong>
                  {item.materials}
                </p>
                <p>
                  <strong>Steps</strong>
                  {item.steps}
                </p>
              </article>
            ))
          )}
        </section>

        <section className="record-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">CHEMISTRY</span>
              <h2>
                Reactions{" "}
                <span className="section-count">{reactions.length}</span>
              </h2>
            </div>
            {!readOnly && (
              <button
                className="button button-small button-outline"
                onClick={() => openForm("reaction")}
              >
                + Add
              </button>
            )}
          </div>
          {formKind === "reaction" && renderRecordForm()}
          {!reactions.length ? (
            <p className="inline-empty">No reactions recorded.</p>
          ) : (
            reactions.map((item) => (
              <article className="record-item" key={item._id}>
                <div className="record-item-heading">
                  <h3>Reaction</h3>
                  {renderActions("reaction", item)}
                </div>
                <p>
                  <strong>Reactants</strong>
                  {item.reactants}
                </p>
                <p>
                  <strong>Products</strong>
                  {item.products}
                </p>
                <p>
                  <strong>Conditions</strong>
                  {item.conditions || "—"}
                </p>
              </article>
            ))
          )}
        </section>

        <section className="record-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LAB NOTES</span>
              <h2>
                Observations{" "}
                <span className="section-count">{observations.length}</span>
              </h2>
            </div>
            {!readOnly && (
              <button
                className="button button-small button-outline"
                onClick={() => openForm("observation")}
              >
                + Add
              </button>
            )}
          </div>
          {formKind === "observation" && renderRecordForm()}
          {!observations.length ? (
            <p className="inline-empty">No observations recorded.</p>
          ) : (
            observations.map((item) => (
              <article className="record-item" key={item._id}>
                <div className="record-item-heading">
                  <h3>{dateLabel(item.date)}</h3>
                  {renderActions("observation", item)}
                </div>
                <p>{item.observation}</p>
              </article>
            ))
          )}
        </section>

        <section className="record-section history-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">AUDIT TRAIL</span>
              <h2>
                Experiment history{" "}
                <span className="section-count">{history.length}</span>
              </h2>
            </div>
          </div>
          {!history.length ? (
            <p className="inline-empty">
              History will appear as this experiment changes.
            </p>
          ) : (
            <ol className="history-list">
              {history.map((item) => (
                <li key={item._id}>
                  <span className="history-dot" />
                  <div>
                    <strong>{item.action}</strong>
                    <time>{dateLabel(item.timestamp, true)}</time>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
