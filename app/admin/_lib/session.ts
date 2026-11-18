import type { Session } from "./types";

export const pendingSessionSnapshot = "__pending__";

export const getAdminSessionSnapshot = () => {
  if (typeof window === "undefined") return pendingSessionSnapshot;

  try {
    return window.localStorage.getItem("angijral_session") ?? "null";
  } catch {
    return "null";
  }
};

export const subscribeToAdminSession = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === "angijral_session") {
      callback();
    }
  };

  const handleSessionChange = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener("angijral-session-change", handleSessionChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("angijral-session-change", handleSessionChange);
  };
};

export function parseAdminSession(snapshot: string): Session | null {
  if (snapshot === pendingSessionSnapshot || snapshot === "null") return null;

  try {
    const parsed = JSON.parse(snapshot) as Session;
    return parsed?.role === "admin" ? parsed : null;
  } catch {
    return null;
  }
}
