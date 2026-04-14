import type { HttpClient } from "../../core/http";
import type { RequestOptions } from "../../types";
import { Operation } from "./operation";
import type { OperationListOptions, OperationListResponse } from "./types";

export class Operations {
	private readonly http: HttpClient;

	constructor(http: HttpClient) {
		this.http = http;
	}

	async list(
		filter?: OperationListOptions,
		options?: RequestOptions,
	): Promise<OperationListResponse> {
		const params = new URLSearchParams();
		if (filter?.project) params.set("project", filter.project);
		if (filter?.status) params.set("status", filter.status);
		const query = params.toString();
		const path = `/api/operations${query ? `?${query}` : ""}`;
		return this.http.get<OperationListResponse>(path, options);
	}

	get(id: string): Operation {
		return new Operation(id, this.http);
	}
}

export { Operation } from "./operation";
