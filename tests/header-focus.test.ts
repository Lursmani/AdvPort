// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

import { handleHeaderFocus } from "../src/components/header/util";
import { setViewportMetrics } from "./helpers/viewport";

// Exercises the full mobile-drawer overlay contract from
// src/components/header/util.ts: inert/aria-hidden application and
// restoration, body scroll locking with scrollbar compensation, initial
// focus, the Tab focus trap, Escape/resize closing, and focus restoration.

type HarnessOptions = {
  includeCloseButton?: boolean;
  includeLinks?: boolean;
  innerWidth?: number;
  clientWidth?: number;
};

// Every open() registers here so afterEach can release all listeners even if
// a test opens more than one harness.
const activeCleanups: (() => void)[] = [];

function createHarness({
  includeCloseButton = true,
  includeLinks = true,
  innerWidth = 1024,
  clientWidth = 1024,
}: HarnessOptions = {}) {
  setViewportMetrics(innerWidth, clientWidth);
  document.body.innerHTML = "";
  document.body.removeAttribute("style");

  const headerShell = document.createElement("div");
  const openButton = document.createElement("button");
  openButton.textContent = "open menu";
  headerShell.append(openButton);

  // tabindex="-1" mirrors a focusable dialog container; the trap's tabbable
  // scan still ignores it because of the :not([tabindex="-1"]) selector.
  const drawer = document.createElement("nav");
  drawer.setAttribute("tabindex", "-1");

  const closeButton = includeCloseButton
    ? document.createElement("button")
    : null;

  if (closeButton) {
    closeButton.textContent = "close menu";
    drawer.append(closeButton);
  }

  let firstLink: HTMLAnchorElement | null = null;
  let lastLink: HTMLAnchorElement | null = null;

  if (includeLinks) {
    firstLink = document.createElement("a");
    firstLink.href = "#skills";
    lastLink = document.createElement("a");
    lastLink.href = "#contact";
    drawer.append(firstLink, lastLink);
  }

  const pageContent = document.createElement("main");
  pageContent.id = "page-content";
  document.body.append(headerShell, drawer, pageContent);

  const setIsDrawerOpen = vi.fn();
  const shouldRestoreFocusRef = { current: true };

  const open = (isDrawerOpen = true) => {
    let cleanedUp = false;
    const cleanup = handleHeaderFocus({
      isDrawerOpen,
      headerShellRef: { current: headerShell },
      openDrawerButtonRef: { current: openButton },
      closeDrawerButtonRef: { current: closeButton },
      drawerRef: { current: drawer },
      shouldRestoreFocusRef,
      setIsDrawerOpen,
    });

    if (!cleanup) {
      return undefined;
    }

    const runCleanupOnce = () => {
      if (!cleanedUp) {
        cleanedUp = true;
        cleanup();
      }
    };

    activeCleanups.push(runCleanupOnce);

    return runCleanupOnce;
  };

  return {
    headerShell,
    openButton,
    drawer,
    closeButton,
    firstLink,
    lastLink,
    pageContent,
    setIsDrawerOpen,
    shouldRestoreFocusRef,
    open,
  };
}

function pressKey(key: string, init: KeyboardEventInit = {}) {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });

  document.dispatchEvent(event);

  return event;
}

afterEach(() => {
  for (const cleanup of activeCleanups.splice(0)) {
    cleanup();
  }
});

describe("handleHeaderFocus", () => {
  it("does nothing while the drawer is closed", () => {
    const harness = createHarness();
    const cleanup = harness.open(false);

    expect(cleanup).toBeUndefined();
    expect(harness.headerShell.hasAttribute("inert")).toBe(false);
    expect(harness.pageContent.hasAttribute("aria-hidden")).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("hides the background from interaction and assistive tech", () => {
    const harness = createHarness();
    const cleanup = harness.open();

    for (const element of [harness.headerShell, harness.pageContent]) {
      expect(element.getAttribute("inert")).toBe("");
      expect(element.getAttribute("aria-hidden")).toBe("true");
    }

    cleanup!();

    for (const element of [harness.headerShell, harness.pageContent]) {
      expect(element.hasAttribute("inert")).toBe(false);
      expect(element.hasAttribute("aria-hidden")).toBe(false);
    }
  });

  it("restores pre-existing inert and aria-hidden values on cleanup", () => {
    const harness = createHarness();
    harness.pageContent.setAttribute("inert", "");
    harness.pageContent.setAttribute("aria-hidden", "false");

    const cleanup = harness.open();
    cleanup!();

    expect(harness.pageContent.hasAttribute("inert")).toBe(true);
    expect(harness.pageContent.getAttribute("aria-hidden")).toBe("false");
  });

  it("locks body scrolling and compensates for the scrollbar width", () => {
    const harness = createHarness({ innerWidth: 1024, clientWidth: 1008 });
    const cleanup = harness.open();

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.paddingRight).toBe("16px");

    cleanup!();

    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.paddingRight).toBe("");
  });

  it("leaves body padding alone when there is no scrollbar", () => {
    const harness = createHarness({ innerWidth: 1024, clientWidth: 1024 });
    harness.open();

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.paddingRight).toBe("");
  });

  it("moves focus to the close button when the drawer opens", () => {
    const harness = createHarness();
    harness.open();

    expect(document.activeElement).toBe(harness.closeButton);
  });

  it("falls back to the first tabbable element without a close button", () => {
    const harness = createHarness({ includeCloseButton: false });
    harness.open();

    expect(document.activeElement).toBe(harness.firstLink);
  });

  it("falls back to the drawer itself when nothing inside is tabbable", () => {
    const harness = createHarness({
      includeCloseButton: false,
      includeLinks: false,
    });
    harness.open();

    expect(document.activeElement).toBe(harness.drawer);
  });

  it("closes on Escape and requests focus restoration", () => {
    const harness = createHarness();
    harness.open();
    harness.shouldRestoreFocusRef.current = false;

    const event = pressKey("Escape");

    expect(event.defaultPrevented).toBe(true);
    expect(harness.setIsDrawerOpen).toHaveBeenCalledWith(false);
    expect(harness.shouldRestoreFocusRef.current).toBe(true);
  });

  it("wraps Tab from the last tabbable element to the first", () => {
    const harness = createHarness();
    harness.open();
    harness.lastLink!.focus();

    const event = pressKey("Tab");

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(harness.closeButton);
  });

  it("wraps Shift+Tab from the first tabbable element to the last", () => {
    const harness = createHarness();
    harness.open();
    harness.closeButton!.focus();

    const event = pressKey("Tab", { shiftKey: true });

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(harness.lastLink);
  });

  it("lets Tab proceed naturally between middle elements", () => {
    const harness = createHarness();
    harness.open();
    harness.firstLink!.focus();

    const event = pressKey("Tab");

    expect(event.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(harness.firstLink);
  });

  it("pulls focus back into the drawer when it escapes", () => {
    const harness = createHarness();
    harness.open();

    harness.openButton.focus();
    pressKey("Tab");
    expect(document.activeElement).toBe(harness.closeButton);

    harness.openButton.focus();
    pressKey("Tab", { shiftKey: true });
    expect(document.activeElement).toBe(harness.lastLink);
  });

  it("swallows Tab when the drawer has nothing tabbable", () => {
    const harness = createHarness({
      includeCloseButton: false,
      includeLinks: false,
    });
    harness.open();

    const event = pressKey("Tab");

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(harness.drawer);
  });

  it("closes without restoring focus when resized to the desktop breakpoint", () => {
    const harness = createHarness();
    harness.open();

    setViewportMetrics(800, 800);
    window.dispatchEvent(new Event("resize"));

    expect(harness.setIsDrawerOpen).toHaveBeenCalledWith(false);
    expect(harness.shouldRestoreFocusRef.current).toBe(false);
  });

  it("stays open on mobile-width resizes", () => {
    const harness = createHarness();
    harness.open();

    setViewportMetrics(500, 500);
    window.dispatchEvent(new Event("resize"));

    expect(harness.setIsDrawerOpen).not.toHaveBeenCalled();
  });

  it("restores focus to the open button on cleanup", () => {
    const harness = createHarness();
    const cleanup = harness.open();

    cleanup!();

    expect(document.activeElement).toBe(harness.openButton);
    expect(harness.shouldRestoreFocusRef.current).toBe(true);
  });

  it("skips focus restoration when the resize path disabled it", () => {
    const harness = createHarness();
    const cleanup = harness.open();
    harness.shouldRestoreFocusRef.current = false;

    cleanup!();

    // Focus stays where the drawer left it instead of moving to the opener.
    expect(document.activeElement).toBe(harness.closeButton);
    // The flag is one-shot: cleanup re-arms restoration for the next open.
    expect(harness.shouldRestoreFocusRef.current).toBe(true);
  });

  it("skips focus restoration when the open button is hidden", () => {
    const harness = createHarness();
    const cleanup = harness.open();
    harness.openButton.style.display = "none";

    cleanup!();

    // Focus stays where the drawer left it instead of moving to the opener.
    expect(document.activeElement).toBe(harness.closeButton);
  });

  it("removes its listeners on cleanup", () => {
    const harness = createHarness();
    const cleanup = harness.open();

    cleanup!();
    harness.setIsDrawerOpen.mockClear();

    pressKey("Escape");
    setViewportMetrics(800, 800);
    window.dispatchEvent(new Event("resize"));

    expect(harness.setIsDrawerOpen).not.toHaveBeenCalled();
  });
});
