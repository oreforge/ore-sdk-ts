export type ContainerState = "not found" | "created" | "running" | "exited" | "paused" | "dead";

export type HealthState = "\u2014" | "starting" | "healthy" | "unhealthy";

export interface PortBinding {
	host_port: number;
	container_port: number;
	protocol: string;
}

export interface MemoryStatus {
	used_bytes: number;
	limit_bytes: number;
	percent: number;
}

export interface CPUStatus {
	limit: number;
	percent: number;
}

export interface ResourceStatus {
	memory: MemoryStatus;
	cpu: CPUStatus;
}

export interface ContainerStatus {
	name: string;
	state: ContainerState;
	health: HealthState;
	image: string;
	ports?: PortBinding[];
	started_at?: string;
	uptime?: number;
	restart_count: number;
	exit_code: number;
	resources: ResourceStatus;
}

export interface ServerStatus {
	name: string;
	container: ContainerStatus;
}

export interface NetworkStatus {
	network: string;
	servers: ServerStatus[];
	services?: ServerStatus[];
}

export interface AddProjectRequest {
	url: string;
	name?: string;
}

export interface UpRequest {
	no_cache?: boolean;
	force?: boolean;
}

export interface BuildRequest {
	no_cache?: boolean;
}

export interface CleanRequest {
	target?: "all" | "containers" | "images" | "volumes" | "cache" | "builds";
}

export interface ProjectListResponse {
	projects: string[];
}

export interface ProjectResponse {
	name: string;
}

export interface WebhookInfoResponse {
	enabled: boolean;
	url?: string;
	secret?: string;
	force?: boolean;
	no_cache?: boolean;
}

export interface ConsoleOptions {
	server: string;
	cols?: number;
	rows?: number;
}

export interface SpecServer {
	name: string;
	dir: string;
	software: string;
	ports?: string[];
	memory?: string;
	cpu?: string;
	env?: Record<string, string>;
	volumes?: SpecVolume[];
	healthcheck?: SpecHealthCheck;
	depends_on?: SpecDependency[];
}

export interface SpecService {
	name: string;
	image: string;
	ports?: string[];
	env?: Record<string, string>;
	volumes?: SpecVolume[];
	healthcheck?: SpecHealthCheck;
	depends_on?: SpecDependency[];
}

export interface SpecVolume {
	name: string;
	target: string;
}

export interface SpecHealthCheck {
	disabled?: boolean;
	cmd?: string;
	interval?: string;
	timeout?: string;
	start_period?: string;
	retries?: number;
}

export interface SpecDependency {
	name: string;
	condition?: string;
}

export interface SpecGitOpsPoll {
	enabled: boolean;
	interval?: string;
}

export interface SpecGitOpsWebhook {
	enabled: boolean;
	force?: boolean;
	no_cache?: boolean;
}

export interface SpecGitOps {
	poll?: SpecGitOpsPoll;
	webhook?: SpecGitOpsWebhook;
}

export interface SpecResponse {
	network: string;
	servers: SpecServer[];
	services?: SpecService[];
	gitops?: SpecGitOps;
}

export interface DeployServerState {
	image_tag: string;
	config_hash: string;
}

export interface DeployServiceState {
	image: string;
	config_hash: string;
}

export interface DeployState {
	servers: Record<string, DeployServerState>;
	services: Record<string, DeployServiceState>;
}

export interface ProjectDetailResponse {
	name: string;
	spec: SpecResponse;
	state: DeployState;
}

export interface BinaryEntry {
	software_id: string;
	filename: string;
	sha256: string;
	url: string;
	size_bytes: number;
	cached_at: string;
}

export interface BuildEntry {
	server_name: string;
	image_tag: string;
	cache_key: string;
	software_id: string;
	built_at: string;
	duration_ms: number;
}

export interface BuildsResponse {
	binaries: Record<string, BinaryEntry>;
	builds: Record<string, BuildEntry>;
}
