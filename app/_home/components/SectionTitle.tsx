export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="section-title reveal">
      <span />
      <h2>{children}</h2>
      <span />
    </div>
  );
}
