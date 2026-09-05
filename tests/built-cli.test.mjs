// SPDX-License-Identifier: Apache-2.0
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { once } from 'node:events';

test(
	'built CLI starts, serves the UI and rejects an untrusted origin',
	{ timeout: 40000 },
	async () => {
		const directory = await mkdtemp(join(tmpdir(), 'controlloom-smoke-'));
		await mkdir(join(directory, 'controls'));
		await writeFile(
			join(directory, 'controlloom.yaml'),
			JSON.stringify({
				name: 'Synthetic browser fixture',
				control_id_field: 'id',
				field_schema: {
					fields: {
						id: {
							type: 'string',
							ui_type: 'short_text',
							visible: true,
							display_order: 0,
							category: 'core'
						},
						title: {
							type: 'string',
							ui_type: 'short_text',
							visible: true,
							display_order: 1,
							category: 'core'
						}
					}
				}
			})
		);
		await writeFile(
			join(directory, 'controls', 'AC-1.yaml'),
			JSON.stringify({ id: 'AC-1', title: 'Access policy', family: 'AC' })
		);
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
			if (process.env.CONTROLLOOM_BROWSER_TEST === '1') {
				const { chromium } = await import('playwright');
				const browser = await chromium.launch({
					channel: process.env.CONTROLLOOM_BROWSER_CHANNEL || undefined
				});
				try {
					const page = await browser.newPage();
					const browserErrors = [];
					page.on('pageerror', (error) => browserErrors.push(error.message));
					await page.goto(url);
					await page.getByRole('heading', { name: 'Plan your next evidence review' }).waitFor();
					await page.getByRole('link', { name: 'AC-1 — Access policy' }).click();
					await page
						.getByRole('heading', { name: 'AC-1', exact: true })
						.waitFor({ timeout: 5000 })
						.catch(async (error) => {
							console.log(await page.locator('body').innerText());
							throw error;
						});
					await page.reload();
					await page
						.getByRole('heading', { name: 'AC-1', exact: true })
						.waitFor({ timeout: 5000 })
						.catch(async (error) => {
							console.log(await page.locator('body').innerText());
							throw error;
						});
					assert.deepEqual(browserErrors, []);
				} finally {
					await browser.close();
				}
			}
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
