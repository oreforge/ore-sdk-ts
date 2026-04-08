import type { ServerStatus } from "../projects/types";

export interface ServerListResponse {
	servers: ServerStatus[];
	services?: ServerStatus[];
}

export type ServerStatusResponse = ServerStatus;
