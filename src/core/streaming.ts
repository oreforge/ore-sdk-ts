import type { StreamLine } from "../types/models";
import { OreStreamError } from "./errors";
import { toCamelCase } from "./http";

export class NdjsonStream implements AsyncIterable<StreamLine> {
	private readonly response: Response | Promise<Response>;
	private consumed = false;

	constructor(response: Response | Promise<Response>) {
		this.response = response;
	}

	async *[Symbol.asyncIterator](): AsyncIterator<StreamLine> {
		if (this.consumed) {
			throw new Error("NdjsonStream has already been consumed");
		}
		this.consumed = true;

		const resolved = await this.response;
		const body = resolved.body;
		if (!body) return;

		const reader = body.getReader();
		const decoder = new TextDecoder();
		let buffer = "";

		try {
			for (;;) {
				const { done, value } = await reader.read();

				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";

				for (const raw of lines) {
					const trimmed = raw.trim();
					if (trimmed === "") continue;

					let line: StreamLine;
					try {
						line = toCamelCase(JSON.parse(trimmed)) as StreamLine;
					} catch {
						throw new OreStreamError({ done: true, error: `Malformed JSON: ${trimmed}` });
					}

					if (line.done && line.error) {
						throw new OreStreamError(line);
					}

					if (!line.done) {
						yield line;
					}
				}
			}

			if (buffer.trim() !== "") {
				let line: StreamLine;
				try {
					line = toCamelCase(JSON.parse(buffer.trim())) as StreamLine;
				} catch {
					throw new OreStreamError({ done: true, error: `Malformed JSON: ${buffer.trim()}` });
				}

				if (line.done && line.error) {
					throw new OreStreamError(line);
				}

				if (!line.done) {
					yield line;
				}
			}
		} finally {
			reader.releaseLock();
		}
	}

	async toArray(): Promise<StreamLine[]> {
		const lines: StreamLine[] = [];
		for await (const line of this) {
			lines.push(line);
		}
		return lines;
	}

	async drain(): Promise<void> {
		for await (const _ of this) {
		}
	}
}
