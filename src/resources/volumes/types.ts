export interface VolumeResponse {
	name: string;
	project: string;
	owner: string;
	ownerKind: "server" | "service";
	logical: string;
	driver: string;
	mountpoint?: string;
	createdAt?: string;
	sizeBytes: number;
	inUseBy: string[];
}

export interface VolumeListResponse {
	volumes: VolumeResponse[];
}

export interface PruneCandidate {
	name: string;
	owner?: string;
	logical?: string;
}

export interface PruneSkip {
	name: string;
	reason: string;
}

export interface PruneReport {
	project: string;
	dryRun: boolean;
	candidates?: PruneCandidate[];
	deleted?: string[];
	skipped?: PruneSkip[];
}

export interface PruneOptions {
	dry_run?: boolean;
}

export interface DeleteVolumeOptions {
	force?: boolean;
}
