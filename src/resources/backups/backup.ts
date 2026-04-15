import type { HttpClient } from "../../core/http";
import type { RequestOptions } from "../../types";
import type { OperationResponse } from "../operations/types";
import type { BackupResponse, RestoreBackupOptions } from "./types";

export class Backup {
	readonly project: string;
	readonly id: string;
	private readonly http: HttpClient;

	constructor(project: string, id: string, http: HttpClient) {
		this.project = project;
		this.id = id;
		this.http = http;
	}

	private path(endpoint: string): string {
		const p = encodeURIComponent(this.project);
		const i = encodeURIComponent(this.id);
		return `/api/projects/${p}/backups/${i}${endpoint}`;
	}

	async get(options?: RequestOptions): Promise<BackupResponse> {
		return this.http.get<BackupResponse>(this.path(""), options);
	}

	async delete(options?: RequestOptions): Promise<void> {
		return this.http.delete(this.path(""), options);
	}

	async restore(opts?: RestoreBackupOptions & RequestOptions): Promise<OperationResponse> {
		const params = new URLSearchParams();
		if (opts?.keep_pre_restore) params.set("keep_pre_restore", "true");
		const query = params.toString();
		const path = this.path("/restore") + (query ? `?${query}` : "");
		return this.http.post<OperationResponse>(path, undefined, opts);
	}

	async verify(options?: RequestOptions): Promise<OperationResponse> {
		return this.http.post<OperationResponse>(this.path("/verify"), undefined, options);
	}
}
