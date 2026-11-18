export default function WhyIcon({ type }: { type: string }) {
  if (type === "experience") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "practice") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 12.5c0-.9.7-1.6 1.6-1.6h1.9V8.4c0-.9.7-1.6 1.6-1.6.9 0 1.6.7 1.6 1.6v2.5h1c1.4 0 2.3 1.1 2.3 2.3v1.6c0 2.4-1.9 4.7-4.6 4.7-3 0-5.4-1.6-5.4-4.4v-2.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7 14h-.6c-.8 0-1.4-.6-1.4-1.4v-.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === "certificate") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 13.2 7 21l5-2.6 5 2.6-1.5-7.8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "support") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3.5" y="8" width="17" height="11" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8.5 8V6.8c0-1 .8-1.8 1.8-1.8h3.4c1 0 1.8.8 1.8 1.8V8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M3.5 13h17" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  }
  if (type === "classroom") {
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="18" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 20h8M12 17v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M15.5 6c1.4.3 2.4 1.5 2.4 3s-1 2.7-2.4 3M17.8 14.5c2 .4 3.5 2 3.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
