import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { OUT, loadPage } from "./helpers/build";

describe("project detail page", () => {
  it("zh project sets html lang", () => {
    expect(loadPage("/projects/beta").querySelector("html")?.getAttribute("lang")).toBe("zh");
    expect(loadPage("/projects/alpha").querySelector("html")?.getAttribute("lang")).toBe("en");
  });

  it("visit button links to url in same tab", () => {
    const visit = loadPage("/projects/alpha").querySelector('aside a.visit[href="https://alpha.example.com"]');
    expect(visit?.text.trim()).toBe("Visit ↗");
    expect(visit?.getAttribute("target")).toBeUndefined();
  });

  it("source link only when repo set", () => {
    expect(loadPage("/projects/alpha").querySelector("aside a.source")?.getAttribute("href")).toBe(
      "https://github.com/example/alpha",
    );
    expect(loadPage("/projects/gamma").querySelector("aside a.source")).toBeNull();
  });

  it("sidebar shows year, stack, tags", () => {
    const aside = loadPage("/projects/alpha").querySelector("aside")!.text;
    for (const s of ["2024", "TypeScript", "Astro", "one", "four"]) expect(aside).toContain(s);
  });

  it("back link", () => {
    expect(loadPage("/projects/alpha").querySelector('a[href="/"].back')?.text.trim()).toBe("← All projects");
  });

  it("markdown body rendered", () => {
    expect(loadPage("/projects/alpha").querySelector("article h2")?.text).toBe("What it is");
  });

  it("meta description is tagline", () => {
    expect(
      loadPage("/projects/alpha").querySelector('meta[name="description"]')?.getAttribute("content"),
    ).toBe("The alpha fixture project.");
  });

  it("missing cover renders placeholder", () => {
    expect(loadPage("/projects/gamma").querySelector(".hero .placeholder")).not.toBeNull();
  });

  it("no page for drafts", () => {
    expect(existsSync(`${OUT}/projects/draft-one/index.html`)).toBe(false);
  });
});
