import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post("/auth/login", form);
      login(data);
      navigate(
        data.user.role === "admin"
          ? "/admin/dashboard"
          : "/researcher/dashboard",
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to reach the server. Check that the backend is running.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page login-page">
      <section className="auth-panel">
        <div className="auth-heading">
          <span className="eyebrow">LAB RECORDS / 01</span>
          <h1>Welcome, researcher.</h1>
          <p>Please sign in to continue your research.</p>
        </div>
        <form onSubmit={submit}>
          {error && <p className="notice notice-error">{error}</p>}
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              required
            />
          </label>
          <button className="button button-primary button-wide" disabled={busy}>
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>
        <p className="auth-switch">
          New researcher? <Link to="/register">Create an account</Link>
        </p>
      </section>
      <aside className="auth-aside">
        <div className="molecule-art" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
        <span className="aside-label">RESEARCH / RECORD / REVIEW</span>
        <p>
          Every experiment,
          <br />
          clearly accounted for.
        </p>
      </aside>
    </main>
  );
}
