// Tabbable elements are collected in DOM order; the overlays in this repo do
// not use positive tabindex values, which would tab in a different order.
const TABBABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "details > summary:first-of-type",
  "audio[controls]",
  "video[controls]",
  "iframe",
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function getScrollbarWidth() {
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
}

export function isElementVisible(element: HTMLElement) {
  // `visibility` inherits, so the element's own computed value already
  // reflects a hidden ancestor — and honors a `visibility: visible` override
  // on the element itself.
  const { visibility } = window.getComputedStyle(element);

  if (visibility === "hidden" || visibility === "collapse") {
    return false;
  }

  // `display` does NOT inherit: an element inside a `display: none` subtree
  // still reports its own computed display (e.g. "block"), so every ancestor
  // must be checked.
  for (
    let node: HTMLElement | null = element;
    node;
    node = node.parentElement
  ) {
    if (window.getComputedStyle(node).display === "none") {
      return false;
    }
  }

  return true;
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
