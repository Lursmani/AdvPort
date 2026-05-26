const TABBABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function getScrollbarWidth() {
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

export function isElementVisible(element: HTMLElement) {
  const computedStyle = window.getComputedStyle(element);

  return (
    computedStyle.display !== "none" && computedStyle.visibility !== "hidden"
  );
}

export function getTabbableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR),
  ).filter(
    (element) =>
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-hidden") !== "true" &&
      isElementVisible(element),
  );
}
