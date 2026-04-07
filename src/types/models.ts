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

export interface StreamLine {
	time?: string;
	level?: string;
	msg?: string;
	done?: boolean;
	error?: string;
	[key: string]: unknown;
}
