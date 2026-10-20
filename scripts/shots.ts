// Usage: npm run shots [-- <slug>]
import { mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import matter from "gray-matter";
import sharp from "sharp";
import { captureAll, planCaptures } from "./lib/shots";

const DIR = "src/content/projects";

function readProjects(): { slug: string; url: string }[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: basename(f, ".md"), url: String(matter(readFileSync(`${DIR}/${f}`, "utf8")).data.url) }));
}

async function main(): Promise<void> {
  let plan;
  try {
    plan = planCaptures(readProjects(), process.argv[2]);
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }

  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const result = await captureAll(plan, async (url, out) => {
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
    if (!res || !res.ok()) throw new Error(`HTTP ${res?.status() ?? "no response"}`);
    const png = await page.screenshot();
    const webp = await sharp(png).webp({ quality: 80 }).toBuffer();
    mkdirSync(dirname(out), { recursive: true });
    // Write to a temp file and rename, so a failed run never clobbers the old image.
    writeFileSync(`${out}.tmp`, webp);
    renameSync(`${out}.tmp`, out);
    console.log(`✓ ${out}`);
  });

  await browser.close();
  console.log(`ok: ${result.ok.join(", ") || "-"}`);
  console.log(`failed: ${result.failed.join(", ") || "-"}`);
  if (result.failed.length > 0) process.exit(1);
}

main();
