import { Dispatch, RefObject, SetStateAction } from "react";
import {
  getScrollbarWidth,
  getTabbableElements,
  isElementVisible,
} from "@/utils/domAccessibility";

export const handleHeaderFocus = ({
  isDrawerOpen,
  headerShellRef,
  openDrawerButtonRef,
  closeDrawerButtonRef,
  drawerRef,
  shouldRestoreFocusRef,
  setIsDrawerOpen,
}: {
  isDrawerOpen: boolean;
  headerShellRef: RefObject<HTMLDivElement | null>;
  openDrawerButtonRef: RefObject<HTMLButtonElement | null>;
  closeDrawerButtonRef: RefObject<HTMLButtonElement | null>;
  drawerRef: RefObject<HTMLElement | null>;
  shouldRestoreFocusRef: RefObject<boolean>;
  setIsDrawerOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  if (!isDrawerOpen) {
    return;
  }

  const pageContent = document.getElementById("page-content");
  const elementsToInert = [headerShellRef.current, pageContent].filter(
    (element): element is HTMLElement => element !== null,
  );
  const previousElementStates = elementsToInert.map((element) => ({
    element,
    hadInert: element.hasAttribute("inert"),
    previousAriaHidden: element.getAttribute("aria-hidden"),
  }));
  const openDrawerButtonElement = openDrawerButtonRef.current;
  const drawerElement = drawerRef.current;

  for (const { element } of previousElementStates) {
    element.setAttribute("inert", "");
    element.setAttribute("aria-hidden", "true");
  }

  // Lock background scrolling by freezing the body instead of swallowing wheel
  // and touch events on the document, which also blocks scrolling inside the
  // drawer and ignores keyboard scroll keys. Mirrors ExperienceModal.
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

  (
    closeDrawerButtonRef.current ??
    (drawerElement ? getTabbableElements(drawerElement)[0] : null) ??
    drawerElement
  )?.focus();

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      shouldRestoreFocusRef.current = true;
      setIsDrawerOpen(false);
      return;
    }

    if (event.key !== "Tab" || !drawerRef.current) {
      return;
    }

    const tabbableElements = getTabbableElements(drawerRef.current);

    if (tabbableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = tabbableElements[0];
    const lastElement = tabbableElements[tabbableElements.length - 1];
    const activeElement = document.activeElement;

    if (!drawerRef.current.contains(activeElement)) {
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

  const handleResize = () => {
    if (window.innerWidth >= 768) {
      shouldRestoreFocusRef.current = false;
      setIsDrawerOpen(false);
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  window.addEventListener("resize", handleResize);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("resize", handleResize);

    body.style.overflow = previousBodyOverflow;
    body.style.paddingRight = previousBodyPaddingRight;

    for (const {
      element,
      hadInert,
      previousAriaHidden,
    } of previousElementStates) {
      if (!hadInert) {
        element.removeAttribute("inert");
      }

      if (previousAriaHidden === null) {
        element.removeAttribute("aria-hidden");
      } else {
        element.setAttribute("aria-hidden", previousAriaHidden);
      }
    }

    const shouldRestoreFocus = shouldRestoreFocusRef.current;

    shouldRestoreFocusRef.current = true;

    if (
      shouldRestoreFocus &&
      openDrawerButtonElement &&
      isElementVisible(openDrawerButtonElement)
    ) {
      openDrawerButtonElement.focus();
    }
  };
};
