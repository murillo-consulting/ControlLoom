// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: 2026 Adrien Murillo

import flowbite from 'flowbite/plugin';

export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],
	theme: {
		extend: {
			colors: {
				loom: {
					400: '#2dd4bf',
					500: '#14b8a6',
					600: '#0d9488'
				}
			}
		}
	},
	plugins: [flowbite]
};
