import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.sorosliu.xyz",
  output: "static",
  outDir: process.env.OUT_DIR ?? "dist",
  integrations: [sitemap()],
});
