<script lang="ts">
	import { onMount } from 'svelte';
	import {
		decodeRealtimeText,
		encodeRealtimeText,
		getSendUpdateLimits,
		importWebxdcFiles,
		joinRealtimeChannel,
		hasWebxdc,
		hasRealtimeChannel,
		onWebxdcUpdate,
		sendTextFileToChat,
		sendTextToChat,
		sendWebxdcUpdate,
		type WebxdcRealtimeChannel,
		type WebxdcUpdate
	} from '$lib/webxdc';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';

	type OpMeta = {
		opId: string;
		lamport: number;
		actor: string;
	};

	type CounterPayload = {
		type: 'counter-inc';
		delta: number;
		by: string;
		meta: OpMeta;
	};

	type ChatPayload = {
		type: 'chat-message';
		text: string;
		by: string;
		replyTo?: string;
		meta: OpMeta;
	};

	type RealtimeCompatPayload = {
		type: 'realtime-compat';
		text: string;
		by: string;
		meta: OpMeta;
	};

	type AppPayload = CounterPayload | ChatPayload | RealtimeCompatPayload;

	type SharedMessage = {
		id: string;
		by: string;
		addr: string;
		text: string;
		replyTo?: string;
		lamport: number;
	};

	type SharedState = {
		counter: number;
		messages: SharedMessage[];
	};

	type RealtimeHelperInstance = {
		connect: () => void;
		setState: (state: unknown) => void;
		sendPayload: (payload: unknown) => void;
		disconnect?: () => void;
		destroy?: () => void;
	};

	let sharedState = $state<SharedState>({
		counter: 0,
		messages: []
	});
	let log = $state<WebxdcUpdate<CounterPayload>[]>([]);
	let chatText = $state('');
	let chatStatus = $state('');
	let chatReplyToAddr = $state('');
	let importStatus = $state('');
	let importedFiles = $state<{ name: string; size: number; type: string }[]>([]);
	let realtimeText = $state('');
	let realtimeStatus = $state('');
	let realtimeMessages = $state<string[]>([]);
	let realtimeChannel = $state<WebxdcRealtimeChannel | null>(null);
	let helperPresenceStatus = $state('available');
	let helperPayloadText = $state('');
	let helperStatus = $state('@webxdc/realtime not connected');
	let helperPeers = $state<string[]>([]);
	let helperPayloadLog = $state<string[]>([]);
	let updateLimitsLabel = $state('sendUpdate limits: unknown');
	let knownParticipants = $state<Record<string, string>>({});
	const connected = hasWebxdc();
	const realtimeSupported = hasRealtimeChannel();
	const processedOpIds = new Set<string>();
	let localLamport = 0;
	let realtimeHelper = $state<RealtimeHelperInstance | null>(null);

	function randomSuffix() {
		const rng = typeof crypto !== 'undefined' ? crypto.getRandomValues(new Uint32Array(1))[0] : Date.now();
		return rng.toString(36);
	}

	function createMeta(): OpMeta {
		const actor = window.webxdc?.selfAddr || 'unknown';
		localLamport += 1;
		return {
			actor,
			lamport: localLamport,
			opId: `${actor}:${localLamport}:${randomSuffix()}`
		};
	}

	function observeMeta(meta: OpMeta) {
		localLamport = Math.max(localLamport, meta.lamport);
	}

	function noteParticipant(addr: string, name?: string) {
		if (!addr) return;
		const label = (name || addr).trim();
		if (!knownParticipants[addr] || knownParticipants[addr] !== label) {
			knownParticipants[addr] = label;
		}
	}

	function applySharedUpdate(update: WebxdcUpdate<AppPayload>) {
		const payload = update.payload;
		if (!payload) return;

		if (payload.meta) {
			if (processedOpIds.has(payload.meta.opId)) return;
			processedOpIds.add(payload.meta.opId);
			observeMeta(payload.meta);
		}

		if (payload.type === 'counter-inc') {
			noteParticipant(payload.meta.actor, payload.by);
			sharedState.counter += payload.delta;
			log = [update as WebxdcUpdate<CounterPayload>, ...log].slice(0, 8);
			return;
		}

		if (payload.type === 'chat-message') {
			noteParticipant(payload.meta.actor, payload.by);
			sharedState.messages = [
				{
					id: payload.meta.opId,
					by: payload.by,
					addr: payload.meta.actor,
					text: payload.text,
					replyTo: payload.replyTo,
					lamport: payload.meta.lamport
				},
				...sharedState.messages
			]
				.sort((a, b) => {
					if (b.lamport !== a.lamport) return b.lamport - a.lamport;
					return a.id < b.id ? 1 : -1;
				})
				.slice(0, 8);
		}

		if (payload.type === 'realtime-compat') {
			const selfAddr = window.webxdc?.selfAddr ?? '';
			const direction = payload.meta.actor === selfAddr ? 'tx*' : 'rx*';
			pushRealtimeMessage(`${direction}: ${payload.text}`);
		}
	}

	function incrementCounter() {
		const meta = createMeta();
		const nextCounter = sharedState.counter + 1;
		noteParticipant(meta.actor, window.webxdc?.selfName || window.webxdc?.selfAddr || 'unknown');
		sendWebxdcUpdate<CounterPayload>(
			{
				type: 'counter-inc',
				delta: 1,
				by: window.webxdc?.selfName || window.webxdc?.selfAddr || 'unknown',
				meta
			},
			{
				info: `${window.webxdc?.selfName || 'Someone'} incremented counter`,
				href: '#counter',
				document: 'Shared Counter',
				summary: `Counter: ${nextCounter}`,
				notify: { '*': 'Counter changed' }
			}
		);
	}

	function buildChatNotifyMap(sender: string, replyToAddr?: string) {
		const notify: Record<string, string> = {};
		for (const [addr, name] of Object.entries(knownParticipants)) {
			if (replyToAddr && addr === replyToAddr) {
				notify[addr] = `Reply from ${sender}`;
			} else {
				notify[addr] = `New message from ${name === sender ? sender : sender}`;
			}
		}
		notify['*'] = `New message from ${sender}`;
		return notify;
	}

	async function sendMessageToChat() {
		const text = chatText.trim();
		if (!text) {
			chatStatus = 'Type a message first.';
			return;
		}

		const by = window.webxdc?.selfName || 'Unknown user';
		const meta = createMeta();
		noteParticipant(meta.actor, by);
		const replyTo = chatReplyToAddr.trim() || undefined;

		sendWebxdcUpdate<ChatPayload>(
			{ type: 'chat-message', text, by, meta, replyTo },
			{
				info: `${by}: ${text}`,
				href: '#chat',
				document: 'Template Chat',
				summary: `${sharedState.messages.length + 1} msgs`,
				notify: buildChatNotifyMap(by, replyTo)
			}
		);

		try {
			await sendTextToChat(text);
			chatStatus = 'Message draft sent to chat composer.';
		} catch (error) {
			console.error(error);
			chatStatus = 'Could not open chat composer on this host.';
		}
		chatText = '';
		chatReplyToAddr = '';
	}

	async function exportStateAsFile() {
		try {
			const content = JSON.stringify(
				{
					counter: sharedState.counter,
					messages: sharedState.messages
				},
				null,
				2
			);
			await sendTextFileToChat('shared-state.json', content);
			chatStatus = 'State exported as file draft via sendToChat().';
		} catch (error) {
			console.error(error);
			chatStatus = 'Could not export file draft on this host.';
		}
	}

	async function importFilesDemo() {
		try {
			const files = await importWebxdcFiles({
				multiple: true,
				extensions: ['.txt', '.json', '.md'],
				mimeTypes: ['text/plain', 'application/json']
			});
			importedFiles = files.map((file) => ({
				name: file.name,
				size: file.size,
				type: file.type || 'unknown'
			}));
			importStatus = files.length > 0 ? `Imported ${files.length} file(s).` : 'No files selected.';
		} catch (error) {
			console.error(error);
			importStatus = 'Import failed or was cancelled.';
		}
	}

	function pushRealtimeMessage(message: string) {
		realtimeMessages = [message, ...realtimeMessages].slice(0, 8);
	}

	function setReplyTarget(addr: string) {
		chatReplyToAddr = addr;
		chatStatus = `Reply target set: ${knownParticipants[addr] || addr}`;
	}

	function pushHelperPayloadLog(message: string) {
		helperPayloadLog = [message, ...helperPayloadLog].slice(0, 8);
	}

	async function initRealtimeHelper() {
		if (!realtimeSupported) {
			helperStatus = '@webxdc/realtime requires native joinRealtimeChannel() support.';
			return;
		}
		if (realtimeHelper) {
			helperStatus = '@webxdc/realtime already connected.';
			return;
		}
		if (realtimeChannel) {
			helperStatus = 'Disconnect low-level realtime channel before connecting @webxdc/realtime.';
			return;
		}
		try {
			const mod = await import('@webxdc/realtime');
			const RealTimeClass = (mod as { RealTime?: new (opts: unknown) => RealtimeHelperInstance }).RealTime;
			if (!RealTimeClass) {
				helperStatus = '@webxdc/realtime export not found.';
				return;
			}
			const helper = new RealTimeClass({
				onPeersChanged: (peers: unknown[]) => {
					helperPeers = (peers || []).map((peer) =>
						typeof peer === 'string' ? peer : JSON.stringify(peer)
					);
				},
				onPayload: (peerId: string, payload: unknown) => {
					pushHelperPayloadLog(`rx from ${peerId}: ${JSON.stringify(payload)}`);
				}
			});
			helper.setState({
				status: helperPresenceStatus,
				name: window.webxdc?.selfName || 'anonymous'
			});
			helper.connect();
			realtimeHelper = helper;
			helperStatus = '@webxdc/realtime connected.';
		} catch (error) {
			console.error(error);
			helperStatus = 'Could not initialize @webxdc/realtime on this host.';
		}
	}

	function disconnectRealtimeHelper() {
		if (!realtimeHelper) {
			helperStatus = '@webxdc/realtime is not connected.';
			return;
		}
		realtimeHelper.disconnect?.();
		realtimeHelper.destroy?.();
		realtimeHelper = null;
		helperPeers = [];
		helperStatus = '@webxdc/realtime disconnected.';
	}

	function updateHelperPresenceState() {
		if (!realtimeHelper) {
			helperStatus = 'Connect @webxdc/realtime first.';
			return;
		}
		realtimeHelper.setState({
			status: helperPresenceStatus,
			name: window.webxdc?.selfName || 'anonymous'
		});
		helperStatus = `Presence advertised: ${helperPresenceStatus}`;
	}

	function sendHelperPayload() {
		const text = helperPayloadText.trim();
		if (!text) {
			helperStatus = 'Type a payload text first.';
			return;
		}
		if (!realtimeHelper) {
			helperStatus = 'Connect @webxdc/realtime first.';
			return;
		}
		const payload = {
			text,
			from: window.webxdc?.selfName || window.webxdc?.selfAddr || 'unknown',
			at: Date.now()
		};
		realtimeHelper.sendPayload(payload);
		pushHelperPayloadLog(`tx: ${JSON.stringify(payload)}`);
		helperStatus = 'Payload sent via @webxdc/realtime.';
		helperPayloadText = '';
	}

	function openRealtimeChannel() {
		if (!realtimeSupported) {
			realtimeStatus = 'Native realtime is unavailable; using sendUpdate emulation mode.';
			return;
		}
		if (realtimeHelper) {
			realtimeStatus = 'Disconnect @webxdc/realtime helper before opening low-level realtime channel.';
			return;
		}
		if (realtimeChannel) return;
		const channel = joinRealtimeChannel((data) => {
			const message = decodeRealtimeText(data);
			pushRealtimeMessage(`rx: ${message}`);
		});
		if (!channel) {
			realtimeStatus = 'Realtime channel API is not available on this host.';
			return;
		}
		realtimeChannel = channel;
		realtimeStatus = 'Realtime channel connected.';
	}

	function leaveRealtimeChannel() {
		if (!realtimeSupported) return;
		if (!realtimeChannel) return;
		realtimeChannel.leave();
		realtimeChannel = null;
		realtimeStatus = 'Realtime channel closed.';
	}

	function sendRealtimeMessage() {
		const text = realtimeText.trim();
		if (!text) {
			realtimeStatus = 'Type a realtime message first.';
			return;
		}
		if (realtimeSupported) {
			if (!realtimeChannel) {
				realtimeStatus = 'Connect realtime channel first.';
				return;
			}
			try {
				realtimeChannel.send(encodeRealtimeText(text));
				pushRealtimeMessage(`tx: ${text}`);
				realtimeStatus = 'Realtime message sent to currently connected peers.';
				realtimeText = '';
			} catch (error) {
				console.error(error);
				realtimeStatus = 'Could not send realtime message.';
			}
			return;
		}

		// Fallback for webxdc-dev where joinRealtimeChannel() is unavailable:
		// emulate low-latency messages via sendUpdate so simulator instances can test flows.
		sendWebxdcUpdate<RealtimeCompatPayload>(
			{
				type: 'realtime-compat',
				text,
				by: window.webxdc?.selfName || 'Unknown user',
				meta: createMeta()
			},
			{ info: '', summary: 'Realtime (emulated)', href: '#realtime' }
		);
		realtimeStatus = 'Emulated realtime sent via shared update transport.';
		realtimeText = '';
	}

	function scrollToHashTarget() {
		const targetId = window.location.hash.replace(/^#/, '');
		if (!targetId) return;
		const target = document.getElementById(targetId);
		target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	onMount(() => {
		noteParticipant(window.webxdc?.selfAddr || 'unknown', window.webxdc?.selfName || 'Me');
		onWebxdcUpdate<AppPayload>((update) => {
			applySharedUpdate(update as WebxdcUpdate<AppPayload>);
		});

		const limits = getSendUpdateLimits();
		updateLimitsLabel = `sendUpdate limits: interval=${limits.interval}ms, maxSize=${limits.maxSize} bytes`;
		scrollToHashTarget();
		window.addEventListener('hashchange', scrollToHashTarget);

		if (realtimeSupported) {
			realtimeStatus = 'Choose one mode: low-level realtime OR @webxdc/realtime helper.';
			helperStatus = '@webxdc/realtime ready. Click connect when needed.';
		} else {
			realtimeStatus = 'Native realtime API not exposed by host; emulation mode is active.';
			helperStatus = '@webxdc/realtime disabled because native realtime is unavailable.';
		}
		return () => {
			window.removeEventListener('hashchange', scrollToHashTarget);
			leaveRealtimeChannel();
			disconnectRealtimeHelper();
		};
	});
</script>

<main class="mx-auto max-w-2xl space-y-6 p-6">
	<header class="space-y-2">
		<p class="text-sm text-zinc-500">webxdc + Svelte + Tailwind starter</p>
		<h1 class="text-3xl font-bold tracking-tight">Build collaborative chat apps faster</h1>
		<p class="text-zinc-600">
			This starter includes a local `webxdc` shim, typed API wrappers, and static packaging defaults.
		</p>
		<p class="text-xs text-zinc-500">{updateLimitsLabel}</p>
	</header>

	<section id="counter" class="rounded-lg border border-zinc-200 p-4 shadow-sm">
		<div class="mb-3 flex items-center justify-between">
			<h2 class="text-lg font-semibold">Synced Counter Demo</h2>
			<span
				class={`rounded px-2 py-1 text-xs font-medium ${
					connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
				}`}
			>
				{connected ? 'webxdc available' : 'fallback shim'}
			</span>
		</div>

		<p class="mb-4 text-zinc-700">Current value: <strong>{sharedState.counter}</strong></p>
		<Button type="button" onclick={incrementCounter}>
			Increment and broadcast
		</Button>
		<p class="mt-2 text-xs text-zinc-500">
			Counter uses commutative increment operations, so concurrent increments converge reliably.
		</p>
	</section>

	<section class="rounded-lg border border-zinc-200 p-4 shadow-sm">
		<h3 class="mb-2 text-base font-semibold">Recent incoming updates</h3>
		{#if log.length === 0}
			<p class="text-sm text-zinc-500">No updates yet. Click the button to emit your first update.</p>
		{:else}
			<ul class="space-y-2 text-sm">
				{#each log as entry}
					<li class="rounded border border-zinc-200 bg-zinc-50 p-2">
						Serial {entry.serial}: {entry.info ?? 'update'} - +{entry.payload.delta} by {entry.payload.by}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section id="chat" class="rounded-lg border border-zinc-200 p-4 shadow-sm">
		<h3 class="mb-2 text-base font-semibold">sendToChat() template example</h3>
		<p class="mb-3 text-sm text-zinc-600">
			This button creates a chat draft using `webxdc.sendToChat()` and also emits `sendUpdate()`. The list below
			is rendered from shared updates only.
		</p>

		<div class="mb-3 flex flex-col gap-2 sm:flex-row">
			<select
				class="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
				bind:value={chatReplyToAddr}
			>
				<option value="">Notify all known participants</option>
				{#each Object.entries(knownParticipants) as [addr, label]}
					<option value={addr}>{label} ({addr})</option>
				{/each}
			</select>
			<Button type="button" variant="outline" onclick={() => (chatReplyToAddr = '')}>
				Clear reply target
			</Button>
		</div>

		<div class="mb-3 flex flex-col gap-2 sm:flex-row">
			<Input
				type="text"
				bind:value={chatText}
				placeholder="Write a message to send..."
			/>
			<Button type="button" onclick={sendMessageToChat}>
				Send message to chat
			</Button>
			<Button type="button" variant="outline" onclick={exportStateAsFile}>
				Export state file to chat
			</Button>
		</div>

		{#if chatStatus}
			<p class="mb-3 text-xs text-zinc-500">{chatStatus}</p>
		{/if}

		{#if sharedState.messages.length === 0}
			<p class="text-sm text-zinc-500">No message updates yet.</p>
		{:else}
			<ul class="space-y-2 text-sm">
				{#each sharedState.messages as entry}
					<li class="rounded border border-zinc-200 bg-zinc-50 p-2">
						<strong>{entry.by}</strong>: {entry.text}
						<span class="text-zinc-500">(lamport {entry.lamport})</span>
						{#if entry.replyTo}
							<div class="text-xs text-zinc-500">Reply to: {knownParticipants[entry.replyTo] || entry.replyTo}</div>
						{/if}
						<div class="mt-1">
							<Button type="button" variant="outline" size="sm" onclick={() => setReplyTarget(entry.addr)}>
								Reply mention
							</Button>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section id="import" class="rounded-lg border border-zinc-200 p-4 shadow-sm">
		<h3 class="mb-2 text-base font-semibold">importFiles() template example</h3>
		<p class="mb-3 text-sm text-zinc-600">
			Imports files with extension/mime filters. In non-supporting hosts this falls back to a standard file input.
		</p>
		<Button type="button" onclick={importFilesDemo}>
			Import files
		</Button>
		{#if importStatus}
			<p class="mt-2 text-xs text-zinc-500">{importStatus}</p>
		{/if}
		{#if importedFiles.length > 0}
			<ul class="mt-3 space-y-2 text-sm">
				{#each importedFiles as file}
					<li class="rounded border border-zinc-200 bg-zinc-50 p-2">
						{file.name} - {file.size} bytes - {file.type}
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section id="realtime" class="rounded-lg border border-zinc-200 p-4 shadow-sm">
		<h3 class="mb-2 text-base font-semibold">Realtime channel example (ephemeral)</h3>
		<p class="mb-3 text-sm text-zinc-600">
			`joinRealtimeChannel()` messages are low-latency and ephemeral. They are not part of shared history and are
			only received by currently connected peers. In dev hosts without native realtime, this template uses a
			`sendUpdate` emulation mode.
		</p>

		<div class="mb-3 flex flex-wrap gap-2">
			<Button
				type="button"
				onclick={openRealtimeChannel}
				disabled={!realtimeSupported || !!realtimeChannel}
			>
				Connect realtime
			</Button>
			<Button
				type="button"
				variant="outline"
				onclick={leaveRealtimeChannel}
				disabled={!realtimeSupported || !realtimeChannel}
			>
				Leave realtime
			</Button>
		</div>

		<div class="mb-3 flex flex-col gap-2 sm:flex-row">
			<Input
				type="text"
				bind:value={realtimeText}
				placeholder="Type ephemeral realtime message..."
			/>
			<Button type="button" onclick={sendRealtimeMessage}>
				Send realtime
			</Button>
		</div>

		{#if realtimeStatus}
			<p class="mb-3 text-xs text-zinc-500">{realtimeStatus}</p>
		{/if}

		{#if !realtimeSupported}
			<p class="text-sm text-amber-700">
				Native `joinRealtimeChannel()` is unavailable in this host; using shared-update emulation.
			</p>
		{/if}

		{#if realtimeMessages.length === 0}
			<p class="text-sm text-zinc-500">No realtime events yet. Open this app on another device to test.</p>
		{:else}
			<ul class="space-y-2 text-sm">
				{#each realtimeMessages as entry}
					<li class="rounded border border-zinc-200 bg-zinc-50 p-2">{entry}</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section id="realtime-helper" class="rounded-lg border border-zinc-200 p-4 shadow-sm">
		<h3 class="mb-2 text-base font-semibold">@webxdc/realtime helper example</h3>
		<p class="mb-3 text-sm text-zinc-600">
			Uses `@webxdc/realtime` for high-level presence and object payload sync over the realtime channel. Great for
			small chats; avoid this pattern for very large groups because frequent peer state advertisements can overwhelm
			realtime traffic.
		</p>
		<p class="mb-3 text-xs text-zinc-500">{helperStatus}</p>

		<div class="mb-3 flex flex-wrap gap-2">
			<Button type="button" onclick={initRealtimeHelper} disabled={!realtimeSupported || !!realtimeHelper}>
				Connect helper
			</Button>
			<Button type="button" variant="outline" onclick={disconnectRealtimeHelper} disabled={!realtimeHelper}>
				Disconnect helper
			</Button>
		</div>

		<div class="mb-3 flex flex-col gap-2 sm:flex-row">
			<Input
				type="text"
				bind:value={helperPresenceStatus}
				placeholder="Presence status (e.g. available, busy)"
			/>
			<Button type="button" onclick={updateHelperPresenceState}>
				Advertise state
			</Button>
		</div>

		<div class="mb-3 flex flex-col gap-2 sm:flex-row">
			<Input
				type="text"
				bind:value={helperPayloadText}
				placeholder="Payload text for @webxdc/realtime"
			/>
			<Button type="button" onclick={sendHelperPayload}>
				Send helper payload
			</Button>
		</div>

		<p class="mb-2 text-sm text-zinc-700">Peers online: {helperPeers.length}</p>
		{#if helperPeers.length > 0}
			<ul class="mb-3 space-y-2 text-sm">
				{#each helperPeers as peer}
					<li class="rounded border border-zinc-200 bg-zinc-50 p-2">{peer}</li>
				{/each}
			</ul>
		{/if}

		{#if helperPayloadLog.length === 0}
			<p class="text-sm text-zinc-500">No helper payloads yet.</p>
		{:else}
			<ul class="space-y-2 text-sm">
				{#each helperPayloadLog as line}
					<li class="rounded border border-zinc-200 bg-zinc-50 p-2">{line}</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>
