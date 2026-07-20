import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { EXPERIENCE_PROJECTS } from "../src/components/experience/experience-data";
import { ogImagePath } from "../src/app/site";

// Code references files under public/ by URL path string, so a renamed or
// deleted asset ships a silent 404. These tests pin every such reference to
// an existing file.

const publicDirectory = path.resolve(process.cwd(), "public");

function publicFileExists(webPath: string) {
  return existsSync(
    path.join(publicDirectory, ...webPath.split("/").filter(Boolean)),
  );
}

describe("public asset references", () => {
  it("has a file for every experience project image", () => {
    const missing = EXPERIENCE_PROJECTS.flatMap((project) =>
      project.imageSources
        .filter((imagePath) => !publicFileExists(imagePath))
        .map((imagePath) => `${project.id}: ${imagePath}`),
    );

    expect(missing).toEqual([]);
  });

  it("has a file for the social share image", () => {
    expect(publicFileExists(ogImagePath)).toBe(true);
  });
});
