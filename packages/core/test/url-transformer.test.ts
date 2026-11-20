import { describe, it, expect } from "vitest";
import { UrlTransformer } from "../src";

const t = new UrlTransformer({
  confluenceBaseUrl: "https://example.atlassian.net",
  localBaseUrl: "/viewer",
});

describe("UrlTransformer", () => {
  it("routes folders", () =>
    expect(t.toLocalUrl("https://example.atlassian.net/wiki/spaces/DOC/folder/1001/X")).toBe(
      "/viewer/?folderId=1001",
    ));
  it("keeps pages", () =>
    expect(t.toLocalUrl("https://example.atlassian.net/wiki/spaces/DOC/pages/2002")).toBe(
      "/viewer/?pageId=2002",
    ));
  it("ignores other hosts", () =>
    expect(t.toLocalUrl("https://evil.example.com/wiki/spaces/DOC/folder/1001")).toBe(
      "https://evil.example.com/wiki/spaces/DOC/folder/1001",
    ));
  it("transforms both kinds", () => {
    expect(t.shouldTransform("https://example.atlassian.net/wiki/spaces/DOC/folder/1001")).toBe(true);
    expect(t.shouldTransform("https://example.atlassian.net/wiki/spaces/DOC/pages/2002")).toBe(true);
  });
});
