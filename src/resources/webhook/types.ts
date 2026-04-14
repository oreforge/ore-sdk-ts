export interface WebhookTriggerRequest {
	secret: string;
	force?: boolean;
	no_cache?: boolean;
}

export interface WebhookResponse {
	status: string;
	project: string;
	operation_id?: string;
}
