import type { HttpClient } from "../../core/http";
import type { RequestOptions } from "../../types";
import type { OperationResponse } from "../operations/types";
import type { ConsoleFactory } from "./project";
import { Project } from "./project";
import type { AddProjectRequest, ProjectListResponse, ProjectResponse } from "./types";

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

	async update(name: string, options?: RequestOptions): Promise<OperationResponse> {
		return this.http.post<OperationResponse>(
			`/api/projects/${encodeURIComponent(name)}/update`,
			undefined,
			options,
		);
	}

	get(name: string): Project {
		return new Project(name, this.http, this.createConsole);
	}
}

export { Project } from "./project";
