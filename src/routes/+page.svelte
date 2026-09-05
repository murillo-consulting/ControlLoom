<!-- SPDX-License-Identifier: Apache-2.0 -->

<!-- SPDX-FileCopyrightText: 2026 Adrien Murillo -->
<!-- Modified in 2026 by Adrien Murillo for ControlLoom. -->

<script lang="ts">
	import { ControlsList } from '$components/controls';
	import WorkspaceOverview from '$lib/components/WorkspaceOverview.svelte';
</script>

<!-- Left Pane: Controls List Card -->
<div class="w-1/2 flex flex-col">
	<div
		class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm h-full flex flex-col"
	>
		<ControlsList />
	</div>
</div>

<!-- Right Pane: Control Details -->
<div class="w-1/2 flex flex-col">
	<WorkspaceOverview />
</div>
