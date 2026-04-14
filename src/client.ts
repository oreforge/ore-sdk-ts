import { HttpClient } from "./core/http";
import { buildConsoleUrl, OreConsole } from "./core/websocket";
import { Operations } from "./resources/operations";
import { Projects } from "./resources/projects";
import type { ConsoleOptions } from "./resources/projects/types";
import { Webhook } from "./resources/webhook";

export interface OreClientOptions {
	baseUrl: string;
	token?: string;
	maxRetries?: number;
}

export class OreClient {
	readonly projects: Projects;
	readonly operations: Operations;
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
			return new OreConsole(url);
		};

		this.projects = new Projects(http, createConsole);
		this.operations = new Operations(http);
		this.webhook = new Webhook(http);
	}
}
