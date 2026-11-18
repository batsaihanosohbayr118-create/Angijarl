import Icon from "./Icon";

export default function StatCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="admin-stat-card">
      <span className="admin-stat-icon">
        <Icon name={icon} />
      </span>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
