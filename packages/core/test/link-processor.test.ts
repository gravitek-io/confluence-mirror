import { describe, it, expect, vi, afterEach } from "vitest";
import { processADFWithLinks } from "../src/processors/link-processor";
import type { ConfluenceClient } from "../src/client/confluence-client";
import type { ADFNode } from "../src/types";

const BASE = "https://example.atlassian.net";

/** Build a doc holding one paragraph with a single inline card. */
function docWithCard(url: string): ADFNode {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "inlineCard", attrs: { url } }] }],
  } as ADFNode;
}

/** Fake client exposing only the two lookups the processor uses. */
function fakeClient() {
  const client = {
    getPage: vi.fn(),
    getContentSummary: vi.fn(),
  };
  return { client, cast: client as unknown as ConfluenceClient };
}

afterEach(() => vi.restoreAllMocks());

describe("processADFWithLinks", () => {
  it("adds folder titles to inline cards", async () => {
    const { client, cast } = fakeClient();
    client.getContentSummary.mockResolvedValue({ id: "1001", title: "Team folder", type: "folder", spaceId: "9" });
    const doc = docWithCard(`${BASE}/wiki/spaces/DOC/folder/1001/Team+folder`);

    const { adf } = await processADFWithLinks(doc, { confluenceClient: cast, confluenceBaseUrl: BASE });

    expect(adf.content![0].content![0].attrs).toMatchObject({
      title: "Team folder",
      pageId: "1001",
      contentType: "folder",
    });
    expect(client.getContentSummary).toHaveBeenCalledWith("folder", "1001");
    expect(client.getPage).not.toHaveBeenCalled();
  });

  it("keeps page enrichment through getPage", async () => {
    const { client, cast } = fakeClient();
    client.getPage.mockResolvedValue({ title: "Home page" });
    const doc = docWithCard(`${BASE}/wiki/spaces/DOC/pages/2002/Home`);

    const { adf } = await processADFWithLinks(doc, { confluenceClient: cast, confluenceBaseUrl: BASE });

    expect(adf.content![0].content![0].attrs).toMatchObject({
      title: "Home page",
      pageId: "2002",
      contentType: "page",
    });
    expect(client.getPage).toHaveBeenCalledWith("2002", false);
    expect(client.getContentSummary).not.toHaveBeenCalled();
  });

  it("enriches link marks on folder links", async () => {
    const { client, cast } = fakeClient();
    client.getContentSummary.mockResolvedValue({ id: "1001", title: "Team folder", type: "folder", spaceId: "9" });
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "see",
              marks: [{ type: "link", attrs: { href: `${BASE}/wiki/spaces/DOC/folder/1001` } }],
            },
          ],
        },
      ],
    } as ADFNode;

    const { adf } = await processADFWithLinks(doc, { confluenceClient: cast, confluenceBaseUrl: BASE });

    expect(adf.content![0].content![0].marks![0].attrs).toMatchObject({
      title: "Team folder",
      contentType: "folder",
    });
  });

  it("leaves a folder link untouched when the lookup fails", async () => {
    const { client, cast } = fakeClient();
    client.getContentSummary.mockRejectedValue(new Error("forbidden"));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const doc = docWithCard(`${BASE}/wiki/spaces/DOC/folder/1001`);

    const { adf } = await processADFWithLinks(doc, { confluenceClient: cast, confluenceBaseUrl: BASE });

    const attrs = adf.content![0].content![0].attrs!;
    expect(attrs.title).toBeUndefined();
    expect(attrs.contentType).toBeUndefined();
    expect(warn).toHaveBeenCalled();
  });
});
