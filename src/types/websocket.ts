import type { Console } from "../core/websocket";

export interface ConsoleOptions {
	server: string;
	cols?: number;
	rows?: number;
}

export type ConsoleFactory = (name: string, options: ConsoleOptions) => Console;
