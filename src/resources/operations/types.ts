export type OperationStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export type OperationAction =
	| "up"
	| "down"
	| "build"
	| "clean"
	| "update"
	| "start"
	| "stop"
	| "restart"
	| "deploy"
	| "volume.remove";

export interface OperationResponse {
	id: string;
	project: string;
	action: OperationAction;
	target?: string;
	status: OperationStatus;
	error?: string;
	created_at: string;
	started_at?: string;
	ended_at?: string;
}

export interface OperationListResponse {
	operations: OperationResponse[];
}

export interface OperationListOptions {
	project?: string;
	status?: OperationStatus;
}
