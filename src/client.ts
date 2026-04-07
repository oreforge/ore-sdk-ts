import { HttpClient } from "./core/http";
import { buildConsoleUrl, Console } from "./core/websocket";
import { Projects } from "./resources/projects";
import { Webhook } from "./resources/webhook";
import type { ConsoleOptions } from "./types/websocket";

export interface OreClientOptions {
	baseUrl: string;
	token?: string;
	maxRetries?: number;
}

export class OreClient {
	readonly projects: Projects;
	readonly webhook: Webhook;

	constructor(options: OreClientOptions) {
		const http = new HttpClient({
			baseUrl: options.baseUrl,
			token: options.token,
			maxRetries: options.maxRetries,
		});

		const createConsole = (name: string, opts: ConsoleOptions) => {
			const url = buildConsoleUrl(
				options.baseUrl,
				name,
				opts.server,
				opts.cols,
				opts.rows,
				options.token,
			);
			return new Console(url);
		};

		this.projects = new Projects(http, createConsole);
		this.webhook = new Webhook(http);
	}
}
