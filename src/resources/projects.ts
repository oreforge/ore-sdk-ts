import { OreApiError } from "../core/errors";
import type { HttpClient } from "../core/http";
import { NdjsonStream } from "../core/streaming";
import type { AddProjectRequest, RequestOptions, WebhookTriggerRequest } from "../types/requests";
import type { ProjectListResponse, ProjectResponse, WebhookResponse } from "../types/responses";
import type { ConsoleFactory } from "../types/websocket";
import { Project } from "./project";

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
		return new NdjsonStream(
			this.http.stream(
				"POST",
				`/api/projects/${encodeURIComponent(name)}/update`,
				undefined,
				options,
			),
		);
	}

	async triggerWebhook(
		name: string,
		request: WebhookTriggerRequest,
		options?: RequestOptions,
	): Promise<WebhookResponse> {
		const params = new URLSearchParams({ secret: request.secret });
		if (request.force) params.set("force", "true");
		if (request.no_cache) params.set("no_cache", "true");

		const url = `${this.http.url}/webhook/${encodeURIComponent(name)}?${params}`;

		let response: Response;
		try {
			response = await fetch(url, {
				method: "POST",
				signal: options?.signal,
				headers: options?.headers,
			});
		} catch (error) {
			throw new OreApiError(0, `webhook request failed: ${error}`);
		}

		if (!response.ok) {
			const body = (await response.json().catch(() => ({}))) as {
				status?: number;
				detail?: string;
			};
			throw new OreApiError(body.status ?? response.status, body.detail ?? response.statusText);
		}

		return (await response.json()) as WebhookResponse;
	}

	get(name: string): Project {
		return new Project(name, this.http, this.createConsole);
	}
}
