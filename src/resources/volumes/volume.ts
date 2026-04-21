import type { HttpClient } from "../../core/http";
import type { RequestOptions } from "../../types";
import type { OperationResponse } from "../operations/types";
import type { DeleteVolumeOptions, VolumeResponse } from "./types";

export class Volume {
	readonly project: string;
	readonly name: string;
	private readonly http: HttpClient;

	constructor(project: string, name: string, http: HttpClient) {
		this.project = project;
		this.name = name;
		this.http = http;
	}

	private path(endpoint: string): string {
		const p = encodeURIComponent(this.project);
		const v = encodeURIComponent(this.name);
		return `/api/projects/${p}/volumes/${v}${endpoint}`;
	}

	async get(options?: RequestOptions): Promise<VolumeResponse> {
		return this.http.get<VolumeResponse>(this.path(""), options);
	}

	async delete(opts?: DeleteVolumeOptions & RequestOptions): Promise<OperationResponse> {
		const params = new URLSearchParams();
		if (opts?.force) params.set("force", "true");
		const query = params.toString();
		const path = this.path("") + (query ? `?${query}` : "");
		return this.http.deleteJson<OperationResponse>(path, opts);
	}
}
