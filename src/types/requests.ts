export interface AddProjectRequest {
	url: string;
	name?: string;
}

export interface UpRequest {
	noCache?: boolean;
	force?: boolean;
}

export interface BuildRequest {
	noCache?: boolean;
}

export interface PruneRequest {
	target?: "all" | "servers" | "images" | "data";
}

export interface CleanRequest {
	target?: "all" | "cache" | "builds";
}

export interface ConsoleOptions {
	server: string;
	cols: number;
	rows: number;
}

export interface RequestOptions {
	signal?: AbortSignal;
	headers?: Record<string, string>;
}
