import { describe, it, expect } from "vitest";
import { extractContentFromUrl, extractFolderIdFromUrl } from "../src/utils/url-parser";

const base = "https://example.atlassian.net/wiki";

describe("extractContentFromUrl", () => {
  it.each([
    [`${base}/spaces/DOC/folder/1001`, { type: "folder", id: "1001" }],
    [`${base}/spaces/DOC/folder/1001/Title?x=1#y`, { type: "folder", id: "1001" }],
    [`${base}/spaces/DOC/pages/2002/Some+Page`, { type: "page", id: "2002" }],
    [`${base}/pages/viewpage.action?pageId=2002`, { type: "page", id: "2002" }],
    [`${base}/spaces/DOC/overview?homepageId=3003`, { type: "page", id: "3003" }],
  ])("extractContentFromUrl(%s)", (url, expected) => {
    expect(extractContentFromUrl(url)).toEqual(expected);
  });

  it("returns null for a space overview without id", () => {
    expect(extractContentFromUrl(`${base}/spaces/DOC/overview`)).toBeNull();
  });
});

describe("extractFolderIdFromUrl", () => {
  it("does not read /folder/ inside a page title", () => {
    expect(extractFolderIdFromUrl(`${base}/spaces/DOC/pages/2002/my-folder`)).toBeNull();
  });
});
