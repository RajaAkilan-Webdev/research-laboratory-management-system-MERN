import { useState } from "react";

export default function ExperimentForm({
  initialValue,
  onSubmit,
  busy,
  error,
}) {
  const [form, setForm] = useState(() => ({
    title: initialValue?.title || "",
    description: initialValue?.description || "",
    date: initialValue?.date
      ? new Date(initialValue.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    status: initialValue?.status || "Planned",
  }));

  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="form-panel" onSubmit={submit}>
      {error && <p className="notice notice-error">{error}</p>}
      <label>
        Experiment title
        <input
          name="title"
          value={form.title}
          onChange={change}
          required
          maxLength="120"
        />
      </label>
      <label>
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={change}
          rows="4"
        />
      </label>
      <div className="form-row">
        <label>
          Date
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={change}
            required
          />
        </label>
        <label>
          Status
          <select name="status" value={form.status} onChange={change}>
            <option>Planned</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </label>
      </div>
      <div className="form-actions">
        <button className="button button-primary" disabled={busy}>
          {busy ? "Saving…" : "Save experiment"}
        </button>
      </div>
    </form>
  );
}
