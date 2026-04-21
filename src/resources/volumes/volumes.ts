import type { HttpClient } from "../../core/http";
import type { RequestOptions } from "../../types";
import type { BatchResponse, BatchVolumeDeleteOptions } from "../batch/types";
import type { OperationResponse } from "../operations/types";
import type { PruneOptions, PruneReport, VolumeListResponse } from "./types";
import { Volume } from "./volume";

type BatchDeleteSync = BatchVolumeDeleteOptions & RequestOptions & { sync: true };
type BatchDeleteAsync = BatchVolumeDeleteOptions & RequestOptions & { sync?: false };

export class Volumes {
	private readonly project: string;
	private readonly http: HttpClient;

	constructor(project: string, http: HttpClient) {
		this.project = project;
		this.http = http;
	}

	private base(): string {
		return `/api/projects/${encodeURIComponent(this.project)}/volumes`;
	}

	async list(options?: RequestOptions): Promise<VolumeListResponse> {
		return this.http.get<VolumeListResponse>(this.base(), options);
	}

	async prune(opts?: PruneOptions & RequestOptions): Promise<PruneReport> {
		const params = new URLSearchParams();
		if (opts?.dry_run) params.set("dry_run", "true");
		const query = params.toString();
		const path = `${this.base()}/prune${query ? `?${query}` : ""}`;
		return this.http.post<PruneReport>(path, undefined, opts);
	}

	batchDelete(targets: string[], opts: BatchDeleteSync): Promise<BatchResponse>;
	batchDelete(targets: string[], opts?: BatchDeleteAsync): Promise<OperationResponse>;
	batchDelete(
		targets: string[],
		opts?: BatchVolumeDeleteOptions & RequestOptions,
	): Promise<BatchResponse | OperationResponse> {
		const { sync, force, ...rest } = opts ?? {};
		const body: Record<string, unknown> = { targets };
		if (force) body.force = true;
		const query = sync ? "" : "?async=true";
		return this.http.post<BatchResponse | OperationResponse>(
			`${this.base()}:batchDelete${query}`,
			body,
			rest,
		);
	}

	get(name: string): Volume {
		return new Volume(this.project, name, this.http);
	}
}
