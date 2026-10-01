export default function DashboardCard({ label, value, note, accent = "blue" }) {
  return (
    <article className={`metric-card metric-${accent}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      {note && <span>{note}</span>}
    </article>
  );
}
