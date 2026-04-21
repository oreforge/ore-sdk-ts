import type { HttpClient } from "../../core/http";
import type { RequestOptions } from "../../types";
import type { BatchOptions, BatchResponse } from "../batch/types";
import type { OperationResponse } from "../operations/types";
import { Server } from "./server";
import type { ServerListResponse } from "./types";

type BatchSync = BatchOptions & RequestOptions & { sync: true };
type BatchAsync = BatchOptions & RequestOptions & { sync?: false };

export class Servers {
	private readonly project: string;
	private readonly http: HttpClient;

	constructor(project: string, http: HttpClient) {
		this.project = project;
		this.http = http;
	}

	private base(): string {
		return `/api/projects/${encodeURIComponent(this.project)}/servers`;
	}

	async list(options?: RequestOptions): Promise<ServerListResponse> {
		return this.http.get<ServerListResponse>(this.base(), options);
	}

	get(name: string): Server {
		return new Server(this.project, name, this.http);
	}

	batchStart(targets: string[], opts: BatchSync): Promise<BatchResponse>;
	batchStart(targets: string[], opts?: BatchAsync): Promise<OperationResponse>;
	batchStart(targets: string[], opts?: BatchOptions & RequestOptions) {
		return this.sendBatch(":batchStart", { targets }, opts);
	}

	batchStop(targets: string[], opts: BatchSync): Promise<BatchResponse>;
	batchStop(targets: string[], opts?: BatchAsync): Promise<OperationResponse>;
	batchStop(targets: string[], opts?: BatchOptions & RequestOptions) {
		return this.sendBatch(":batchStop", { targets }, opts);
	}

	batchRestart(targets: string[], opts: BatchSync): Promise<BatchResponse>;
	batchRestart(targets: string[], opts?: BatchAsync): Promise<OperationResponse>;
	batchRestart(targets: string[], opts?: BatchOptions & RequestOptions) {
		return this.sendBatch(":batchRestart", { targets }, opts);
	}

	private sendBatch(
		suffix: string,
		body: Record<string, unknown>,
		opts?: BatchOptions & RequestOptions,
	): Promise<BatchResponse | OperationResponse> {
		const { sync, ...rest } = opts ?? {};
		const query = sync ? "" : "?async=true";
		return this.http.post<BatchResponse | OperationResponse>(
			`${this.base()}${suffix}${query}`,
			body,
			rest,
		);
	}
}

export { Server } from "./server";
