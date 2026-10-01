import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";

function displayDate(value) {
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
}

export default function ExperimentTable({
  experiments = [],
  admin = false,
  onDelete,
  deletingId,
  empty = "No experiments found.",
}) {
  if (!experiments.length) return <div className="empty-state">{empty}</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Experiment</th>
            {admin && <th>Researcher</th>}
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {experiments.map((experiment) => (
            <tr key={experiment._id}>
              <td>
                <strong>{experiment.title}</strong>
                <small>{experiment.description || "No description"}</small>
              </td>
              {admin && <td>{experiment.researcherId?.name || "Unknown"}</td>}
              <td>{displayDate(experiment.date)}</td>
              <td>
                <StatusBadge status={experiment.status} />
              </td>
              <td>
                <div className="record-actions">
                  <Link
                    className="table-link"
                    to={
                      admin
                        ? `/admin/experiments/${experiment._id}`
                        : `/experiments/${experiment._id}`
                    }
                  >
                    View record
                  </Link>
                  {admin && onDelete && (
                    <button
                      className="button button-danger-outline button-small"
                      type="button"
                      disabled={deletingId === experiment._id}
                      onClick={() => onDelete(experiment)}
                    >
                      {deletingId === experiment._id ? "Deleting…" : "Delete"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
