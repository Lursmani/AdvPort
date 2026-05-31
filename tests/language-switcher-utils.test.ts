import { describe, expect, it } from "vitest";

import {
  getQueryFromSearch,
  normalizeHashFragment,
} from "../src/components/LanguageSwitcherUtils";

function expectQuery(
  actual: ReturnType<typeof getQueryFromSearch>,
  expected: Record<string, string | string[]>,
) {
  expect(actual).toBeDefined();

  if (actual === undefined) {
    return;
  }

  expect(Object.getPrototypeOf(actual)).toBeNull();
  expect({ ...actual }).toEqual(expected);
}

describe("getQueryFromSearch", () => {
  it("returns undefined for empty search strings", () => {
    expect(getQueryFromSearch("")).toBeUndefined();
    expect(getQueryFromSearch("?")).toBeUndefined();
  });

  it("parses a single query key", () => {
    expectQuery(getQueryFromSearch("?section=skills"), {
      section: "skills",
    });
  });

  it("preserves repeated query keys as arrays", () => {
    expectQuery(getQueryFromSearch("?tag=design&tag=motion&tag=frontend"), {
      tag: ["design", "motion", "frontend"],
    });
  });

  it("decodes URL-encoded query values", () => {
    expectQuery(
      getQueryFromSearch("?redirect=%2Fexperience%2Fsenior&label=hello+world"),
      {
        redirect: "/experience/senior",
        label: "hello world",
      },
    );
  });

  it("stores URL-controlled keys without inheriting object prototype behavior", () => {
    expectQuery(
      getQueryFromSearch("?__proto__=polluted&constructor=ctor&prototype=base"),
      {
        ["__proto__"]: "polluted",
        constructor: "ctor",
        prototype: "base",
      },
    );

    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});

describe("normalizeHashFragment", () => {
  it("drops empty fragments", () => {
    expect(normalizeHashFragment("")).toBeNull();
    expect(normalizeHashFragment("#")).toBeNull();
  });

  it("preserves meaningful fragments", () => {
    expect(normalizeHashFragment("#skills")).toBe("#skills");
  });
});
