import { describe, expect, it } from "vitest";
import { isPublished, placeholderGradient, resolveCover, sortProjects } from "../src/lib/projects";

const item = (title: string, year: number, featured = false) => ({ data: { title, year, featured } });

describe("sortProjects", () => {
  it("orders featured, then year desc, then title asc", () => {
    const sorted = sortProjects([item("B", 2023), item("A", 2024), item("C", 2024, true), item("D", 2024)]);
    expect(sorted.map((p) => p.data.title)).toEqual(["C", "A", "D", "B"]);
  });

  it("does not mutate input", () => {
    const input = [item("B", 2023), item("A", 2024)];
    sortProjects(input);
    expect(input.map((p) => p.data.title)).toEqual(["B", "A"]);
  });
});

describe("isPublished", () => {
  it("hides drafts only in prod", () => {
    expect(isPublished({ data: { draft: true } }, true)).toBe(false);
    expect(isPublished({ data: { draft: true } }, false)).toBe(true);
    expect(isPublished({ data: { draft: false } }, true)).toBe(true);
  });
});

const slugs = ["bible", "cosmos-wormhole", "euler", "explore-git", "gottee", "jike-metro", "jupyterlab-leetcode", "leetcode", "sicp", "slides", "wereadou"];

describe("placeholderGradient", () => {
  it("is deterministic", () => {
    expect(placeholderGradient("sicp")).toEqual(placeholderGradient("sicp"));
  });

  it("differs across slugs", () => {
    const seen = new Set(slugs.map((s) => JSON.stringify(placeholderGradient(s))));
    expect(seen.size).toBe(slugs.length);
  });

  it("returns hsl colours and an angle", () => {
    const g = placeholderGradient("euler");
    expect(g.from).toMatch(/^hsl\(/);
    expect(g.to).toMatch(/^hsl\(/);
    expect(g.angle).toBeGreaterThanOrEqual(90);
    expect(g.angle).toBeLessThan(180);
  });
});

describe("resolveCover", () => {
  it("uses explicit cover when it exists", () => {
    expect(resolveCover("x", "shots/a.webp", () => true)).toBe("/shots/a.webp");
  });

  it("falls back to shots/<slug>.webp", () => {
    expect(resolveCover("x", undefined, (p) => p === "shots/x.webp")).toBe("/shots/x.webp");
  });

  it("returns null when nothing exists", () => {
    expect(resolveCover("x", undefined, () => false)).toBeNull();
  });

  it("returns null when explicit cover is missing and no default exists", () => {
    expect(resolveCover("x", "shots/missing.webp", () => false)).toBeNull();
  });
});
