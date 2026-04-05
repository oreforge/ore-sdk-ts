import { OreConnectionError } from "./errors";

export interface ConsoleEvents {
	onData(callback: (data: Uint8Array) => void): void;
	onClose(callback: () => void): void;
	onError(callback: (error: Error) => void): void;
}

export class Console implements ConsoleEvents {
	private ws: WebSocket;
	private dataCallbacks: Array<(data: Uint8Array) => void> = [];
	private closeCallbacks: Array<() => void> = [];
	private errorCallbacks: Array<(error: Error) => void> = [];

	constructor(url: string, cols: number, rows: number) {
		this.ws = new WebSocket(url);
		this.ws.binaryType = "arraybuffer";

		this.ws.addEventListener("open", () => {
			this.ws.send(JSON.stringify({ width: cols, height: rows }));
		});

		this.ws.addEventListener("message", (event: MessageEvent) => {
			if (event.data instanceof ArrayBuffer) {
				const data = new Uint8Array(event.data);
				for (const cb of this.dataCallbacks) {
					cb(data);
				}
			}
		});

		this.ws.addEventListener("close", () => {
			for (const cb of this.closeCallbacks) {
				cb();
			}
		});

		this.ws.addEventListener("error", () => {
			const error = new OreConnectionError("WebSocket connection failed");
			for (const cb of this.errorCallbacks) {
				cb(error);
			}
		});
	}

	onData(callback: (data: Uint8Array) => void): void {
		this.dataCallbacks.push(callback);
	}

	onClose(callback: () => void): void {
		this.closeCallbacks.push(callback);
	}

	onError(callback: (error: Error) => void): void {
		this.errorCallbacks.push(callback);
	}

	write(data: Uint8Array<ArrayBuffer>): void {
		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(data);
		}
	}

	resize(cols: number, rows: number): void {
		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(JSON.stringify({ width: cols, height: rows }));
		}
	}

	close(): void {
		this.ws.close();
	}
}

export function buildConsoleUrl(
	baseUrl: string,
	token: string | undefined,
	name: string,
	server: string,
): string {
	const wsBase = baseUrl.replace(/^http/, "ws");
	const url = new URL(`${wsBase}/api/projects/${encodeURIComponent(name)}/console`);
	url.searchParams.set("server", server);

	if (token) {
		url.searchParams.set("token", token);
	}

	return url.toString();
}
