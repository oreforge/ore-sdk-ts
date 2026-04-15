import type { HttpClient } from "../../core/http";
import type { RequestOptions } from "../../types";
import type { PruneOptions, PruneReport, VolumeListResponse } from "./types";
import { Volume } from "./volume";

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

	get(name: string): Volume {
		return new Volume(this.project, name, this.http);
	}
}
