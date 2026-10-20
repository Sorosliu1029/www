import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "node-html-parser";

export function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(full);
    return e.name.endsWith(".html") ? [full] : [];
  });
}

function targetExists(distDir: string, href: string): boolean {
  const path = decodeURI(href.split(/[?#]/)[0]);
  const full = join(distDir, path);
  return (
    (existsSync(full) && !path.endsWith("/")) ||
    existsSync(join(full, "index.html")) ||
    existsSync(`${full.replace(/\/$/, "")}.html`)
  );
}

/** Site-absolute links (a, img, link) in the built HTML whose target is missing. */
export function findBrokenInternal(distDir: string): string[] {
  const broken = new Set<string>();
  for (const file of htmlFiles(distDir)) {
    const root = parse(readFileSync(file, "utf8"));
    const refs = [
      ...root.querySelectorAll("a[href]").map((e) => e.getAttribute("href")!),
      ...root.querySelectorAll("link[href]").map((e) => e.getAttribute("href")!),
      ...root.querySelectorAll("img[src]").map((e) => e.getAttribute("src")!),
    ];
    for (const ref of refs) {
      if (ref.startsWith("/") && !ref.startsWith("//") && !targetExists(distDir, ref)) broken.add(ref);
    }
  }
  return [...broken];
}

/** Returns only the failures: a final status >= 400 or a network error. Redirects are followed. */
export async function checkExternal(
  urls: string[],
  fetchFn: typeof fetch = fetch,
): Promise<{ url: string; status: number | "error" }[]> {
  const results = await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetchFn(url, { redirect: "follow", signal: AbortSignal.timeout(15000) });
        return { url, status: res.status as number | "error" };
      } catch {
        return { url, status: "error" as const };
      }
    }),
  );
  return results.filter((r) => r.status === "error" || r.status >= 400);
}
