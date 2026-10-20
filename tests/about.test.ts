import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { links } from "../src/data/links";
import { OUT, loadPage } from "./helpers/build";

describe("about page", () => {
  it("lists links", () => {
    expect(links.length).toBeGreaterThan(0);
    for (const l of links) {
      expect(loadPage("/about").querySelector(`main a[href="${l.href}"]`)?.text.trim()).toBe(l.label);
    }
  });

  it("has bio placeholder", () => {
    expect(loadPage("/about").querySelector("main .bio")).not.toBeNull();
  });
});

describe("sitemap", () => {
  it("lists published pages only", () => {
    const xml = readFileSync(`${OUT}/sitemap-0.xml`, "utf8");
    expect(xml).toContain("https://www.sorosliu.xyz/projects/alpha/");
    expect(xml).toContain("https://www.sorosliu.xyz/about/");
    expect(xml).not.toContain("draft-one");
  });
});
