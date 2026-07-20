// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from "vitest";

import {
  getScrollbarWidth,
  getTabbableElements,
  isElementVisible,
} from "../src/utils/domAccessibility";
import { setViewportMetrics } from "./helpers/viewport";

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("isElementVisible", () => {
  it("treats elements without hiding styles as visible", () => {
    const element = document.createElement("button");
    document.body.append(element);

    expect(isElementVisible(element)).toBe(true);
  });

  it("treats display:none and visibility:hidden as invisible", () => {
    const hidden = document.createElement("button");
    hidden.style.display = "none";
    const invisible = document.createElement("button");
    invisible.style.visibility = "hidden";
    document.body.append(hidden, invisible);

    expect(isElementVisible(hidden)).toBe(false);
    expect(isElementVisible(invisible)).toBe(false);
  });
});

describe("getTabbableElements", () => {
  it("collects focusable controls in DOM order and skips the rest", () => {
    const container = document.createElement("div");
    container.innerHTML = `
      <a data-id="link" href="#skills">link</a>
      <a data-id="anchor-without-href">not a link target</a>
      <button data-id="button">ok</button>
      <button data-id="disabled-button" disabled>disabled</button>
      <button data-id="hidden-from-at" aria-hidden="true">aria hidden</button>
      <input data-id="input" />
      <input data-id="disabled-input" disabled />
      <select data-id="select"></select>
      <textarea data-id="textarea"></textarea>
      <div data-id="custom" tabindex="0">custom</div>
      <div data-id="programmatic-only" tabindex="-1">skip</div>
      <button data-id="display-none" style="display: none">hidden</button>
      <button data-id="visibility-hidden" style="visibility: hidden">invisible</button>
    `;
    document.body.append(container);

    const tabbableIds = getTabbableElements(container).map((element) =>
      element.getAttribute("data-id"),
    );

    expect(tabbableIds).toEqual([
      "link",
      "button",
      "input",
      "select",
      "textarea",
      "custom",
    ]);
  });

  it("returns an empty list for a container without focusable content", () => {
    const container = document.createElement("div");
    container.innerHTML = "<p>just text</p>";
    document.body.append(container);

    expect(getTabbableElements(container)).toEqual([]);
  });
});

describe("getScrollbarWidth", () => {
  it("measures the gap between the window and the document element", () => {
    setViewportMetrics(1024, 1008);

    expect(getScrollbarWidth()).toBe(16);
  });

  it("reports zero when there is no scrollbar", () => {
    setViewportMetrics(1024, 1024);

    expect(getScrollbarWidth()).toBe(0);
  });

  it("never reports a negative width", () => {
    setViewportMetrics(1000, 1024);

    expect(getScrollbarWidth()).toBe(0);
  });
});
