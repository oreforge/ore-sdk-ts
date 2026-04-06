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

export interface WebhookResponse {
	status: string;
	project: string;
}
