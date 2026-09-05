<!-- SPDX-License-Identifier: Apache-2.0 -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { appState } from '$lib/websocket';
	import { summarizeWorkspace } from '$lib/workspaceSummary';
	$: summary = summarizeWorkspace($appState.controls || [], $appState.mappings || []);
</script>

<section
	aria-labelledby="workspace-overview"
	class="p-6 overflow-auto text-gray-900 dark:text-white"
>
	<p class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
		Workspace overview
	</p>
	<h2 id="workspace-overview" class="text-2xl font-semibold mt-2 mb-2">
		Plan your next evidence review
	</h2>
	<p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
		Select a control to inspect its implementation and source mappings.
	</p>
	{#if !$appState.isConnected}
		<p role="status">Connecting to the local workspace…</p>
	{:else if summary.total === 0}
		<p>No controls imported yet.</p>
		<a class="inline-block mt-3 text-blue-700 dark:text-blue-300 underline" href={resolve('/setup')}
			>Import a control catalog</a
		>
	{:else}
		<dl class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
			{#each [{ label: 'Without mappings', value: summary.unmapped.length }, { label: 'Need review', value: summary.review.length }, { label: 'Marked verified', value: summary.verified }] as item}
				<div class="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
					<dt class="text-sm text-gray-600 dark:text-gray-400">{item.label}</dt>
					<dd class="text-3xl font-semibold mt-2">{item.value}</dd>
				</div>
			{/each}
		</dl>
		<p class="text-xs text-gray-500 dark:text-gray-400 mb-6">
			Across all {summary.total} controls. “Marked verified” requires every mapping to have a source reference
			and a verified status. Source contents and freshness are not checked here.
		</p>
		{#if summary.orphaned > 0}
			<p role="status" class="mb-4 text-amber-800 dark:text-amber-300">
				{summary.orphaned} mapping(s) reference controls missing from this catalog. Check the imported
				identifiers.
			</p>
		{/if}
		<h3 class="font-semibold mb-3">Start with these controls</h3>
		<ul class="divide-y divide-gray-200 dark:divide-gray-700">
			{#each [...summary.unmapped, ...summary.review].slice(0, 5) as control (control.id)}
				<li class="py-3">
					<a
						class="text-blue-700 dark:text-blue-300 underline"
						href={resolve('/control/[id]', { id: control.id })}
						>{control.id} — {control.title || 'Untitled control'}</a
					>
				</li>
			{:else}
				<li>
					All controls have mappings marked verified. Review the evidence and its freshness before
					an audit.
				</li>
			{/each}
		</ul>
	{/if}
</section>
