import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConfluenceClient, ConfluenceApiError, OAuth2Strategy } from "../src";

const BASE = "https://example.atlassian.net";
const V2 = `${BASE}/wiki/api/v2`;

/** Build a minimal fetch Response-like object. */
function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  };
}

const items = (n: number, from = 0) =>
  Array.from({ length: n }, (_, i) => ({
    id: String(from + i),
    status: "current",
    title: `Item ${from + i}`,
    type: "page",
    childPosition: i,
  }));

describe("hierarchy reads (REST v2)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: ConfluenceClient;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    client = ConfluenceClient.createWithBasicAuth(BASE, "a@b.c", "k");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("calls v2 in Basic Auth mode", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ results: [{ id: "1", type: "folder" }] }));
    await client.getAncestors("folder", "1001");
    expect(fetchMock.mock.calls[0][0]).toBe(`${V2}/folders/1001/ancestors`);
  });

  it("calls v2 on api.atlassian.com in OAuth2 mode", async () => {
    vi.spyOn(OAuth2Strategy.prototype, "getAuthHeaders").mockResolvedValue({
      Authorization: "Bearer t",
    });
    vi.spyOn(OAuth2Strategy.prototype, "getCloudId").mockResolvedValue("cloud-1");
    const oauthClient = ConfluenceClient.createWithOAuth2("id", "secret");
    fetchMock.mockResolvedValue(jsonResponse({ id: "2002", title: "P", spaceId: "77" }));
    await oauthClient.getContentSummary("page", "2002");
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://api.atlassian.com/ex/confluence/cloud-1/wiki/api/v2/pages/2002",
    );
  });

  it("follows _links.next until done", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          results: items(250),
          _links: { next: "/wiki/api/v2/folders/1001/direct-children?cursor=abc&limit=250" },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ results: items(3, 250), _links: {} }));
    const r = await client.getDirectChildren("folder", "1001");
    expect(r.items).toHaveLength(253);
    expect(r.truncated).toBe(false);
    expect(fetchMock.mock.calls[0][0]).toBe(`${V2}/folders/1001/direct-children?limit=250`);
    expect(fetchMock.mock.calls[1][0]).toBe(
      `${V2}/folders/1001/direct-children?cursor=abc&limit=250`,
    );
  });

  it("stops at maxItems and flags truncation", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({
        results: items(250),
        _links: { next: "/wiki/api/v2/pages/2002/direct-children?cursor=abc&limit=250" },
      }),
    );
    const r = await client.getDirectChildren("page", "2002", { maxItems: 500 });
    expect(r.items).toHaveLength(500);
    expect(r.truncated).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("resolves the folder's space key", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({
          id: "1001",
          title: "F",
          spaceId: "77",
          parentId: "5",
          parentType: "page",
          status: "current",
          _links: { webui: "/spaces/DOC/folder/1001" },
        }),
      )
      .mockResolvedValueOnce(jsonResponse({ key: "DOC", name: "Docs" }));
    const folder = await client.getFolder("1001");
    expect(folder.space).toEqual({ key: "DOC", name: "Docs" });
    expect(folder.type).toBe("folder");
    expect(folder._links.webui).toBe("/spaces/DOC/folder/1001");
    expect(fetchMock.mock.calls[1][0]).toBe(`${V2}/spaces/77`);
  });

  it("returns space null when the space lookup fails", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ id: "1001", title: "F", spaceId: "77", status: "current", _links: { webui: "/x" } }),
      )
      .mockResolvedValueOnce(jsonResponse({}, 401));
    expect((await client.getFolder("1001")).space).toBeNull();
  });

  it("throws ConfluenceApiError with the status on 404", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "nope" }, 404));
    await expect(client.getFolder("9")).rejects.toMatchObject({
      name: "ConfluenceApiError",
      statusCode: 404,
    });
  });

  it("rejects unknown content types without calling fetch", async () => {
    await expect(client.getAncestors("blogpost", "1")).rejects.toThrow("Unsupported content type");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("input validation (no request sent)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let client: ConfluenceClient;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    client = ConfluenceClient.createWithBasicAuth(BASE, "a@b.c", "k");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const badIds = ["..", "1/../2", "abc", "", "12 3", "../../admin"];
  const methods: Array<[string, (id: string) => Promise<unknown>]> = [
    ["getPage", (id) => client.getPage(id)],
    ["getChildPages", (id) => client.getChildPages(id)],
    ["getFolder", (id) => client.getFolder(id)],
    ["getDirectChildren", (id) => client.getDirectChildren("folder", id)],
    ["getAncestors", (id) => client.getAncestors("page", id)],
    ["getContentSummary", (id) => client.getContentSummary("folder", id)],
  ];

  for (const [name, call] of methods) {
    it(`${name} rejects non-numeric IDs without fetching`, async () => {
      for (const id of badIds) {
        await expect(call(id)).rejects.toBeInstanceOf(ConfluenceApiError);
      }
      expect(fetchMock).not.toHaveBeenCalled();
    });
  }

  it("rejects prototype keys as content types", async () => {
    for (const type of ["constructor", "toString", "__proto__"]) {
      await expect(
        client.getAncestors(type as never, "1001")
      ).rejects.toBeInstanceOf(ConfluenceApiError);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects invalid maxItems", async () => {
    for (const maxItems of [0, -1, Number.NaN, 1.5, Infinity]) {
      await expect(
        client.getDirectChildren("folder", "1001", { maxItems })
      ).rejects.toBeInstanceOf(ConfluenceApiError);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stops on an endless `next` with empty pages", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({
        results: [],
        _links: { next: "/wiki/api/v2/folders/1001/direct-children?cursor=x" },
      })
    );
    const res = await client.getDirectChildren("folder", "1001", { maxItems: 10 });
    expect(res.truncated).toBe(true);
    expect(res.items).toEqual([]);
    expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it("stops when `next` is not a v2 path", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        results: items(2),
        _links: { next: "https://evil.example/steal" },
      })
    );
    const res = await client.getDirectChildren("folder", "1001");
    expect(res.truncated).toBe(true);
    expect(res.items).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
