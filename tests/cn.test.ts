import { describe, expect, it } from "vitest";

import cn from "../src/utils/cn";

describe("cn", () => {
  it("lets later Tailwind utilities win conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-left", "text-center")).toBe("text-center");
  });

  it("drops falsy conditional inputs", () => {
    expect(cn("flex", false, undefined, null, "", "gap-2")).toBe("flex gap-2");
  });

  it("accepts clsx-style arrays and objects", () => {
    expect(cn(["flex", { "items-center": true, hidden: false }])).toBe(
      "flex items-center",
    );
  });

  it("keeps non-Tailwind classes (e.g. CSS module classes) intact", () => {
    expect(cn("moduleHash123", "p-4")).toBe("moduleHash123 p-4");
  });
});
