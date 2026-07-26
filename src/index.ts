import {
  createHttpContext,
  type HttpContextOptions,
  type HttpHandler,
} from "@lucid-softworks/http-core";

export type HttpTestRequestInit = RequestInit &
  Readonly<{
    baseUrl?: string;
    json?: unknown;
  }>;

export function httpTestRequest(
  path = "/",
  init: HttpTestRequestInit = {},
): Request {
  const { baseUrl, body: initialBody, json, ...requestInit } = init;
  const headers = new Headers(init.headers);
  let body = initialBody;
  if (json !== undefined) {
    body = JSON.stringify(json);
    if (!headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }
  }
  return new Request(new URL(path, baseUrl ?? "http://test.local"), {
    ...requestInit,
    ...(body === undefined ? {} : { body }),
    headers,
  });
}

export async function invokeHttpHandler(
  handler: HttpHandler,
  request: Request,
  context: HttpContextOptions = {},
): Promise<Response> {
  return handler(request, createHttpContext(context));
}

export async function readJsonResponse<T = unknown>(
  response: Response,
): Promise<T> {
  return response.json() as Promise<T>;
}

export class HttpTestClient {
  constructor(
    private readonly handler: HttpHandler,
    private readonly context: HttpContextOptions = {},
  ) {}

  fetch(path: string, init: HttpTestRequestInit = {}): Promise<Response> {
    return invokeHttpHandler(
      this.handler,
      httpTestRequest(path, init),
      this.context,
    );
  }

  get(path: string, init: HttpTestRequestInit = {}): Promise<Response> {
    return this.fetch(path, { ...init, method: "GET" });
  }

  post(
    path: string,
    json?: unknown,
    init: HttpTestRequestInit = {},
  ): Promise<Response> {
    return this.fetch(path, { ...init, json, method: "POST" });
  }
}
