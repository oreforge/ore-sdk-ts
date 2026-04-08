import type { HttpClient } from "../../core/http";
import type { NdjsonStream } from "../../core/streaming";
import type { OreConsole } from "../../core/websocket";
import type { RequestOptions } from "../../types";
import type {
	BuildRequest,
	CleanRequest,
	ConsoleOptions,
	NetworkStatus,
	PruneRequest,
	UpRequest,
	WebhookInfoResponse,
} from "./types";

export type ConsoleFactory = (name: string, options: ConsoleOptions) => OreConsole;

export class Project {
	readonly name: string;
	private readonly http: HttpClient;
	private readonly createConsole: ConsoleFactory;

	constructor(name: string, http: HttpClient, createConsole: ConsoleFactory) {
		this.name = name;
		this.http = http;
		this.createConsole = createConsole;
	}

	private path(endpoint: string): string {
		return `/api/projects/${encodeURIComponent(this.name)}${endpoint}`;
	}

	async status(options?: RequestOptions): Promise<NetworkStatus> {
		return this.http.get<NetworkStatus>(this.path("/status"), options);
	}

	up(request?: UpRequest, options?: RequestOptions): NdjsonStream {
		return this.http.stream("POST", this.path("/up"), request, options);
	}

	down(options?: RequestOptions): NdjsonStream {
		return this.http.stream("POST", this.path("/down"), undefined, options);
	}

	build(request?: BuildRequest, options?: RequestOptions): NdjsonStream {
		return this.http.stream("POST", this.path("/build"), request, options);
	}

	prune(request?: PruneRequest, options?: RequestOptions): NdjsonStream {
		return this.http.stream("POST", this.path("/prune"), request, options);
	}

	clean(request?: CleanRequest, options?: RequestOptions): NdjsonStream {
		return this.http.stream("POST", this.path("/clean"), request, options);
	}

	async webhookInfo(options?: RequestOptions): Promise<WebhookInfoResponse> {
		return this.http.get<WebhookInfoResponse>(this.path("/webhook"), options);
	}

	console(options: ConsoleOptions): OreConsole {
		return this.createConsole(this.name, options);
	}
}
