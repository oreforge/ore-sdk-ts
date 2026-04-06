import { HttpClient } from "./core/http";
import { buildConsoleUrl, Console } from "./core/websocket";
import { Projects } from "./resources/projects";
import type { ConsoleOptions } from "./types/websocket";

export interface OreClientOptions {
	baseUrl: string;
	token?: string;
	maxRetries?: number;
}

function buildAuthHeaders(token?: string): Record<string, string> | undefined {
	return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export class OreClient {
	readonly projects: Projects;

	constructor(options: OreClientOptions) {
		const http = new HttpClient({
			baseUrl: options.baseUrl,
			token: options.token,
			maxRetries: options.maxRetries,
		});

		const wsHeaders = buildAuthHeaders(options.token);

		const createConsole = (name: string, opts: ConsoleOptions) => {
			const url = buildConsoleUrl(options.baseUrl, name, opts.server, opts.cols, opts.rows);
			return new Console(url, wsHeaders);
		};

		this.projects = new Projects(http, createConsole);
	}
}
