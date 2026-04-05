import type { HttpClient } from "../core/http";
import { NdjsonStream } from "../core/streaming";
import type { Console } from "../core/websocket";
import type { NetworkStatus } from "../types/models";
import type {
	BuildRequest,
	CleanRequest,
	ConsoleOptions,
	PruneRequest,
	RequestOptions,
	UpRequest,
} from "../types/requests";

export type ConsoleFactory = (name: string, options: ConsoleOptions) => Console;

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
		const response = this.http.stream(
			"POST",
			`/api/projects/${encodeURIComponent(this.name)}/up`,
			request,
			options,
		);
		return new NdjsonStream(response);
	}

	down(options?: RequestOptions): NdjsonStream {
		const response = this.http.stream(
			"POST",
			`/api/projects/${encodeURIComponent(this.name)}/down`,
			undefined,
			options,
		);
		return new NdjsonStream(response);
	}

	build(request?: BuildRequest, options?: RequestOptions): NdjsonStream {
		const response = this.http.stream(
			"POST",
			`/api/projects/${encodeURIComponent(this.name)}/build`,
			request,
			options,
		);
		return new NdjsonStream(response);
	}

	prune(request?: PruneRequest, options?: RequestOptions): NdjsonStream {
		const response = this.http.stream(
			"POST",
			`/api/projects/${encodeURIComponent(this.name)}/prune`,
			request,
			options,
		);
		return new NdjsonStream(response);
	}

	clean(request?: CleanRequest, options?: RequestOptions): NdjsonStream {
		const response = this.http.stream(
			"POST",
			`/api/projects/${encodeURIComponent(this.name)}/clean`,
			request,
			options,
		);
		return new NdjsonStream(response);
	}

	console(options: ConsoleOptions): Console {
		return this.createConsole(this.name, options);
	}
}
