export { OreClient, type OreClientOptions } from "./client";

export {
	OreError,
	OreApiError,
	OreStreamError,
	OreConnectionError,
} from "./core/errors";

export { NdjsonStream } from "./core/streaming";

export { Console } from "./core/websocket";

export type {
	ContainerState,
	HealthState,
	PortBinding,
	ContainerStatus,
	ServerStatus,
	NetworkStatus,
	StreamLine,
} from "./types/models";

export type {
	AddProjectRequest,
	UpRequest,
	BuildRequest,
	PruneRequest,
	CleanRequest,
	ConsoleOptions,
	RequestOptions,
} from "./types/requests";

export type { ProjectListResponse, ProjectResponse } from "./types/responses";

export { Projects } from "./resources/projects";
export { Project } from "./resources/project";
