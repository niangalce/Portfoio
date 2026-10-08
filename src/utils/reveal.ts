export function initializeProjectReveals(): void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));

  if (elements.length === 0) {
    return;
  }

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (motionPreference.matches || !('IntersectionObserver' in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!(entry.target instanceof HTMLElement)) {
          continue;
        }

        const hasReachedViewport = entry.target.getBoundingClientRect().top < window.innerHeight;

        if (entry.isIntersecting || hasReachedViewport) {
          entry.target.dataset.revealed = 'true';
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  for (const element of elements) {
    const bounds = element.getBoundingClientRect();

    if (bounds.top < window.innerHeight * 0.92 && bounds.bottom > 0) {
      continue;
    }

    element.dataset.revealReady = 'true';
    observer.observe(element);
  }

  motionPreference.addEventListener(
    'change',
    (event) => {
      if (!event.matches) {
        return;
      }

      observer.disconnect();

      for (const element of elements) {
        delete element.dataset.revealReady;
        element.dataset.revealed = 'true';
      }
    },
    { once: true }
  );
}
