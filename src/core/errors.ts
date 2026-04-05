import type { StreamLine } from "../types/models";

export class OreError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "OreError";
	}
}

export class OreApiError extends OreError {
	readonly status: number;
	readonly detail: string;

	constructor(status: number, detail: string) {
		super(`HTTP ${status}: ${detail}`);
		this.name = "OreApiError";
		this.status = status;
		this.detail = detail;
	}
}

export class OreStreamError extends OreError {
	readonly line: StreamLine;

	constructor(line: StreamLine) {
		super(`Stream error: ${line.error}`);
		this.name = "OreStreamError";
		this.line = line;
	}
}

export class OreConnectionError extends OreError {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "OreConnectionError";
	}
}
