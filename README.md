# @oreforge/sdk

TypeScript SDK for the [ore](https://github.com/oreforge/ore) game server infrastructure platform.

## Installation

```bash
npm install @oreforge/sdk
```

```bash
yarn add @oreforge/sdk
```

```bash
pnpm add @oreforge/sdk
```

```bash
bun add @oreforge/sdk
```

## Getting Started

```ts
import { OreClient } from "@oreforge/sdk";

const client = new OreClient({
  baseUrl: "http://localhost:8080",
  token: "your-api-token",
  maxRetries: 2, // optional, retries on 429/5xx for GET/DELETE (default: 2)
});
```

## Projects

### List Projects

```ts
const { projects } = await client.projects.list();
```

### Add a Project

```ts
const project = await client.projects.add({
  url: "https://github.com/org/network.git",
  name: "mynetwork", // optional, inferred from repo name if omitted
});
```

### Remove a Project

```ts
await client.projects.remove("mynetwork");
```

### Update a Project (git pull + redeploy)

```ts
for await (const line of client.projects.update("mynetwork")) {
  console.log(line.msg);
}
```

### Get a Project Instance

Use `client.projects.get()` to get a project instance for all project-level operations.

```ts
const project = client.projects.get("mynetwork");
```

## Project Operations

All streaming operations return an `NdjsonStream` that implements `AsyncIterable<StreamLine>`.

### Status

```ts
const status = await project.status();

for (const server of status.servers) {
  console.log(server.name, server.container.state);
  console.log("CPU:", server.container.resources.cpu.percent + "%");
  console.log("Memory:", server.container.resources.memory.percent + "%");
}
```

### Start (Up)

```ts
for await (const line of project.up()) {
  console.log(line.msg);
}

// with options
for await (const line of project.up({ force: true, no_cache: true })) {
  console.log(line.msg);
}
```

### Stop (Down)

```ts
for await (const line of project.down()) {
  console.log(line.msg);
}
```

### Build

```ts
for await (const line of project.build()) {
  console.log(line.msg);
}

// without cache
for await (const line of project.build({ no_cache: true })) {
  console.log(line.msg);
}
```

### Clean

```ts
await project.clean().drain();

// with target
await project.clean({ target: "containers" }).drain();
await project.clean({ target: "images" }).drain();
await project.clean({ target: "volumes" }).drain();
await project.clean({ target: "cache" }).drain();
await project.clean({ target: "builds" }).drain();
// "all" | "containers" | "images" | "volumes" | "cache" | "builds"
```

### Webhook Info

```ts
const info = await project.webhookInfo();
console.log(info.enabled, info.url, info.secret);
```

## Webhook

Trigger a webhook to redeploy a project. This endpoint does not require authentication.

```ts
const result = await client.webhook.trigger("mynetwork", {
  secret: "webhook-secret",
  force: true,    // optional
  no_cache: true, // optional
});

console.log(result.status, result.project);
```

## Console (WebSocket)

Attach to a running server's console via WebSocket for real-time terminal access.

```ts
const console = project.console({
  server: "lobby",
  cols: 120, // optional, default: 80, max: 500
  rows: 40,  // optional, default: 24, max: 200
});

// receive terminal output
console.onData((data) => process.stdout.write(data));

// send input
console.write(new TextEncoder().encode("help\n"));

// resize terminal
console.resize(200, 50);

// remove a specific listener
const handler = (data: Uint8Array) => process.stdout.write(data);
console.onData(handler);
console.offMessage(handler);

// remove all listeners
console.removeAllListeners();

// disconnect
console.close();
```

### OreSocket Events

`OreConsole` extends `OreSocket<ArrayBuffer>`. The base `OreSocket` provides:

```ts
socket.onMessage(callback);   socket.offMessage(callback);
socket.onClose(callback);     socket.offClose(callback);
socket.onError(callback);     socket.offError(callback);
socket.removeAllListeners();
socket.send(data);
socket.close();
```

## Streaming

All streaming methods (`up`, `down`, `build`, `clean`, `update`) return an `NdjsonStream<StreamLine>`.

### Iterate Lines

```ts
for await (const line of project.up()) {
  console.log(line.time, line.level, line.msg);
}
```

### Collect All Lines

```ts
const lines = await project.build().toArray();
```

### Consume Without Collecting

```ts
await project.down().drain();
```

## Error Handling

All errors extend `OreError`. HTTP errors are mapped to specific subclasses by status code.

```ts
import {
  OreError,
  OreApiError,
  OreAuthenticationError,
  OreNotFoundError,
  OreRateLimitError,
  OreStreamError,
  OreConnectionError,
} from "@oreforge/sdk";
```

| Class                    | Condition                               |
|--------------------------|-----------------------------------------|
| `OreAuthenticationError` | HTTP 401                                |
| `OreNotFoundError`       | HTTP 404                                |
| `OreRateLimitError`      | HTTP 429                                |
| `OreApiError`            | Any other HTTP error                    |
| `OreStreamError`         | Error within an NDJSON stream           |
| `OreConnectionError`     | Network failure or WebSocket disconnect |

```ts
try {
  await project.status();
} catch (error) {
  if (error instanceof OreNotFoundError) {
    console.error("Project not found");
  } else if (error instanceof OreAuthenticationError) {
    console.error("Invalid token");
  } else if (error instanceof OreApiError) {
    console.error(error.status, error.detail);
  } else if (error instanceof OreConnectionError) {
    console.error("Network error:", error.message);
  }
}
```

Stream errors are thrown during iteration:

```ts
try {
  for await (const line of project.build()) {
    console.log(line.msg);
  }
} catch (error) {
  if (error instanceof OreStreamError) {
    console.error("Build failed:", error.line.error);
  }
}
```

## Request Options

All methods accept an optional `RequestOptions` parameter for cancellation, timeouts, and custom headers.

### Abort Signal

```ts
const controller = new AbortController();

project.status({ signal: controller.signal });

controller.abort();
```

### Timeout

```ts
await project.status({ timeout: 5000 }); // 5 seconds
```

### Custom Headers

```ts
await project.status({ headers: { "X-Request-Id": "abc-123" } });
```