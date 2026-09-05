// SPDX-License-Identifier: Apache-2.0
import type { Control, Mapping } from './types';

/** Count review work without treating self-reported mapping status as certification. */
export function summarizeWorkspace(controls: Control[], mappings: Mapping[]) {
	const byControl = new Map<string, Mapping[]>();
	for (const mapping of mappings) {
		const group = byControl.get(mapping.control_id) || [];
		group.push(mapping);
		byControl.set(mapping.control_id, group);
	}
	const uniqueControls = new Map(controls.map((control) => [control.id, control]));
	const unmapped: Control[] = [];
	const review: Control[] = [];
	let verified = 0;
	for (const control of uniqueControls.values()) {
		const linked = byControl.get(control.id) || [];
		if (linked.length === 0) unmapped.push(control);
		else if (
			linked.every(
				(mapping) =>
					mapping.status === 'verified' &&
					mapping.source_entries?.some((entry) => entry.location.trim().length > 0)
			)
		)
			verified++;
		else review.push(control);
	}
	const orphaned = mappings.filter((mapping) => !uniqueControls.has(mapping.control_id)).length;
	return { total: uniqueControls.size, unmapped, review, verified, orphaned };
}
