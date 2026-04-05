import type { RequestOptions } from "../types/requests";
import { OreApiError, OreConnectionError } from "./errors";

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const RETRYABLE_METHODS = new Set(["GET", "DELETE"]);

export interface HttpClientOptions {
	baseUrl: string;
	token?: string;
	maxRetries?: number;
}

export class HttpClient {
	private readonly baseUrl: string;
	private readonly token?: string;
	private readonly maxRetries: number;

	constructor(options: HttpClientOptions) {
		this.baseUrl = options.baseUrl.replace(/\/+$/, "");
		this.token = options.token;
		this.maxRetries = options.maxRetries ?? 2;
	}

	async get<T>(path: string, options?: RequestOptions): Promise<T> {
		return this.request<T>("GET", path, undefined, options);
	}

	async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
		return this.request<T>("POST", path, body, options);
	}

	async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
		return this.request<T>("PATCH", path, body, options);
	}

	async delete(path: string, options?: RequestOptions): Promise<void> {
		await this.request<void>("DELETE", path, undefined, options);
	}

	async stream(
		method: string,
		path: string,
		body?: unknown,
		options?: RequestOptions,
	): Promise<Response> {
		const url = `${this.baseUrl}${path}`;
		const headers = this.buildHeaders(options?.headers);

		if (body !== undefined) {
			headers.set("Content-Type", "application/json");
		}

		let response: Response;
		try {
			response = await fetch(url, {
				method,
				headers,
				body: body !== undefined ? JSON.stringify(toSnakeCase(body)) : undefined,
				signal: options?.signal,
			});
		} catch (error) {
			throw new OreConnectionError("Failed to connect", { cause: error });
		}

		if (!response.ok) {
			throw await this.parseError(response);
		}

		return response;
	}

	private async request<T>(
		method: string,
		path: string,
		body?: unknown,
		options?: RequestOptions,
	): Promise<T> {
		const url = `${this.baseUrl}${path}`;
		const canRetry = RETRYABLE_METHODS.has(method);
		const maxAttempts = canRetry ? this.maxRetries + 1 : 1;

		let lastError: Error | undefined;

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			if (attempt > 0) {
				await sleep(backoffDelay(attempt));
			}

			let response: Response;
			try {
				const headers = this.buildHeaders(options?.headers);

				if (body !== undefined) {
					headers.set("Content-Type", "application/json");
				}

				response = await fetch(url, {
					method,
					headers,
					body: body !== undefined ? JSON.stringify(toSnakeCase(body)) : undefined,
					signal: options?.signal,
				});
			} catch (error) {
				lastError = new OreConnectionError("Failed to connect", { cause: error });

				if (!canRetry) throw lastError;
				continue;
			}

			if (!response.ok) {
				const error = await this.parseError(response);

				if (canRetry && RETRYABLE_STATUS_CODES.has(response.status)) {
					lastError = error;
					continue;
				}

				throw error;
			}

			if (response.status === 204) {
				return undefined as T;
			}

			const json: unknown = await response.json();
			return toCamelCase(json) as T;
		}

		throw lastError;
	}

	private buildHeaders(extra?: Record<string, string>): Headers {
		const headers = new Headers(extra);

		if (this.token) {
			headers.set("Authorization", `Bearer ${this.token}`);
		}

		headers.set("Accept", "application/json");
		return headers;
	}

	private async parseError(response: Response): Promise<OreApiError> {
		try {
			const body = (await response.json()) as { status?: number; detail?: string };
			return new OreApiError(body.status ?? response.status, body.detail ?? response.statusText);
		} catch {
			return new OreApiError(response.status, response.statusText);
		}
	}
}

function backoffDelay(attempt: number): number {
	return Math.min(1000 * 2 ** (attempt - 1), 10_000);
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function toCamelCase(obj: unknown): unknown {
	if (Array.isArray(obj)) {
		return obj.map(toCamelCase);
	}

	if (obj !== null && typeof obj === "object") {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
				key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
				toCamelCase(value),
			]),
		);
	}

	return obj;
}

export function toSnakeCase(obj: unknown): unknown {
	if (Array.isArray(obj)) {
		return obj.map(toSnakeCase);
	}

	if (obj !== null && typeof obj === "object") {
		return Object.fromEntries(
			Object.entries(obj).map(([key, value]) => [
				key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`),
				toSnakeCase(value),
			]),
		);
	}

	return obj;
}
