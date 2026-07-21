import { describe, expect, it } from "vitest";

import {
  consumePendingLocaleSwitchHash,
  getLocaleSwitchHref,
  getQueryFromSearch,
  normalizeHashFragment,
  setPendingLocaleSwitchHash,
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

describe("getLocaleSwitchHref", () => {
  it("returns a pathname-only href when the search string is empty", () => {
    expect(getLocaleSwitchHref("/experience", "")).toStrictEqual({
      pathname: "/experience",
    });
    expect(getLocaleSwitchHref("/experience", "?")).toStrictEqual({
      pathname: "/experience",
    });
  });

  it("carries the parsed query along with the pathname", () => {
    const href = getLocaleSwitchHref("/experience", "?tag=design&tag=motion");

    expect(href.pathname).toBe("/experience");
    expectQuery("query" in href ? href.query : undefined, {
      tag: ["design", "motion"],
    });
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

describe("pending locale switch hash", () => {
  it("is consumed exactly once, and only by the target locale", () => {
    setPendingLocaleSwitchHash("#experience", "nl");

    expect(consumePendingLocaleSwitchHash("en")).toBeNull();
    expect(consumePendingLocaleSwitchHash("nl")).toBe("#experience");
    expect(consumePendingLocaleSwitchHash("nl")).toBeNull();
  });

  it("clears any pending hash when a switch starts without one", () => {
    setPendingLocaleSwitchHash("#experience", "nl");
    setPendingLocaleSwitchHash(null, "ka");

    expect(consumePendingLocaleSwitchHash("nl")).toBeNull();
    expect(consumePendingLocaleSwitchHash("ka")).toBeNull();
  });

  it("lets a newer switch supersede an in-flight one", () => {
    setPendingLocaleSwitchHash("#experience", "nl");
    setPendingLocaleSwitchHash("#contact", "ka");

    expect(consumePendingLocaleSwitchHash("nl")).toBeNull();
    expect(consumePendingLocaleSwitchHash("ka")).toBe("#contact");
  });
});
