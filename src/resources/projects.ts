import type { HttpClient } from "../core/http";
import { NdjsonStream } from "../core/streaming";
import type { AddProjectRequest, RequestOptions } from "../types/requests";
import type { ProjectListResponse, ProjectResponse } from "../types/responses";
import { type ConsoleFactory, Project } from "./project";

export class Projects {
	private readonly http: HttpClient;
	private readonly createConsole: ConsoleFactory;

	constructor(http: HttpClient, createConsole: ConsoleFactory) {
		this.http = http;
		this.createConsole = createConsole;
	}

	async list(options?: RequestOptions): Promise<ProjectListResponse> {
		return this.http.get<ProjectListResponse>("/api/projects", options);
	}

	async add(request: AddProjectRequest, options?: RequestOptions): Promise<ProjectResponse> {
		return this.http.post<ProjectResponse>("/api/projects", request, options);
	}

	async remove(name: string, options?: RequestOptions): Promise<void> {
		return this.http.delete(`/api/projects/${encodeURIComponent(name)}`, options);
	}

	update(name: string, options?: RequestOptions): NdjsonStream {
		const response = this.http.stream(
			"POST",
			`/api/projects/${encodeURIComponent(name)}/update`,
			undefined,
			options,
		);
		return new NdjsonStream(response);
	}

	get(name: string): Project {
		return new Project(name, this.http, this.createConsole);
	}
}
