import type { HttpClient } from "../../core/http";
import type { NdjsonStream } from "../../core/streaming";
import type { RequestOptions } from "../../types";
import type { OperationResponse } from "./types";

export class Operation {
	readonly id: string;
	private readonly http: HttpClient;

	constructor(id: string, http: HttpClient) {
		this.id = id;
		this.http = http;
	}

	private path(endpoint = ""): string {
		return `/api/operations/${encodeURIComponent(this.id)}${endpoint}`;
	}

	async get(options?: RequestOptions): Promise<OperationResponse> {
		return this.http.get<OperationResponse>(this.path(), options);
	}

	logs(cursor?: number, options?: RequestOptions): NdjsonStream {
		const params = cursor !== undefined ? `?cursor=${cursor}` : "";
		return this.http.stream("GET", this.path(`/logs${params}`), undefined, options);
	}

	async cancel(options?: RequestOptions): Promise<void> {
		await this.http.post<void>(this.path("/cancel"), undefined, options);
	}

	async wait(options?: RequestOptions & { pollInterval?: number }): Promise<OperationResponse> {
		const interval = options?.pollInterval ?? 1000;
		for (;;) {
			const op = await this.get(options);
			if (op.status === "completed" || op.status === "failed" || op.status === "cancelled") {
				return op;
			}
			await new Promise((resolve) => setTimeout(resolve, interval));
		}
	}
}
