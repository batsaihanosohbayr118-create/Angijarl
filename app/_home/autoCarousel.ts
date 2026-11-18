export function attachAutoCarousel(track: HTMLDivElement, cardSelector: string, maxWidth: number) {
  const mobileQuery = window.matchMedia(`(max-width: ${maxWidth}px)`);
  let timer: ReturnType<typeof setInterval> | null = null;
  let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

  const advance = () => {
    const card = track.querySelector(cardSelector);
    if (!card) return;
    const step = card.getBoundingClientRect().width + 16;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    track.scrollTo({ left: atEnd ? 0 : track.scrollLeft + step, behavior: "smooth" });
  };

  const startAutoplay = () => {
    if (timer || !mobileQuery.matches) return;
    timer = setInterval(advance, 3200);
  };

  const stopAutoplay = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const pauseThenResume = () => {
    stopAutoplay();
    if (resumeTimeout) clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(startAutoplay, 3500);
  };

  const handleMediaChange = () => {
    if (mobileQuery.matches) startAutoplay();
    else stopAutoplay();
  };

  startAutoplay();
  track.addEventListener("pointerdown", pauseThenResume);
  track.addEventListener("touchstart", pauseThenResume, { passive: true });
  mobileQuery.addEventListener("change", handleMediaChange);

  return () => {
    stopAutoplay();
    if (resumeTimeout) clearTimeout(resumeTimeout);
    track.removeEventListener("pointerdown", pauseThenResume);
    track.removeEventListener("touchstart", pauseThenResume);
    mobileQuery.removeEventListener("change", handleMediaChange);
  };
}
