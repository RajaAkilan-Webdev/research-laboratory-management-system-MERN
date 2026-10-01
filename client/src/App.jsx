import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ResearcherDashboard from "./pages/ResearcherDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Experiments from "./pages/Experiments.jsx";
import ExperimentEditor from "./pages/ExperimentEditor.jsx";
import ExperimentDetails from "./pages/ExperimentDetails.jsx";
import Researchers from "./pages/Researchers.jsx";
import LaboratoryRecords from "./pages/LaboratoryRecords.jsx";

function HomeRedirect() {
  const { user } = useAuth();
  return (
    <Navigate
      to={
        user
          ? user.role === "admin"
            ? "/admin/dashboard"
            : "/researcher/dashboard"
          : "/login"
      }
      replace
    />
  );
}

function App() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={user ? <HomeRedirect /> : <Login />} />
        <Route
          path="/register"
          element={user ? <HomeRedirect /> : <Register />}
        />
        <Route element={<ProtectedRoute role="researcher" />}>
          <Route
            path="/researcher/dashboard"
            element={<ResearcherDashboard />}
          />
          <Route path="/researcher/experiments" element={<Experiments />} />
          <Route path="/experiments/new" element={<ExperimentEditor />} />
          <Route path="/experiments/:id/edit" element={<ExperimentEditor />} />
          <Route path="/experiments/:id" element={<ExperimentDetails />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/researchers" element={<Researchers />} />
          <Route path="/admin/records" element={<LaboratoryRecords />} />
          <Route
            path="/admin/experiments/:id"
            element={<ExperimentDetails readOnly />}
          />
        </Route>
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </>
  );
}

export default App;
