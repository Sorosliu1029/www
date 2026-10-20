import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkExternal, findBrokenInternal } from "../scripts/lib/links";

describe("findBrokenInternal", () => {
  it("reports missing targets", () => {
    const dir = mkdtempSync(join(tmpdir(), "links-"));
    mkdirSync(join(dir, "a"));
    writeFileSync(join(dir, "a", "index.html"), "<p>a</p>");
    writeFileSync(join(dir, "logo.svg"), "<svg/>");
    writeFileSync(
      join(dir, "index.html"),
      '<a href="/a">a</a><a href="/a/#top">a</a><a href="/b">b</a><img src="/logo.svg"><link href="/missing.css"><a href="https://x.com">x</a>',
    );
    expect(findBrokenInternal(dir).sort()).toEqual(["/b", "/missing.css"]);
  });
});

describe("checkExternal", () => {
  const fakeFetch = (impl: (url: string) => Promise<{ status: number }>) =>
    ((url: string) => impl(url)) as unknown as typeof fetch;

  it("treats a followed redirect ending in 200 as ok", async () => {
    expect(await checkExternal(["https://a.example.com"], fakeFetch(async () => ({ status: 200 })))).toEqual([]);
  });

  it("reports 404", async () => {
    expect(await checkExternal(["https://a.example.com"], fakeFetch(async () => ({ status: 404 })))).toEqual([
      { url: "https://a.example.com", status: 404 },
    ]);
  });

  it("reports network errors", async () => {
    const result = await checkExternal(
      ["https://a.example.com"],
      fakeFetch(async () => {
        throw new Error("ENOTFOUND");
      }),
    );
    expect(result).toEqual([{ url: "https://a.example.com", status: "error" }]);
  });
});
