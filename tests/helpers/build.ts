import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse, type HTMLElement } from "node-html-parser";

export const OUT = "test-dist";

export function buildInto(outDir: string, projectsDir: string): void {
  execFileSync("npx", ["astro", "build"], {
    env: { ...process.env, PROJECTS_DIR: projectsDir, OUT_DIR: outDir },
    stdio: "pipe",
  });
}

export default function setup(): void {
  buildInto(OUT, "tests/fixtures/projects");
}

export function pageFile(route: string, outDir = OUT): string {
  const clean = route.replace(/^\/+|\/+$/g, "");
  const flat = join(outDir, `${clean}.html`);
  if (clean && existsSync(flat)) return flat;
  return join(outDir, clean, "index.html");
}

export function loadPage(route: string, outDir = OUT): HTMLElement {
  return parse(readFileSync(pageFile(route, outDir), "utf8"));
}

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = join(dir, e.name);
    if (e.isDirectory()) return htmlFiles(full);
    return e.name.endsWith(".html") ? [full] : [];
  });
}

/** All CSS shipped by the build: external files in _astro/ plus inline <style> blocks. */
export function readCss(outDir = OUT): string {
  const dir = join(outDir, "_astro");
  const external = existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith(".css"))
        .map((f) => readFileSync(join(dir, f), "utf8"))
    : [];
  const inline = htmlFiles(outDir).flatMap((f) =>
    parse(readFileSync(f, "utf8"))
      .querySelectorAll("style")
      .map((s) => s.text),
  );
  return [...external, ...inline].join("\n");
}
