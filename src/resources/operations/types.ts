export type OperationStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export interface OperationResponse {
	id: string;
	project: string;
	action: string;
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
