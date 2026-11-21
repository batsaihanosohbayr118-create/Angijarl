export default function Icon({ name }: { name: string }) {
  const common = { viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg" } as const;
  switch (name) {
    case "overview":
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
          <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
          <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
          <rect x="13" y="13" width="7.5" height="7.5" rx="1.8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 19c0-2.9 2.5-5.2 5.5-5.2s5.5 2.3 5.5 5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M15.3 5.4c1.5.2 2.6 1.5 2.6 3.1 0 1.6-1.1 2.9-2.6 3.1M17.6 13.9c2.1.5 3.6 2.3 3.6 4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "bookings":
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 9.5h17M8 3v3.4M16 3v3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M7.5 13.2h2.4M7.5 16.5h5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "services":
      return (
        <svg {...common}>
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H15l5 5v9.5A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M14.5 4v4.5a1 1 0 0 0 1 1H20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "coupons":
      return (
        <svg {...common}>
          <path d="M4 8.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.5a2.5 2.5 0 0 0 0 5V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5a2.5 2.5 0 0 0 0-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9 9.2h.1M15 14.8h.1M15.5 8.8l-7 6.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6.5 10v8.5A1.5 1.5 0 0 0 8 20h8a1.5 1.5 0 0 0 1.5-1.5V10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path d="M9 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M14 8l4.5 4-4.5 4M18.3 12H9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.6" />
          <path d="m19 19-4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path d="M5 7h14M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7M7.5 7l.7 11.2A2 2 0 0 0 10.2 20h3.6a2 2 0 0 0 2-1.8L16.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "edit":
      return (
        <svg {...common}>
          <path d="M15.2 4.8 19.2 8.8 8.6 19.4l-4.6.8.8-4.6L15.2 4.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
