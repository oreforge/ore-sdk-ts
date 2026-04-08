export interface StreamLine {
	time?: string;
	level?: string;
	msg?: string;
	done?: boolean;
	error?: string;
	[key: string]: unknown;
}
