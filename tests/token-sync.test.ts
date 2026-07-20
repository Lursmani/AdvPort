import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { BREAKPOINTS, mediaMinWidth } from "../src/styles/breakpoints";
import { themeBackgroundColors } from "../src/app/site";

// Two token scales are duplicated between SCSS and TypeScript on purpose
// (documented in src/styles/breakpoints.ts and src/app/site.ts) and kept in
// sync only by convention. These tests turn those comments into contracts.

const breakpointsScss = readFileSync(
  path.resolve(process.cwd(), "src", "styles", "_breakpoints.scss"),
  "utf8",
);
const globalsScss = readFileSync(
  path.resolve(process.cwd(), "src", "app", "globals.scss"),
  "utf8",
);

function parseScssBreakpoints(source: string) {
  const mapMatch = source.match(/\$breakpoints:\s*\(([^)]*)\)/);

  expect(mapMatch, "expected a $breakpoints map in _breakpoints.scss").not.toBeNull();

  const parsed: Record<string, number> = {};

  for (const entryMatch of mapMatch![1].matchAll(
    /([\w-]+):\s*(\d+(?:\.\d+)?)px/g,
  )) {
    parsed[entryMatch[1]] = Number(entryMatch[2]);
  }

  return parsed;
}

// Brace-aware block extraction: a naive [^}]* regex would truncate at the
// first `}` inside SCSS interpolation (`#{...}`) or a nested rule. Counting
// brace depth keeps the parser correct if either ever lands in these blocks.
function extractBlock(source: string, blockSelector: string) {
  const escapedSelector = blockSelector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Anchor to a line start so a comment mentioning the selector cannot match.
  const openMatch = source.match(
    new RegExp(`(?:^|\\n)[ \\t]*${escapedSelector}\\s*\\{`),
  );

  expect(
    openMatch,
    `expected a "${blockSelector}" block in globals.scss`,
  ).not.toBeNull();

  const openIndex = openMatch!.index! + openMatch![0].length - 1;
  let depth = 0;

  for (let index = openIndex; index < source.length; index += 1) {
    if (source[index] === "{") {
      depth += 1;
    } else if (source[index] === "}") {
      depth -= 1;

      if (depth === 0) {
        return source.slice(openIndex + 1, index);
      }
    }
  }

  expect.unreachable(`unterminated "${blockSelector}" block in globals.scss`);
}

function getBackgroundToken(source: string, blockSelector: string) {
  const block = extractBlock(source, blockSelector);
  const tokenMatch = block.match(/--background:\s*(#[0-9a-fA-F]+)\s*;/);

  expect(
    tokenMatch,
    `expected a --background token in the "${blockSelector}" block`,
  ).not.toBeNull();

  return tokenMatch![1].toLowerCase();
}

describe("breakpoint scale", () => {
  it("keeps the JS mirror in sync with _breakpoints.scss", () => {
    expect(parseScssBreakpoints(breakpointsScss)).toEqual({ ...BREAKPOINTS });
  });

  it("builds min-width media queries from the shared scale", () => {
    expect(mediaMinWidth("md")).toBe("(min-width: 768px)");
    expect(mediaMinWidth("2xl")).toBe("(min-width: 1536px)");
  });
});

describe("theme background colors", () => {
  it("keeps themeBackgroundColors in sync with the --background tokens", () => {
    // Dark is the :root default; light overrides it via html[data-theme].
    expect(getBackgroundToken(globalsScss, ":root")).toBe(
      themeBackgroundColors.dark.toLowerCase(),
    );
    expect(getBackgroundToken(globalsScss, 'html[data-theme="light"]')).toBe(
      themeBackgroundColors.light.toLowerCase(),
    );
  });
});
