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
  baseUrl: "http://localhost:9090",
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

### Project Detail

Returns the full project specification, deploy state, and gitops configuration.

```ts
const detail = await project.detail();

console.log(detail.spec.network);
console.log(detail.spec.servers);        // server specs (software, memory, ports, etc.)
console.log(detail.spec.services);       // service specs (image, ports, env, etc.)
console.log(detail.spec.icon);           // optional icon path (e.g. "logo.png")
console.log(detail.spec.gitops);         // polling and webhook config
console.log(detail.state.servers);       // deployed image tags and config hashes
```

### Project Icon

Get the URL to the project's icon image for use in `<img>` tags.

```ts
const url = project.iconUrl; // full URL to GET /api/projects/{name}/icon

// use in frontend
<img src={project.iconUrl} alt={project.name} />

// check if icon is configured
const detail = await project.detail();
if (detail.spec.icon) {
  console.log("Icon available at:", project.iconUrl);
}
```

### Build History

Returns cached binaries and build artifacts with timing information.

```ts
const { builds, binaries } = await project.builds();

for (const [key, entry] of Object.entries(builds)) {
  console.log(entry.server_name, entry.image_tag, entry.duration_ms + "ms");
}
```

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

## Servers

Manage individual game servers within a project.

### List Servers

```ts
const { servers, services } = await project.servers.list();

for (const server of servers) {
  console.log(server.name, server.container.state);
}
```

### Get Server Status

```ts
const lobby = project.servers.get("lobby");
const status = await lobby.status();

console.log(status.name, status.container.state, status.container.health);
```

### Start a Server

```ts
for await (const line of lobby.start()) {
  console.log(line.msg);
}
```

### Stop a Server

```ts
await lobby.stop().drain();
```

### Restart a Server

```ts
for await (const line of lobby.restart()) {
  console.log(line.msg);
}
```

## Services

Manage external services (databases, caches, etc.) within a project.

### List Services

```ts
const { services } = await project.services.list();

for (const svc of services) {
  console.log(svc.name, svc.container.state);
}
```

### Get Service Status

```ts
const db = project.services.get("database");
const status = await db.status();

console.log(status.name, status.container.state, status.container.health);
```

### Start a Service

```ts
for await (const line of db.start()) {
  console.log(line.msg);
}
```

### Stop a Service

```ts
await db.stop().drain();
```

### Restart a Service

```ts
for await (const line of db.restart()) {
  console.log(line.msg);
}
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

All streaming methods (`up`, `down`, `build`, `clean`, `update`, and per-server/service `start`, `stop`, `restart`) return an `NdjsonStream<StreamLine>`.

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