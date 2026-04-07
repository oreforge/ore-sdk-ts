import type { HttpClient } from "../core/http";
import type { RequestOptions, WebhookTriggerRequest } from "../types/requests";
import type { WebhookResponse } from "../types/responses";

export class Webhook {
	private readonly http: HttpClient;

	constructor(http: HttpClient) {
		this.http = http;
	}

	async trigger(
		name: string,
		request: WebhookTriggerRequest,
		options?: RequestOptions,
	): Promise<WebhookResponse> {
		const params = new URLSearchParams({ secret: request.secret });
		if (request.force) params.set("force", "true");
		if (request.no_cache) params.set("no_cache", "true");

		return this.http.postNoAuth<WebhookResponse>(
			`/api/webhook/${encodeURIComponent(name)}?${params}`,
			options,
		);
	}
}
