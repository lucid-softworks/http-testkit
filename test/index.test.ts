import { describe, expect, it } from "vitest";

import {
  HttpTestClient,
  httpTestRequest,
  invokeHttpHandler,
  readJsonResponse,
} from "../src/index.js";

describe("HTTP testkit", () => {
  it("creates default and customized test requests", async () => {
    expect(httpTestRequest().url).toBe("http://test.local/");
    const request = httpTestRequest("/items", {
      baseUrl: "https://example.com/api/",
      headers: { x: "yes" },
      json: { value: 1 },
      method: "POST",
    });
    expect(request.url).toBe("https://example.com/items");
    expect(request.headers.get("content-type")).toBe("application/json");
    expect(await request.json()).toEqual({ value: 1 });
    const custom = httpTestRequest("/", {
      headers: { "content-type": "application/problem+json" },
      json: null,
      method: "POST",
    });
    expect(custom.headers.get("content-type")).toBe("application/problem+json");
  });

  it("invokes handlers with test contexts and reads JSON", async () => {
    const response = await invokeHttpHandler(
      (_request, context) => Response.json({ requestId: context.requestId }),
      httpTestRequest(),
      { requestId: "fixed" },
    );
    await expect(
      readJsonResponse<{ requestId: string }>(response),
    ).resolves.toEqual({
      requestId: "fixed",
    });
  });

  it("provides GET, POST, and generic client helpers", async () => {
    const client = new HttpTestClient(
      async (request, context) =>
        Response.json({
          body: request.body === null ? null : await request.json(),
          method: request.method,
          requestId: context.requestId,
        }),
      { requestId: "client" },
    );
    await expect(
      readJsonResponse(await client.get("/")),
    ).resolves.toMatchObject({
      body: null,
      method: "GET",
    });
    await expect(
      readJsonResponse(await client.post("/", { x: 1 })),
    ).resolves.toMatchObject({
      body: { x: 1 },
      method: "POST",
    });
    expect((await client.fetch("/", { method: "DELETE" })).status).toBe(200);
  });
});
