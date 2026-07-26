# `@lucid-softworks/http-testkit`

Request factories and an in-process client for handler tests.

```ts
import {
  HttpTestClient,
  readJsonResponse,
} from "@lucid-softworks/http-testkit";

const client = new HttpTestClient(handler, { requestId: "test" });
const value = await readJsonResponse(
  await client.post("/users", { name: "Ada" }),
);
```

JSON request construction sets its content type unless explicitly overridden.
No socket or global fetch mock is required.
