import { describe, expect, it } from "vitest";
import { EMPTY_OUT, loadPage, readCss } from "./helpers/build";

describe("homepage", () => {
  const page = () => loadPage("/");
  const card = (slug: string) => page().querySelector(`a.card[href="/projects/${slug}"]`);

  it("lists published projects in order", () => {
    const hrefs = page().querySelectorAll("a.card").map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["/projects/alpha", "/projects/gamma", "/projects/beta"]);
  });

  it("excludes drafts", () => {
    expect(page().toString()).not.toContain("draft-one");
  });

  it("card shows title, tagline, max 3 tags", () => {
    const c = card("alpha")!;
    expect(c.text).toContain("Alpha");
    expect(c.text).toContain("The alpha fixture project.");
    expect(c.querySelectorAll(".tag").length).toBe(3);
  });

  it("missing cover renders placeholder", () => {
    const c = card("gamma")!;
    expect(c.querySelector(".placeholder")).not.toBeNull();
    expect(c.querySelector("img")).toBeNull();
  });

  it("intro present", () => {
    expect(page().querySelector("main .intro")).not.toBeNull();
  });

  it("long CJK tagline can wrap", () => {
    expect(readCss()).toMatch(/overflow-wrap:\s*anywhere/);
  });

  it("shows empty state when nothing is published", () => {
    const empty = loadPage("/", EMPTY_OUT);
    expect(empty.querySelector(".empty")?.text.trim()).toBe("Projects coming soon.");
    expect(empty.querySelector(".grid")).toBeNull();
  });
});
