import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const { data } = await api.put(`/users/${user.id}`, form);
      updateUser(data);
      setMessage("Profile updated.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not update profile.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page-shell narrow-shell">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACCOUNT SETTINGS</span>
          <h1>Your profile</h1>
          <p>Manage your researcher details.</p>
        </div>
      </div>
      <form className="form-panel" onSubmit={submit}>
        {error && <p className="notice notice-error">{error}</p>}
        {message && <p className="notice notice-success">{message}</p>}
        <label>
          Name
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
            maxLength="80"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm({ ...form, email: event.target.value })
            }
            required
          />
        </label>
        <label>
          Role
          <input value="Researcher" disabled />
        </label>
        <div className="form-actions">
          <button className="button button-primary" disabled={busy}>
            {busy ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </main>
  );
}
