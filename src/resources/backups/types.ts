export type BackupKind = "manual" | "scheduled" | "pre-restore";
export type BackupStatus = "pending" | "running" | "completed" | "failed";

export interface BackupStorageRef {
	backend: string;
	uri: string;
}

export interface BackupResponse {
	id: string;
	project: string;
	volume: string;
	logicalName?: string;
	kind: BackupKind;
	status: BackupStatus;
	createdAt: string;
	finishedAt?: string;
	error?: string;
	sizeBytes: number;
	compressed: number;
	algorithm: string;
	checksum?: string;
	verified?: string;
	storage: BackupStorageRef[];
	tags?: string[];
}

export interface BackupListResponse {
	backups: BackupResponse[];
}

export interface CreateBackupRequest {
	volume: string;
	tags?: string[];
}

export interface BackupListOptions {
	volume?: string;
	status?: BackupStatus;
}

export interface RestoreBackupOptions {
	keep_pre_restore?: boolean;
}
