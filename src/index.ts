export { OreClient, type OreClientOptions } from "./client";

export { OreApiError, OreConnectionError, OreError, OreStreamError } from "./core/errors";
export { NdjsonStream } from "./core/streaming";
export { Console, OreSocket } from "./core/websocket";

export { Project } from "./resources/project";
export { Projects } from "./resources/projects";
export { Webhook } from "./resources/webhook";

export type {
	ContainerState,
	ContainerStatus,
	CPUStatus,
	HealthState,
	MemoryStatus,
	NetworkStatus,
	PortBinding,
	ResourceStatus,
	ServerStatus,
	StreamLine,
} from "./types/models";
export type {
	AddProjectRequest,
	BuildRequest,
	CleanRequest,
	PruneRequest,
	RequestOptions,
	UpRequest,
	WebhookTriggerRequest,
} from "./types/requests";
export type {
	ProjectListResponse,
	ProjectResponse,
	WebhookInfoResponse,
	WebhookResponse,
} from "./types/responses";
export type { ConsoleFactory, ConsoleOptions } from "./types/websocket";
