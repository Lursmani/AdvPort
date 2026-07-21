import type { RefObject } from "react";
import {
  getScrollbarWidth,
  getTabbableElements,
  isElementVisible,
} from "@/utils/domAccessibility";

type OverlayFocusOptions = {
  /**
   * The overlay's focus boundary. Read again on every keydown so contents
   * that mount after activation are still trapped.
   */
  containerRef: RefObject<HTMLElement | null>;
  /** Background containers to hide from interaction and assistive tech. */
  inertTargets: (HTMLElement | null)[];
  /**
   * Preferred initial focus target; falls back to the container's first
   * tabbable element, then the container itself.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Called when Escape is pressed (after the event is preventDefault-ed). */
  onEscape: () => void;
  /**
   * Resolved during cleanup. Return null to skip focus restoration; hidden or
   * disconnected targets are skipped automatically.
   */
  getRestoreFocusTarget: () => HTMLElement | null;
};

/**
 * Activates the shared overlay contract — background inert/aria-hidden, body
 * scroll lock with scrollbar compensation, initial focus, a Tab focus trap,
 * and Escape handling — and returns a cleanup that restores every previous
 * state before restoring focus. Canonical consumers are the header drawer
 * (src/components/header/util.ts) and the experience modal
 * (src/components/experience/ExperienceModal.tsx).
 */
export function trapOverlayFocus({
  containerRef,
  inertTargets,
  initialFocusRef,
  onEscape,
  getRestoreFocusTarget,
}: OverlayFocusOptions) {
  const previousInertStates = inertTargets
    .filter((element): element is HTMLElement => element !== null)
    .map((element) => ({
      element,
      hadInert: element.hasAttribute("inert"),
      previousAriaHidden: element.getAttribute("aria-hidden"),
    }));

  for (const { element } of previousInertStates) {
    element.setAttribute("inert", "");
    element.setAttribute("aria-hidden", "true");
  }

  // Lock background scrolling by freezing the body instead of swallowing
  // wheel and touch events on the document, which would also block scrolling
  // inside the overlay and ignore keyboard scroll keys.
  const body = document.body;
  const previousBodyOverflow = body.style.overflow;
  const previousBodyPaddingRight = body.style.paddingRight;
  const parsedPaddingRight = Number.parseFloat(
    window.getComputedStyle(body).paddingRight,
  );
  const currentPaddingRight = Number.isNaN(parsedPaddingRight)
    ? 0
    : parsedPaddingRight;
  const scrollbarWidth = getScrollbarWidth();

  body.style.overflow = "hidden";

  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
  }

  const container = containerRef.current;

  (
    initialFocusRef?.current ??
    (container ? getTabbableElements(container)[0] : null) ??
    container
  )?.focus();

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onEscape();
      return;
    }

    if (event.key !== "Tab" || !containerRef.current) {
      return;
    }

    const tabbableElements = getTabbableElements(containerRef.current);

    if (tabbableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = tabbableElements[0];
    const lastElement = tabbableElements[tabbableElements.length - 1];
    const activeElement = document.activeElement;

    if (!containerRef.current.contains(activeElement)) {
      event.preventDefault();

      if (event.shiftKey) {
        lastElement.focus();
      } else {
        firstElement.focus();
      }

      return;
    }

    if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }

    if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);

    body.style.overflow = previousBodyOverflow;
    body.style.paddingRight = previousBodyPaddingRight;

    for (const {
      element,
      hadInert,
      previousAriaHidden,
    } of previousInertStates) {
      if (!hadInert) {
        element.removeAttribute("inert");
      }

      if (previousAriaHidden === null) {
        element.removeAttribute("aria-hidden");
      } else {
        element.setAttribute("aria-hidden", previousAriaHidden);
      }
    }

    // Focus is restored only after the background is un-inerted above:
    // `.focus()` on an element inside an inert subtree is a silent no-op.
    const restoreTarget = getRestoreFocusTarget();

    if (restoreTarget?.isConnected && isElementVisible(restoreTarget)) {
      restoreTarget.focus({ preventScroll: true });
    }
  };
}
