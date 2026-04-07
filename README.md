# @oreforge/sdk

TypeScript SDK for the [ore](https://github.com/oreforge/ore) game server infrastructure platform.

## Installation

```bash
npm install @oreforge/sdk
# or
yarn add @oreforge/sdk
# or
pnpm add @oreforge/sdk
# or
bun add @oreforge/sdk
```

## Usage

```ts
import { OreClient } from "@oreforge/sdk";

const client = new OreClient({
  baseUrl: "http://localhost:8080",
  token: "your-api-token",
});
```

### Projects

```ts
const { projects } = await client.projects.list();

const project = await client.projects.add({ url: "https://github.com/org/network.git" });

await client.projects.remove("mynetwork");
```

### Operations

```ts
const project = client.projects.get("mynetwork");

const status = await project.status();

for await (const line of project.up({ force: true })) {
  console.log(line.msg);
}

for await (const line of project.build({ no_cache: true })) {
  console.log(line.msg);
}

await project.down().drain();

await project.prune({ target: "images" }).drain();

await project.clean({ target: "cache" }).drain();
```

### Update (git pull + redeploy)

```ts
for await (const line of client.projects.update("mynetwork")) {
  console.log(line.msg);
}
```

### Webhook

```ts
const info = await client.projects.get("mynetwork").webhookInfo();

const result = await client.webhook.trigger("mynetwork", {
  secret: info.secret!,
  force: true,
});
```

### Console (WebSocket)

```ts
const console = client.projects.get("mynetwork").console({
  server: "lobby",
  cols: 120,
  rows: 40,
});

console.onData((data) => process.stdout.write(data));
console.write(new TextEncoder().encode("help\n"));
console.resize(200, 50);
console.close();
```

### Error Handling

```ts
import { OreApiError, OreStreamError, OreConnectionError } from "@oreforge/sdk";

try {
  await client.projects.get("missing").status();
} catch (error) {
  if (error instanceof OreApiError) {
    console.error(error.status, error.detail);
  }
}
```