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

export interface PruneRequest {
	target?: "all" | "servers" | "images" | "data";
}

export interface CleanRequest {
	target?: "all" | "cache" | "builds";
}

export interface WebhookTriggerRequest {
	secret: string;
	force?: boolean;
	no_cache?: boolean;
}

export interface RequestOptions {
	signal?: AbortSignal;
	headers?: Record<string, string>;
}
