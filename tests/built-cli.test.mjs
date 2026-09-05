// SPDX-License-Identifier: Apache-2.0
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { once } from 'node:events';

test(
	'built CLI starts, serves the UI and rejects an untrusted origin',
	{ timeout: 20000 },
	async () => {
		const directory = await mkdtemp(join(tmpdir(), 'controlloom-smoke-'));
		const child = spawn(
			process.execPath,
			[resolve('dist/controlloom'), 'ui', '--dir', directory, '--port', '0', '--no-open-browser'],
			{ stdio: ['ignore', 'pipe', 'pipe'] }
		);
		let output = '';
		try {
			const url = await new Promise((resolveUrl, reject) => {
				const timer = setTimeout(() => reject(new Error(`Startup timeout: ${output}`)), 10000);
				child.once('error', (error) => {
					clearTimeout(timer);
					reject(error);
				});
				child.once('exit', (code) => {
					clearTimeout(timer);
					reject(new Error(`CLI exited ${code}: ${output}`));
				});
				child.stderr.on('data', (data) => {
					output += data.toString();
				});
				child.stdout.on('data', (data) => {
					output += data.toString();
					const match = output.match(/http:\/\/localhost:(\d+)/);
					if (match) {
						clearTimeout(timer);
						resolveUrl(match[0]);
					}
				});
			});
			const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
			assert.equal(response.status, 200);
			assert.match(await response.text(), /<html/);
			const denied = await fetch(`${url}/hash`, {
				method: 'POST',
				headers: { origin: 'https://untrusted.example' },
				signal: AbortSignal.timeout(3000)
			});
			assert.equal(denied.status, 403);
		} finally {
			if (child.exitCode === null && child.signalCode === null) {
				const stopped = once(child, 'exit');
				child.kill('SIGTERM');
				await stopped;
			}
			await rm(directory, { recursive: true, force: true });
		}
	}
);
