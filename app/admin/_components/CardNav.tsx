export default function CardNav({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="admin-card-nav">
      <button type="button" aria-label="Өмнөх" onClick={onPrev}>‹</button>
      <button type="button" aria-label="Дараах" onClick={onNext}>›</button>
    </div>
  );
}
