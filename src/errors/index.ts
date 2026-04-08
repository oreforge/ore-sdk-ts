import type { StreamLine } from "../types";

export class OreError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = "OreError";
	}
}

export class OreApiError extends OreError {
	readonly status: number;
	readonly detail: unknown;

	constructor(status: number, detail: unknown) {
		super(`HTTP ${status}: ${String(detail)}`);
		this.name = "OreApiError";
		this.status = status;
		this.detail = detail;
	}
}

export class OreAuthenticationError extends OreApiError {
	constructor(detail: unknown) {
		super(401, detail);
		this.name = "OreAuthenticationError";
	}
}

export class OreNotFoundError extends OreApiError {
	constructor(detail: unknown) {
		super(404, detail);
		this.name = "OreNotFoundError";
	}
}

export class OreRateLimitError extends OreApiError {
	constructor(detail: unknown) {
		super(429, detail);
		this.name = "OreRateLimitError";
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
