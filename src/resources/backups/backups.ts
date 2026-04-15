import type { HttpClient } from "../../core/http";
import type { RequestOptions } from "../../types";
import type { OperationResponse } from "../operations/types";
import { Backup } from "./backup";
import type { BackupListOptions, BackupListResponse, CreateBackupRequest } from "./types";

export class Backups {
	private readonly project: string;
	private readonly http: HttpClient;

	constructor(project: string, http: HttpClient) {
		this.project = project;
		this.http = http;
	}

	private base(): string {
		return `/api/projects/${encodeURIComponent(this.project)}/backups`;
	}

	async list(filter?: BackupListOptions, options?: RequestOptions): Promise<BackupListResponse> {
		const params = new URLSearchParams();
		if (filter?.volume) params.set("volume", filter.volume);
		if (filter?.status) params.set("status", filter.status);
		const query = params.toString();
		const path = `${this.base()}${query ? `?${query}` : ""}`;
		return this.http.get<BackupListResponse>(path, options);
	}

	async create(request: CreateBackupRequest, options?: RequestOptions): Promise<OperationResponse> {
		return this.http.post<OperationResponse>(this.base(), request, options);
	}

	get(id: string): Backup {
		return new Backup(this.project, id, this.http);
	}
}
