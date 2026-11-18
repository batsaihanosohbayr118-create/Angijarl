export default function Chevron({ open, className = "nav-dropdown-chevron" }: { open: boolean; className?: string }) {
  return (
    <span className={`${className}${open ? " open" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
