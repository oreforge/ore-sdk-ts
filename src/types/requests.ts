export interface RequestOptions {
	signal?: AbortSignal;
	timeout?: number;
	headers?: Record<string, string>;
}
