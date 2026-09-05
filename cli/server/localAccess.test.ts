// @vitest-environment node
// SPDX-License-Identifier: Apache-2.0
import { afterEach, describe, expect, it } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'node:http';
import { WebSocket, WebSocketServer } from 'ws';
import { isLocalRequest, localAccess } from './localAccess';

describe('local workspace access', () => {
	it.each(['localhost', '127.0.0.1', '[::1]'])('allows the %s UI and CLI', (host) => {
		expect(isLocalRequest({ host: `${host}:3000` }, 3000)).toBe(true);
		expect(isLocalRequest({ host: `${host}:3000`, origin: `http://${host}:3000` }, 3000)).toBe(
			true
		);
		expect(isLocalRequest({ host: `${host}:3000`, origin: `http://${host}:5173` }, 3000)).toBe(
			true
		);
	});

	it.each([
		{ host: 'attacker.example:3000' },
		{ host: 'localhost.attacker.example:3000' },
		{ host: 'localhost:9999' },
		{ host: 'localhost:3000', origin: 'null' },
		{ host: 'localhost:3000', origin: 'https://attacker.example' },
		{ host: 'localhost:3000', origin: 'http://localhost:5174' },
		{ host: 'localhost:3000', origin: 'http://localhost:5173/' },
		{ host: 'localhost:3000', 'sec-fetch-site': 'cross-site' },
		{}
	])('rejects untrusted authority/origin %j', (headers) => {
		expect(isLocalRequest(headers, 3000)).toBe(false);
	});

	let server: Server | undefined;
	afterEach(async () => {
		if (server) {
			server.closeAllConnections();
			await new Promise<void>((resolve) => server!.close(() => resolve()));
			server = undefined;
		}
	});

	it('blocks cross-origin writes before the handler and allows the local UI', async () => {
		const app = express();
		let port = 0;
		let writes = 0;
		app.use((req, res, next) => localAccess(port)(req, res, next));
		app.post('/write', (_req, res) => {
			writes++;
			res.sendStatus(204);
		});
		server = createServer(app);
		await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
		port = (server.address() as { port: number }).port;
		const url = `http://127.0.0.1:${port}/write`;
		const denied = await fetch(url, {
			method: 'POST',
			headers: { origin: 'https://attacker.example' }
		});
		expect(denied.status).toBe(403);
		expect(writes).toBe(0);
		const allowed = await fetch(url, {
			method: 'POST',
			headers: { origin: 'http://localhost:5173' }
		});
		expect(allowed.status).toBe(204);
		expect(writes).toBe(1);
	});

	it('rejects a WebSocket upgrade from an untrusted website', async () => {
		server = createServer();
		await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
		const port = (server.address() as { port: number }).port;
		const wss = new WebSocketServer({
			server,
			verifyClient: ({ req }: { req: import('node:http').IncomingMessage }) =>
				isLocalRequest(req.headers, port)
		});
		const socket = new WebSocket(`ws://127.0.0.1:${port}`, { origin: 'https://attacker.example' });
		const error = await new Promise<Error>((resolve) => socket.once('error', resolve));
		expect(error.message).toContain('401');
		await new Promise<void>((resolve) => wss.close(() => resolve()));
	});
});
