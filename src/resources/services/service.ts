import type { HttpClient } from "../../core/http";
import type { NdjsonStream } from "../../core/streaming";
import type { RequestOptions } from "../../types";
import type { ServiceStatusResponse } from "./types";

export class Service {
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
		return `/api/projects/${p}/services/${s}${endpoint}`;
	}

	async status(options?: RequestOptions): Promise<ServiceStatusResponse> {
		return this.http.get<ServiceStatusResponse>(this.path(""), options);
	}

	start(options?: RequestOptions): NdjsonStream {
		return this.http.stream("POST", this.path("/start"), undefined, options);
	}

	stop(options?: RequestOptions): NdjsonStream {
		return this.http.stream("POST", this.path("/stop"), undefined, options);
	}

	restart(options?: RequestOptions): NdjsonStream {
		return this.http.stream("POST", this.path("/restart"), undefined, options);
	}
}
