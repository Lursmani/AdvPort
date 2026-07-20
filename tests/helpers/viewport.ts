// Shared by the happy-dom suites: the DOM environment has no layout engine,
// so viewport metrics are stubbed via property overrides.
export function setViewportMetrics(innerWidth: number, clientWidth: number) {
  Object.defineProperty(window, "innerWidth", {
    value: innerWidth,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(document.documentElement, "clientWidth", {
    value: clientWidth,
    configurable: true,
  });
}
