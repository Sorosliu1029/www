// Usage: tsx scripts/check-links.ts <distDir>
import { readFileSync } from "node:fs";
import { parse } from "node-html-parser";
import { checkExternal, findBrokenInternal, htmlFiles } from "./lib/links";

async function main(): Promise<void> {
  const dist = process.argv[2] ?? "dist";
  const internal = findBrokenInternal(dist);

  const projectUrls = [
    ...new Set(
      htmlFiles(dist).flatMap((f) =>
        parse(readFileSync(f, "utf8"))
          .querySelectorAll("aside a.visit")
          .map((a) => a.getAttribute("href")!),
      ),
    ),
  ];
  const external = await checkExternal(projectUrls);

  for (const href of internal) console.error(`✗ internal: ${href}`);
  for (const { url, status } of external) console.error(`✗ project: ${url} (${status})`);
  console.log(`checked ${projectUrls.length} project URL(s); ${internal.length + external.length} broken`);
  if (internal.length + external.length > 0) process.exit(1);
}

main();
