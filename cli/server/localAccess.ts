// SPDX-License-Identifier: Apache-2.0
import type { IncomingHttpHeaders } from 'node:http';
import type { RequestHandler } from 'express';

const LOOPBACK_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

/** Restrict the local workspace to its own UI and the documented Vite UI. */
export function isLocalRequest(headers: IncomingHttpHeaders, port: number): boolean {
	const hosts = LOOPBACK_HOSTS.map((host) => `${host}:${port}`);
	if (!headers.host || !hosts.includes(headers.host.toLowerCase())) return false;
	if (headers.origin === undefined) {
		// CLI clients omit Origin. Reject cross-site browser no-cors requests too.
		return headers['sec-fetch-site'] !== 'cross-site';
	}
	const origins = [port, 5173].flatMap((uiPort) =>
		LOOPBACK_HOSTS.map((host) => `http://${host}:${uiPort}`)
	);
	return origins.includes(headers.origin);
}

/** Reject untrusted requests before parsing bodies or touching workspace data. */
export function localAccess(port: number): RequestHandler {
	return (req, res, next) => {
		if (!isLocalRequest(req.headers, port)) {
			res.status(403).json({ error: 'ControlLoom accepts trusted local requests only' });
			return;
		}
		next();
	};
}
