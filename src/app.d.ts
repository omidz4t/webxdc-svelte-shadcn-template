// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	type WebxdcUpdatePayload = unknown;

	type WebxdcUpdate = {
		payload: WebxdcUpdatePayload;
		info?: string;
		href?: string;
		document?: string;
		summary?: string;
		notify?: Record<string, string>;
		serial: number;
		max_serial: number;
	};

	type WebxdcSendUpdate = Omit<WebxdcUpdate, 'serial' | 'max_serial'>;

	type WebxdcSendToChatMessage = {
		text?: string;
		file?: {
			name: string;
			blob?: Blob;
			base64?: string;
			plainText?: string;
		};
	};

	type WebxdcImportFilter = {
		extensions?: string[];
		mimeTypes?: string[];
		multiple?: boolean;
	};

	interface WebxdcRealtimeChannel {
		setListener: (cb: (data: Uint8Array) => void) => void;
		send: (data: Uint8Array) => void;
		leave: () => void;
	}

	interface Webxdc {
		selfAddr: string;
		selfName: string;
		sendUpdate: (update: WebxdcSendUpdate, description?: string) => void;
		setUpdateListener: (
			cb: (update: WebxdcUpdate) => void,
			minSerial?: number
		) => Promise<void> | void;
		sendToChat?: (message: WebxdcSendToChatMessage) => Promise<void>;
		importFiles?: (filter?: WebxdcImportFilter) => Promise<File[]>;
		joinRealtimeChannel?: () => WebxdcRealtimeChannel;
		sendUpdateInterval?: number;
		sendUpdateMaxSize?: number;
		getAllUpdates?: () => Promise<WebxdcUpdate[]>;
		getAppInfo?: () => Promise<{ name: string; version?: string; description?: string }>;
	}

	interface Window {
		webxdc: Webxdc;
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
