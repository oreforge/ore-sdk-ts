import { OreError, OreStreamError } from "../errors";
import type { StreamLine } from "../types/streaming";

export class NdjsonStream<T extends StreamLine = StreamLine> implements AsyncIterable<T> {
	private readonly response: Response | Promise<Response>;
	private consumed = false;

	constructor(response: Response | Promise<Response>) {
		this.response = response;
	}

	async *[Symbol.asyncIterator](): AsyncIterator<T> {
		if (this.consumed) {
			throw new OreError("NdjsonStream has already been consumed");
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
					const line = parseLine(raw);
					if (line) yield line as T;
				}
			}

			const line = parseLine(buffer);
			if (line) yield line as T;
		} finally {
			reader.releaseLock();
		}
	}

	async toArray(): Promise<T[]> {
		const lines: T[] = [];
		for await (const line of this) {
			lines.push(line);
		}
		return lines;
	}

	async drain(): Promise<void> {
		for await (const _line of this) {
			void _line;
		}
	}
}

function parseLine(raw: string): StreamLine | undefined {
	const trimmed = raw.trim();
	if (trimmed === "") return undefined;

	let line: StreamLine;
	try {
		line = JSON.parse(trimmed) as StreamLine;
	} catch {
		throw new OreStreamError({ done: true, error: `Malformed JSON: ${trimmed}` });
	}

	if (line.done && line.error) {
		throw new OreStreamError(line);
	}

	if (line.done) return undefined;

	return line;
}
