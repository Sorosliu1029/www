export type Capture = { slug: string; url: string; out: string };

export function planCaptures(projects: { slug: string; url: string }[], only?: string): Capture[] {
  const selected = only ? projects.filter((p) => p.slug === only) : projects;
  if (only && selected.length === 0) throw new Error(`Unknown project: ${only}`);
  return selected.map(({ slug, url }) => ({ slug, url, out: `public/shots/${slug}.webp` }));
}

export async function captureAll(
  plan: Capture[],
  capture: (url: string, out: string) => Promise<void>,
): Promise<{ ok: string[]; failed: string[] }> {
  const ok: string[] = [];
  const failed: string[] = [];
  for (const { slug, url, out } of plan) {
    try {
      await capture(url, out);
      ok.push(slug);
    } catch (err) {
      console.error(`✗ ${slug}: ${err instanceof Error ? err.message : err}`);
      failed.push(slug);
    }
  }
  return { ok, failed };
}
