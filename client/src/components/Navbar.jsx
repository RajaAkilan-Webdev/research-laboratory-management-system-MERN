import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const admin = user?.role === "admin";
  const home = admin ? "/admin/dashboard" : "/researcher/dashboard";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="topbar">
      <NavLink className="brand" to={home}>
        <span className="brand-mark">RL</span>
        <span>
          Research Laboratory
          <br />
          <strong>Management System</strong>
        </span>
      </NavLink>
      <nav className="nav-links">
        <NavLink to={home}>Dashboard</NavLink>
        {admin ? (
          <>
            <NavLink to="/admin/researchers">Researchers</NavLink>
            <NavLink to="/admin/records">Laboratory Records</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/researcher/experiments">Experiments</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </>
        )}
        <button
          className="button button-quiet nav-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
