import { OreConnectionError } from "../errors";

export interface OreSocketOptions {
	binaryType?: BinaryType;
}

export class OreSocket<T = unknown> {
	protected readonly ws: WebSocket;
	private readonly messageCallbacks: Array<(data: T) => void> = [];
	private readonly closeCallbacks: Array<() => void> = [];
	private readonly errorCallbacks: Array<(error: Error) => void> = [];

	constructor(url: string, options?: OreSocketOptions) {
		this.ws = new WebSocket(url);

		if (options?.binaryType) {
			this.ws.binaryType = options.binaryType;
		}

		this.ws.addEventListener("message", (event: MessageEvent) => {
			for (const cb of this.messageCallbacks) {
				cb(event.data as T);
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

	onMessage(callback: (data: T) => void): void {
		this.messageCallbacks.push(callback);
	}

	offMessage(callback: (data: T) => void): void {
		removeFrom(this.messageCallbacks, callback);
	}

	onClose(callback: () => void): void {
		this.closeCallbacks.push(callback);
	}

	offClose(callback: () => void): void {
		removeFrom(this.closeCallbacks, callback);
	}

	onError(callback: (error: Error) => void): void {
		this.errorCallbacks.push(callback);
	}

	offError(callback: (error: Error) => void): void {
		removeFrom(this.errorCallbacks, callback);
	}

	removeAllListeners(): void {
		this.messageCallbacks.length = 0;
		this.closeCallbacks.length = 0;
		this.errorCallbacks.length = 0;
	}

	send(data: string | ArrayBuffer | Uint8Array<ArrayBuffer>): void {
		if (this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(data);
		}
	}

	close(): void {
		this.ws.close();
	}
}

function removeFrom<T>(array: T[], item: T): void {
	const index = array.indexOf(item);
	if (index !== -1) {
		array.splice(index, 1);
	}
}

const DEFAULT_COLS = 80;
const DEFAULT_ROWS = 24;
const MAX_COLS = 500;
const MAX_ROWS = 200;

function clampDim(value: number | undefined, max: number): number {
	if (value === undefined || !Number.isFinite(value) || value < 1) return 1;
	return Math.min(Math.floor(value), max);
}

export class OreConsole extends OreSocket<ArrayBuffer> {
	constructor(url: string) {
		super(url, { binaryType: "arraybuffer" });
	}

	onData(callback: (data: Uint8Array) => void): void {
		this.onMessage((data) => {
			callback(new Uint8Array(data));
		});
	}

	write(data: Uint8Array<ArrayBuffer>): void {
		this.send(data);
	}

	resize(cols: number, rows: number): void {
		this.send(
			JSON.stringify({
				width: clampDim(cols, MAX_COLS),
				height: clampDim(rows, MAX_ROWS),
			}),
		);
	}
}

export function buildConsoleUrl(
	baseUrl: string,
	name: string,
	server: string,
	cols?: number,
	rows?: number,
	token?: string,
): string {
	const wsBase = baseUrl.replace(/^http/, "ws");
	const url = new URL(`${wsBase}/api/projects/${encodeURIComponent(name)}/console`);
	url.searchParams.set("server", server);
	url.searchParams.set("cols", String(clampDim(cols ?? DEFAULT_COLS, MAX_COLS)));
	url.searchParams.set("rows", String(clampDim(rows ?? DEFAULT_ROWS, MAX_ROWS)));
	if (token) {
		url.searchParams.set("token", token);
	}
	return url.toString();
}
