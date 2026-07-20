import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import {
  EXPERIENCE_PROJECTS,
  EXPERIENCE_TAG_IDS,
} from "../src/components/experience/experience-data";

// ExperienceSection.tsx builds message keys from experience-data.ts at
// runtime (`projects.${project.id}`, `tags.${tagId}`), so the data file and
// the catalogs form a contract that TypeScript cannot check. Only en.json is
// inspected here: translations-sync.test.ts already guarantees nl/ka mirror
// its structure.

type MessageTree = {
  [key: string]: string | MessageTree;
};

const enMessages = JSON.parse(
  readFileSync(path.resolve(process.cwd(), "messages", "en.json"), "utf8"),
) as MessageTree;

const experienceMessages = enMessages.ExperienceSection as MessageTree;
const projectMessages = experienceMessages.projects as MessageTree;
const tagMessages = experienceMessages.tags as MessageTree;
const actionMessages = experienceMessages.actions as MessageTree;

// The shape ExperienceSection.tsx reads via t.raw(`projects.${id}`).
const PROJECT_MESSAGE_KEYS = ["title", "subtitle", "description"] as const;

// All `actions.*` reads live in the experience components as static string
// literals, so the required keys are scraped from source instead of being
// maintained as a duplicate list — a newly added t("actions.x") call is
// covered automatically.
function collectActionKeysFromSource() {
  const componentsDirectory = path.resolve(
    process.cwd(),
    "src",
    "components",
    "experience",
  );
  const keys = new Set<string>();

  for (const fileName of readdirSync(componentsDirectory)) {
    if (!fileName.endsWith(".tsx")) {
      continue;
    }

    const source = readFileSync(
      path.join(componentsDirectory, fileName),
      "utf8",
    );

    for (const match of source.matchAll(/["'`]actions\.(\w+)["'`]/g)) {
      keys.add(match[1]);
    }
  }

  return [...keys].sort();
}

function isNonEmptyString(value: string | MessageTree | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

describe("experience data to message catalog contract", () => {
  it("provides title, subtitle, and description for every project id", () => {
    const missing = EXPERIENCE_PROJECTS.flatMap((project) => {
      const messages = projectMessages[project.id];

      if (typeof messages !== "object" || messages === null) {
        return [`projects.${project.id}`];
      }

      return PROJECT_MESSAGE_KEYS.filter(
        (key) => !isNonEmptyString(messages[key]),
      ).map((key) => `projects.${project.id}.${key}`);
    });

    expect(missing).toEqual([]);
  });

  it("has no project entries without a matching experience-data project", () => {
    const projectIds = EXPERIENCE_PROJECTS.map((project) => project.id).sort();

    expect(Object.keys(projectMessages).sort()).toEqual(projectIds);
  });

  it("provides a label for every tag id", () => {
    const missing = EXPERIENCE_TAG_IDS.filter(
      (tagId) => !isNonEmptyString(tagMessages[tagId]),
    );

    expect(missing).toEqual([]);
  });

  it("has no tag labels without a matching experience-data tag id", () => {
    expect(Object.keys(tagMessages).sort()).toEqual(
      [...EXPERIENCE_TAG_IDS].sort(),
    );
  });

  it("provides every action label the experience components read", () => {
    const requiredKeys = collectActionKeysFromSource();

    // Canary against the extraction regex rotting silently.
    expect(requiredKeys.length).toBeGreaterThan(0);
    expect(requiredKeys).toContain("closeModal");

    const missing = requiredKeys.filter(
      (key) => !isNonEmptyString(actionMessages[key]),
    );

    expect(missing).toEqual([]);
  });
});
