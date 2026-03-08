import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { startDevServer } from '../../tools/dev-server.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const frameworkSrc = resolve(__dirname, '../../src');

startDevServer(projectRoot, 4300, { watchDirs: [frameworkSrc] });
