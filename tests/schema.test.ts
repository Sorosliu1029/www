import { describe, expect, it } from "vitest";
import { projectSchema } from "../src/lib/schema";

const valid = {
  title: "SICP",
  tagline: "Notes",
  url: "https://sicp.sorosliu.xyz",
  lang: "en",
  year: 2024,
};

describe("projectSchema", () => {
  it("accepts a minimal valid project", () => {
    const p = projectSchema.parse(valid);
    expect(p.tags).toEqual([]);
    expect(p.stack).toEqual([]);
    expect(p.featured).toBe(false);
    expect(p.draft).toBe(false);
  });

  it("rejects tagline over 120 chars", () => {
    expect(projectSchema.safeParse({ ...valid, tagline: "x".repeat(121) }).success).toBe(false);
  });

  it("rejects unknown lang", () => {
    expect(projectSchema.safeParse({ ...valid, lang: "fr" }).success).toBe(false);
  });

  it("rejects non-URL url", () => {
    expect(projectSchema.safeParse({ ...valid, url: "sicp" }).success).toBe(false);
  });

  it("rejects non-integer year", () => {
    expect(projectSchema.safeParse({ ...valid, year: 2024.5 }).success).toBe(false);
  });
});
