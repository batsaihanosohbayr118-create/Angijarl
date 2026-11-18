import type { RefObject } from "react";

/** Хүснэгтийн мөрүүдийг (mobile дээр карт хэлбэрээр) хажуу тийш гүйлгэнэ. */
export function scrollCards(wrapRef: RefObject<HTMLDivElement | null>, direction: 1 | -1) {
  const tbody = wrapRef.current?.querySelector("tbody");
  if (!tbody) return;
  const card = tbody.querySelector("tr");
  const step = card ? card.getBoundingClientRect().width + 12 : tbody.clientWidth;
  tbody.scrollBy({ left: direction * step, behavior: "smooth" });
}

/** Grid доторх картуудыг хажуу тийш гүйлгэнэ. */
export function scrollGridCards(gridRef: RefObject<HTMLDivElement | null>, direction: 1 | -1) {
  const grid = gridRef.current;
  if (!grid) return;
  const card = grid.querySelector(":scope > *");
  const step = card ? card.getBoundingClientRect().width + 18 : grid.clientWidth;
  grid.scrollBy({ left: direction * step, behavior: "smooth" });
}
