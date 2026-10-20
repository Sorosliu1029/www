import { existsSync } from "node:fs";
import { join } from "node:path";
import { getCollection, type CollectionEntry } from "astro:content";
import { isPublished, resolveCover, sortProjects } from "./projects";

export type VisibleProject = { entry: CollectionEntry<"projects">; cover: string | null };

export async function getVisibleProjects(): Promise<VisibleProject[]> {
  const entries = await getCollection("projects", (p) => isPublished(p, import.meta.env.PROD));
  return sortProjects(entries).map((entry) => ({
    entry,
    cover: resolveCover(entry.id, entry.data.cover, (p) => existsSync(join("public", p))),
  }));
}
