import type { HttpClient } from "../../core/http";
import type { RequestOptions } from "../../types";
import { Service } from "./service";
import type { ServiceListResponse } from "./types";

export class Services {
	private readonly project: string;
	private readonly http: HttpClient;

	constructor(project: string, http: HttpClient) {
		this.project = project;
		this.http = http;
	}

	async list(options?: RequestOptions): Promise<ServiceListResponse> {
		const p = encodeURIComponent(this.project);
		return this.http.get<ServiceListResponse>(`/api/projects/${p}/services`, options);
	}

	get(name: string): Service {
		return new Service(this.project, name, this.http);
	}
}

export { Service } from "./service";
