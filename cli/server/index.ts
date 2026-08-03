// SPDX-License-Identifier: Apache-2.0

// SPDX-FileCopyrightText: 2026 Adrien Murillo
// Modified in 2026 by Adrien Murillo for ControlLoom.

// Server exports
export { createServer, startServer } from './server';
export type { ServerOptions } from './server';

// State management exports
export {
	getServerState,
	initializeServerState,
	loadAllData,
	saveMappingsToFile
} from './serverState';
export type { CLIServerState } from './serverState';

// Infrastructure exports
export { FileStore } from './infrastructure/fileStore';
export { GitHistoryUtil } from './infrastructure/gitHistory';

// Type exports
export type * from './types';
