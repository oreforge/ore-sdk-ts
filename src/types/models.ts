export type ContainerState = "not found" | "created" | "running" | "exited" | "paused" | "dead";

export type HealthState = "\u2014" | "starting" | "healthy" | "unhealthy";

export interface PortBinding {
	hostPort: number;
	containerPort: number;
	protocol: string;
}

export interface ContainerStatus {
	name: string;
	state: ContainerState;
	health: HealthState;
	image: string;
	ports?: PortBinding[];
	startedAt?: string;
	uptime?: number;
	restartCount: number;
	exitCode: number;
	memoryBytes: number;
	cpus: number;
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
