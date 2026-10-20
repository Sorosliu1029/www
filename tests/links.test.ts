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
  const fakeFetch = (impl: (url: string) => Promise<{ status: number; headers?: Headers }>) =>
    ((url: string) => impl(url)) as unknown as typeof fetch;
  const U = "https://a.example.com";

  it("treats a followed redirect ending in 200 as ok", async () => {
    expect(await checkExternal([U], fakeFetch(async () => ({ status: 200 })))).toEqual({ broken: [], unverified: [] });
  });

  it("reports 404", async () => {
    expect(await checkExternal([U], fakeFetch(async () => ({ status: 404 })))).toEqual({
      broken: [{ url: U, status: 404 }],
      unverified: [],
    });
  });

  it("reports a Cloudflare challenge as unverified, not broken", async () => {
    const challenged = fakeFetch(async () => ({ status: 403, headers: new Headers({ "cf-mitigated": "challenge" }) }));
    expect(await checkExternal([U], challenged)).toEqual({ broken: [], unverified: [U] });
  });

  it("reports a plain 403", async () => {
    const forbidden = fakeFetch(async () => ({ status: 403, headers: new Headers() }));
    expect(await checkExternal([U], forbidden)).toEqual({ broken: [{ url: U, status: 403 }], unverified: [] });
  });

  it("reports network errors", async () => {
    const failing = fakeFetch(async () => {
      throw new Error("ENOTFOUND");
    });
    expect(await checkExternal([U], failing)).toEqual({ broken: [{ url: U, status: "error" }], unverified: [] });
  });
});
