import type { HttpClient } from "../../core/http";
import type { RequestOptions } from "../../types";
import type { OperationResponse } from "../operations/types";
import type { ServerStatusResponse } from "./types";

export class Server {
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
		const s = encodeURIComponent(this.name);
		return `/api/projects/${p}/servers/${s}${endpoint}`;
	}

	async status(options?: RequestOptions): Promise<ServerStatusResponse> {
		return this.http.get<ServerStatusResponse>(this.path(""), options);
	}

	async start(options?: RequestOptions): Promise<OperationResponse> {
		return this.http.post<OperationResponse>(this.path("/start"), undefined, options);
	}

	async stop(options?: RequestOptions): Promise<OperationResponse> {
		return this.http.post<OperationResponse>(this.path("/stop"), undefined, options);
	}

	async restart(options?: RequestOptions): Promise<OperationResponse> {
		return this.http.post<OperationResponse>(this.path("/restart"), undefined, options);
	}
}
