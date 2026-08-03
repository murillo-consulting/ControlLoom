// SPDX-License-Identifier: Apache-2.0

// SPDX-FileCopyrightText: 2026 Adrien Murillo
// Modified in 2026 by Adrien Murillo for ControlLoom.

import * as YAML from 'yaml';

/**
 * Format a value for display in diffs
 */
export function formatValue(value: any): string {
	if (value === null) return 'null';
	if (value === undefined) return 'undefined';
	if (typeof value === 'string') return `"${value}"`;
	if (typeof value === 'object') {
		return YAML.stringify(value).trim();
	}
	return String(value);
}
