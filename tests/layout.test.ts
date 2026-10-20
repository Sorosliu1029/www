import { describe, expect, it } from "vitest";
import { loadPage, readCss } from "./helpers/build";

describe("base layout (via 404)", () => {
  const page = () => loadPage("/404");

  it("html lang defaults to en", () => {
    expect(page().querySelector("html")?.getAttribute("lang")).toBe("en");
  });

  it("header links home and to /about", () => {
    const home = page().querySelector('header a[href="/"]');
    expect(home?.text.trim()).toBe("sorosliu.xyz");
    expect(page().querySelector('header nav a[href="/about"]')).not.toBeNull();
  });

  it("footer has GitHub link", () => {
    expect(page().querySelector('footer a[href^="https://github.com/"]')).not.toBeNull();
  });

  it("404 links home", () => {
    expect(page().querySelector('main a[href="/"]')).not.toBeNull();
  });

  it("title uses site suffix", () => {
    expect(page().querySelector("title")?.text).toBe("Page not found · Soros Liu");
  });

  it("css defines dark scheme", () => {
    expect(readCss()).toMatch(/prefers-color-scheme:\s*dark/);
  });
});
