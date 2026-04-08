import type { HttpClient } from "../../core/http";
import type { RequestOptions } from "../../types";
import { Server } from "./server";
import type { ServerListResponse } from "./types";

export class Servers {
	private readonly project: string;
	private readonly http: HttpClient;

	constructor(project: string, http: HttpClient) {
		this.project = project;
		this.http = http;
	}

	async list(options?: RequestOptions): Promise<ServerListResponse> {
		const p = encodeURIComponent(this.project);
		return this.http.get<ServerListResponse>(`/api/projects/${p}/servers`, options);
	}

	get(name: string): Server {
		return new Server(this.project, name, this.http);
	}
}

export { Server } from "./server";
