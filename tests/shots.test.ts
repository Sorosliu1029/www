import { describe, expect, it } from "vitest";
import { captureAll, planCaptures } from "../scripts/lib/shots";

const projects = [
  { slug: "a", url: "https://a.example.com" },
  { slug: "b", url: "https://b.example.com" },
  { slug: "c", url: "https://c.example.com" },
];

describe("planCaptures", () => {
  it("plans all projects", () => {
    expect(planCaptures(projects.slice(0, 2))).toEqual([
      { slug: "a", url: "https://a.example.com", out: "public/shots/a.webp" },
      { slug: "b", url: "https://b.example.com", out: "public/shots/b.webp" },
    ]);
  });

  it("filters to one slug", () => {
    expect(planCaptures(projects, "b").map((p) => p.slug)).toEqual(["b"]);
  });

  it("unknown slug throws", () => {
    expect(() => planCaptures(projects, "zzz")).toThrow("Unknown project: zzz");
  });
});

describe("captureAll", () => {
  it("continues after failure", async () => {
    const calls: string[] = [];
    const result = await captureAll(planCaptures(projects), async (url) => {
      calls.push(url);
      if (url.includes("//b.")) throw new Error("timeout");
    });
    expect(result).toEqual({ ok: ["a", "c"], failed: ["b"] });
    expect(calls).toHaveLength(3);
  });
});
