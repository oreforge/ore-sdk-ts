import type { HttpClient } from "../../core/http";
import type { OreConsole } from "../../core/websocket";
import type { RequestOptions } from "../../types";
import type { OperationResponse } from "../operations/types";
import { Servers } from "../servers";
import { Services } from "../services";
import { Volumes } from "../volumes";
import type {
	BuildRequest,
	BuildsResponse,
	CleanRequest,
	ConsoleOptions,
	NetworkStatus,
	ProjectDetailResponse,
	UpRequest,
	WebhookInfoResponse,
} from "./types";

export type ConsoleFactory = (name: string, options: ConsoleOptions) => OreConsole;

export class Project {
	readonly name: string;
	readonly servers: Servers;
	readonly services: Services;
	readonly volumes: Volumes;
	private readonly http: HttpClient;
	private readonly createConsole: ConsoleFactory;

	constructor(name: string, http: HttpClient, createConsole: ConsoleFactory) {
		this.name = name;
		this.http = http;
		this.createConsole = createConsole;
		this.servers = new Servers(name, http);
		this.services = new Services(name, http);
		this.volumes = new Volumes(name, http);
	}

	private path(endpoint: string): string {
		return `/api/projects/${encodeURIComponent(this.name)}${endpoint}`;
	}

	get iconUrl(): string {
		return `${this.http.base}/api/projects/${encodeURIComponent(this.name)}/icon`;
	}

	async detail(options?: RequestOptions): Promise<ProjectDetailResponse> {
		return this.http.get<ProjectDetailResponse>(
			`/api/projects/${encodeURIComponent(this.name)}`,
			options,
		);
	}

	async status(options?: RequestOptions): Promise<NetworkStatus> {
		return this.http.get<NetworkStatus>(this.path("/status"), options);
	}

	async builds(options?: RequestOptions): Promise<BuildsResponse> {
		return this.http.get<BuildsResponse>(this.path("/builds"), options);
	}

	async up(request?: UpRequest, options?: RequestOptions): Promise<OperationResponse> {
		return this.http.post<OperationResponse>(this.path("/up"), request, options);
	}

	async down(options?: RequestOptions): Promise<OperationResponse> {
		return this.http.post<OperationResponse>(this.path("/down"), undefined, options);
	}

	async build(request?: BuildRequest, options?: RequestOptions): Promise<OperationResponse> {
		return this.http.post<OperationResponse>(this.path("/build"), request, options);
	}

	async clean(request?: CleanRequest, options?: RequestOptions): Promise<OperationResponse> {
		return this.http.post<OperationResponse>(this.path("/clean"), request, options);
	}

	async webhookInfo(options?: RequestOptions): Promise<WebhookInfoResponse> {
		return this.http.get<WebhookInfoResponse>(this.path("/webhook"), options);
	}

	console(options: ConsoleOptions): OreConsole {
		return this.createConsole(this.name, options);
	}
}
