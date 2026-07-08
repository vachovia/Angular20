import { ResolveFn } from '@angular/router';

const TIPS = [
  'Signals are pull-based and glitch-free; RxJS is push-based and stream-oriented.',
  'computed() is lazy and memoized — it only recomputes when read after a dep changed.',
  'model() = input() + output() wired for [(two-way)] binding.',
  'linkedSignal() is a writable signal that resets when its source changes.',
  'Zoneless CD relies on signals/events to schedule change detection.',
];

/**
 * Functional route resolver (`ResolveFn`) — pre-resolves data before the route
 * activates. Complements the functional guard and interceptor already in the
 * app. The resolved value is delivered to the component through router input
 * binding (a `tip` input on SignalsLab), thanks to `withComponentInputBinding`.
 */
export const tipResolver: ResolveFn<string> = (route) => {
  // Deterministic pick (no Math.random) so it's stable per visit.
  const index = (route.url.join('/').length + Date.now()) % TIPS.length;
  return TIPS[index];
};
