import { HttpClient } from "./core/http";
import { buildConsoleUrl, Console } from "./core/websocket";
import { Projects } from "./resources/projects";
import type { ConsoleOptions } from "./types/requests";

export interface OreClientOptions {
	baseUrl: string;
	token?: string;
	maxRetries?: number;
}

export class OreClient {
	readonly projects: Projects;

	constructor(options: OreClientOptions) {
		const http = new HttpClient({
			baseUrl: options.baseUrl,
			token: options.token,
			maxRetries: options.maxRetries,
		});

		const headers: Record<string, string> | undefined = options.token
			? { Authorization: `Bearer ${options.token}` }
			: undefined;

		const createConsole = (name: string, opts: ConsoleOptions) => {
			const url = buildConsoleUrl(options.baseUrl, name, opts.container, opts.cols, opts.rows);
			return new Console(url, headers);
		};

		this.projects = new Projects(http, createConsole);
	}
}
