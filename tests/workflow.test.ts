import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const wf = readFileSync(".github/workflows/deploy.yml", "utf8");

describe("deploy workflow", () => {
  it("runs on pull requests", () => {
    expect(wf).toMatch(/^on:[\s\S]*?^\s+pull_request:/m);
  });

  it("only uploads and deploys outside pull requests", () => {
    const guard = "if: github.event_name != 'pull_request'";
    const upload = wf.slice(wf.indexOf("upload-pages-artifact") - 120, wf.indexOf("upload-pages-artifact"));
    expect(upload).toContain(guard);
    const deployJob = wf.slice(wf.indexOf("\n  deploy:"));
    expect(deployJob.split("steps:")[0]).toContain(guard);
  });
});
