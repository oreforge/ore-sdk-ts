import {
	OreApiError,
	OreAuthenticationError,
	OreConnectionError,
	OreNotFoundError,
	OreRateLimitError,
} from "../errors";
import type { RequestOptions } from "../types";
import { NdjsonStream } from "./streaming";

type HttpMethod = "GET" | "POST" | "DELETE";

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const RETRYABLE_METHODS: Set<HttpMethod> = new Set(["GET", "DELETE"]);

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

	get base(): string {
		return this.baseUrl;
	}

	async get<T>(path: string, options?: RequestOptions): Promise<T> {
		return this.request<T>("GET", path, undefined, options);
	}

	async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
		return this.request<T>("POST", path, body, options);
	}

	async postNoAuth<T>(path: string, options?: RequestOptions): Promise<T> {
		return this.request<T>("POST", path, undefined, options, { skipAuth: true });
	}

	async delete(path: string, options?: RequestOptions): Promise<void> {
		await this.request<void>("DELETE", path, undefined, options);
	}

	stream(method: HttpMethod, path: string, body?: unknown, options?: RequestOptions): NdjsonStream {
		const response = this.fetchStream(method, path, body, options);
		return new NdjsonStream(response);
	}

	private async fetchStream(
		method: HttpMethod,
		path: string,
		body?: unknown,
		options?: RequestOptions,
	): Promise<Response> {
		const init = this.buildFetchInit(method, body, options);
		(init.headers as Headers).set("Accept", "application/x-ndjson");

		let response: Response;
		try {
			response = await fetch(`${this.baseUrl}${path}`, init);
		} catch (error) {
			throw new OreConnectionError("Failed to connect", { cause: error });
		}

		if (!response.ok) {
			throw await this.parseError(response);
		}

		return response;
	}

	private async request<T>(
		method: HttpMethod,
		path: string,
		body?: unknown,
		options?: RequestOptions,
		internal?: { skipAuth?: boolean },
	): Promise<T> {
		const url = `${this.baseUrl}${path}`;
		const canRetry = RETRYABLE_METHODS.has(method);
		const maxAttempts = canRetry ? this.maxRetries + 1 : 1;

		let lastError: Error = new OreConnectionError("Request failed");

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			if (attempt > 0) {
				await sleep(backoffDelay(attempt));
			}

			let response: Response;
			try {
				response = await fetch(url, this.buildFetchInit(method, body, options, internal));
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

			return (await response.json()) as T;
		}

		throw lastError;
	}

	private buildFetchInit(
		method: HttpMethod,
		body?: unknown,
		options?: RequestOptions,
		internal?: { skipAuth?: boolean },
	): RequestInit {
		const headers = new Headers(options?.headers);

		if (!internal?.skipAuth && this.token) {
			headers.set("Authorization", `Bearer ${this.token}`);
		}

		headers.set("Accept", "application/json");
		headers.set("User-Agent", "@oreforge/sdk");

		if (body !== undefined) {
			headers.set("Content-Type", "application/json");
		}

		const signal =
			options?.signal ?? (options?.timeout ? AbortSignal.timeout(options.timeout) : undefined);

		return {
			method,
			headers,
			body: body !== undefined ? JSON.stringify(body) : undefined,
			signal,
		};
	}

	private async parseError(response: Response): Promise<OreApiError> {
		let detail: unknown;
		try {
			const body = (await response.json()) as { detail?: unknown };
			detail = body.detail ?? response.statusText;
		} catch {
			detail = response.statusText;
		}

		switch (response.status) {
			case 401:
				return new OreAuthenticationError(detail);
			case 404:
				return new OreNotFoundError(detail);
			case 429:
				return new OreRateLimitError(detail);
			default:
				return new OreApiError(response.status, detail);
		}
	}
}

function backoffDelay(attempt: number): number {
	return Math.min(1000 * 2 ** (attempt - 1), 10_000);
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
