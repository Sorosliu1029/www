type Sortable = { data: { featured: boolean; year: number; title: string } };

export function sortProjects<T extends Sortable>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      Number(b.data.featured) - Number(a.data.featured) ||
      b.data.year - a.data.year ||
      a.data.title.localeCompare(b.data.title),
  );
}

export function isPublished(p: { data: { draft: boolean } }, prod: boolean): boolean {
  return !(prod && p.data.draft);
}

// FNV-1a, 32-bit
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

export function placeholderGradient(slug: string): { from: string; to: string; angle: number } {
  const h = hash(slug);
  const hue = h % 360;
  const toHue = (hue + 40 + ((h >>> 9) % 60)) % 360;
  return {
    from: `hsl(${hue} 70% 85%)`,
    to: `hsl(${toHue} 70% 85%)`,
    angle: 90 + ((h >>> 17) % 90),
  };
}

/** Returns a site-absolute cover path, or null when the placeholder should be used. */
export function resolveCover(
  slug: string,
  cover: string | undefined,
  exists: (publicPath: string) => boolean,
): string | null {
  for (const candidate of [cover, `shots/${slug}.webp`]) {
    if (candidate && exists(candidate)) return `/${candidate.replace(/^\/+/, "")}`;
  }
  return null;
}
