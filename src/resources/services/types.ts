import type { ServerStatus } from "../projects/types";

export interface ServiceListResponse {
	services: ServerStatus[];
}

export type ServiceStatusResponse = ServerStatus;
