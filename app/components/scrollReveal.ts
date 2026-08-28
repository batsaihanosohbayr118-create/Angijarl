export function attachScrollReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};

  const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
  if (items.length === 0) return () => {};

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("in-view", entry.isIntersecting);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  items.forEach((item) => observer.observe(item));
  return () => observer.disconnect();
}
