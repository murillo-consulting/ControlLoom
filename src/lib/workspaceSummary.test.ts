// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import type { Control, Mapping } from './types';
import { summarizeWorkspace } from './workspaceSummary';

const control = (id: string): Control => ({ id, title: id, family: 'AC' });
const mapping = (id: string, status: Mapping['status'], location = 'src/auth.ts'): Mapping => ({
	uuid: id,
	control_id: id,
	justification: 'Synthetic evidence',
	status,
	source_entries: [{ location }]
});

describe('workspace review summary', () => {
	it('handles an empty workspace without a fabricated percentage', () => {
		expect(summarizeWorkspace([], [])).toEqual({
			total: 0,
			unmapped: [],
			review: [],
			verified: 0,
			orphaned: 0
		});
	});
	it('counts each control once and requires every mapping to be verified with a source', () => {
		const controls = ['AC-1', 'AC-2', 'AC-3', 'AC-4'].map(control);
		const result = summarizeWorkspace(
			[...controls, controls[0]],
			[
				mapping('AC-2', 'implemented'),
				mapping('AC-2', 'verified'),
				mapping('AC-3', 'verified'),
				mapping('AC-4', 'verified', '   '),
				mapping('UNKNOWN', 'verified')
			]
		);
		expect(result.total).toBe(4);
		expect(result.unmapped.map((item) => item.id)).toEqual(['AC-1']);
		expect(result.review.map((item) => item.id)).toEqual(['AC-2', 'AC-4']);
		expect(result.verified).toBe(1);
		expect(result.orphaned).toBe(1);
	});
});
