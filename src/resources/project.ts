import type { HttpClient } from "../core/http";
import { NdjsonStream } from "../core/streaming";
import type { Console } from "../core/websocket";
import type { NetworkStatus } from "../types/models";
import type {
	BuildRequest,
	CleanRequest,
	PruneRequest,
	RequestOptions,
	UpRequest,
} from "../types/requests";
import type { WebhookInfoResponse } from "../types/responses";
import type { ConsoleFactory, ConsoleOptions } from "../types/websocket";

export class Project {
	readonly name: string;
	private readonly http: HttpClient;
	private readonly createConsole: ConsoleFactory;

	constructor(name: string, http: HttpClient, createConsole: ConsoleFactory) {
		this.name = name;
		this.http = http;
		this.createConsole = createConsole;
	}

	async status(options?: RequestOptions): Promise<NetworkStatus> {
		return this.http.get<NetworkStatus>(
			`/api/projects/${encodeURIComponent(this.name)}/status`,
			options,
		);
	}

	up(request?: UpRequest, options?: RequestOptions): NdjsonStream {
		return new NdjsonStream(
			this.http.stream(
				"POST",
				`/api/projects/${encodeURIComponent(this.name)}/up`,
				request,
				options,
			),
		);
	}

	down(options?: RequestOptions): NdjsonStream {
		return new NdjsonStream(
			this.http.stream(
				"POST",
				`/api/projects/${encodeURIComponent(this.name)}/down`,
				undefined,
				options,
			),
		);
	}

	build(request?: BuildRequest, options?: RequestOptions): NdjsonStream {
		return new NdjsonStream(
			this.http.stream(
				"POST",
				`/api/projects/${encodeURIComponent(this.name)}/build`,
				request,
				options,
			),
		);
	}

	prune(request?: PruneRequest, options?: RequestOptions): NdjsonStream {
		return new NdjsonStream(
			this.http.stream(
				"POST",
				`/api/projects/${encodeURIComponent(this.name)}/prune`,
				request,
				options,
			),
		);
	}

	clean(request?: CleanRequest, options?: RequestOptions): NdjsonStream {
		return new NdjsonStream(
			this.http.stream(
				"POST",
				`/api/projects/${encodeURIComponent(this.name)}/clean`,
				request,
				options,
			),
		);
	}

	async webhookInfo(options?: RequestOptions): Promise<WebhookInfoResponse> {
		return this.http.get<WebhookInfoResponse>(
			`/api/projects/${encodeURIComponent(this.name)}/webhook`,
			options,
		);
	}

	console(options: ConsoleOptions): Console {
		return this.createConsole(this.name, options);
	}
}
