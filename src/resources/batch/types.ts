export type BatchTargetStatus = "ok" | "failed" | "skipped";

export type BatchStatus = "completed" | "failed" | "cancelled";

export interface BatchTargetResult {
	target: string;
	status: BatchTargetStatus;
	error?: string;
}

export interface BatchResponse {
	operation_id: string;
	status: BatchStatus;
	total: number;
	succeeded: number;
	failed: number;
	skipped: number;
	results: BatchTargetResult[];
}

export interface BatchOptions {
	sync?: boolean;
}

export interface BatchVolumeDeleteOptions extends BatchOptions {
	force?: boolean;
}
