import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cleanUpWatcher } from './clean-up-watcher.js';
import { log } from './log.js';
import { refreshScripts } from './refresh-scripts.js';
import { state } from './state.js';

export function initializeScriptsDirectory() {
  // Default to ~/Documents/MidiShellCommands if no directory is provided
  let targetDirArg = process.argv[process.argv.length - 1];
  if (process.argv.length === 2 || targetDirArg === '--daemon') {
    targetDirArg = path.join(os.homedir(), 'Documents', 'MidiShellCommands');
  }

  // Ensure the directory exists
  state.watchDir = path.resolve(targetDirArg);
  try {
    fs.mkdirSync(state.watchDir, { recursive: true });
  }
  catch (e) {
    console.error('Failed to create or access scripts directory:', state.watchDir);
    console.error(e);
    process.exit(1);
  }

  refreshScripts();
  try {
    state.watcher = fs.watch(state.watchDir, { persistent: true }, refreshScripts);
  }
  catch {
    // Non-fatal on some platforms
  }
  process.on('exit', cleanUpWatcher);

  log(`Watching ${targetDirArg}`);
}
