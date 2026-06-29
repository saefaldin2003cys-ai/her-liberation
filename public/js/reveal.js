// ============================================
// Reveal Entrance Animation (Multi-Page Platform)
// IntersectionObserver-based viewport detection that adds `.revealed`
// class to `.reveal-on-scroll` elements. One-shot: unobserves after
// first trigger. Respects prefers-reduced-motion.
// ES5-compatible, vanilla JS only.
// ============================================

/**
 * Initializes reveal-on-scroll animations using IntersectionObserver.
 * Elements with class `.reveal-on-scroll` receive `.revealed` when they
 * enter the viewport. If prefers-reduced-motion is active or
 * IntersectionObserver is unavailable, all targets are revealed immediately.
 */
function initRevealAnimations() {
  var targets = document.querySelectorAll('.reveal-on-scroll');
  if (!targets.length) return;

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Skip animations: reveal everything immediately
  if (prefersReduced || !('IntersectionObserver' in window)) {
    for (var i = 0; i < targets.length; i++) {
      targets[i].classList.add('revealed');
    }
    return;
  }

  // Observe elements and reveal on intersection (one-shot)
  var observer = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) {
      if (entries[j].isIntersecting) {
        entries[j].target.classList.add('revealed');
        observer.unobserve(entries[j].target);
      }
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  for (var k = 0; k < targets.length; k++) {
    observer.observe(targets[k]);
  }
}

// Auto-attach on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  initRevealAnimations();
});
