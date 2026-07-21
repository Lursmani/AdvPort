// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

import { trapOverlayFocus } from "../src/utils/overlayFocus";
import { setViewportMetrics } from "./helpers/viewport";

// The full overlay contract (inert application/restoration, scroll locking,
// the Tab trap, Escape, resize closing) is exercised through the header
// drawer in header-focus.test.ts. This suite covers the trapOverlayFocus
// behaviors that wrapper does not reach — chiefly the guarantees the
// experience modal relies on.

const activeCleanups: (() => void)[] = [];

function createHarness() {
  setViewportMetrics(1024, 1024);
  document.body.innerHTML = "";
  document.body.removeAttribute("style");

  const pageContent = document.createElement("main");
  pageContent.id = "page-content";
  const trigger = document.createElement("button");
  trigger.textContent = "open";
  pageContent.append(trigger);

  const panel = document.createElement("div");
  panel.setAttribute("tabindex", "-1");
  const closeButton = document.createElement("button");
  closeButton.textContent = "close";
  const link = document.createElement("a");
  link.href = "#details";
  panel.append(closeButton, link);

  document.body.append(pageContent, panel);

  const open = (
    overrides: Partial<Parameters<typeof trapOverlayFocus>[0]> = {},
  ) => {
    const cleanup = trapOverlayFocus({
      containerRef: { current: panel },
      inertTargets: [pageContent],
      initialFocusRef: { current: closeButton },
      onEscape: vi.fn(),
      getRestoreFocusTarget: () => trigger,
      ...overrides,
    });

    let cleanedUp = false;
    const runCleanupOnce = () => {
      if (!cleanedUp) {
        cleanedUp = true;
        cleanup();
      }
    };

    activeCleanups.push(runCleanupOnce);

    return runCleanupOnce;
  };

  return { pageContent, trigger, panel, closeButton, link, open };
}

afterEach(() => {
  for (const cleanup of activeCleanups.splice(0)) {
    cleanup();
  }
});

describe("trapOverlayFocus", () => {
  it("un-inerts the background before restoring focus", () => {
    const harness = createHarness();
    // `.focus()` inside an inert subtree is a silent no-op in browsers, so
    // the restore target must already be outside any inert container when
    // the focus call lands.
    let inertAtFocusTime: boolean | null = null;
    harness.trigger.addEventListener("focus", () => {
      inertAtFocusTime = harness.trigger.closest("[inert]") !== null;
    });

    const cleanup = harness.open();

    expect(harness.pageContent.getAttribute("inert")).toBe("");

    cleanup();

    expect(document.activeElement).toBe(harness.trigger);
    expect(inertAtFocusTime).toBe(false);
  });

  it("skips restoration when getRestoreFocusTarget returns null", () => {
    const harness = createHarness();
    const cleanup = harness.open({ getRestoreFocusTarget: () => null });

    cleanup();

    expect(document.activeElement).toBe(harness.closeButton);
  });

  it("skips restoration for disconnected targets", () => {
    const harness = createHarness();
    const cleanup = harness.open();

    harness.trigger.remove();
    cleanup();

    expect(document.activeElement).not.toBe(harness.trigger);
  });

  it("falls back to the first tabbable element without an initialFocusRef", () => {
    const harness = createHarness();
    harness.open({ initialFocusRef: undefined });

    expect(document.activeElement).toBe(harness.closeButton);
  });

  it("prevents default and delegates Escape to onEscape", () => {
    const harness = createHarness();
    const onEscape = vi.fn();
    harness.open({ onEscape });

    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("ignores tabbable elements hidden by a display:none ancestor", () => {
    const harness = createHarness();
    const hiddenSection = document.createElement("div");
    hiddenSection.style.display = "none";
    const hiddenButton = document.createElement("button");
    hiddenSection.append(hiddenButton);
    harness.panel.append(hiddenSection);

    harness.open();
    harness.link.focus();

    // The trap treats the visible link as the last tabbable element and
    // wraps to the front instead of handing focus to the hidden button.
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(harness.closeButton);
  });
});
