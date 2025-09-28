import fs from 'node:fs';
import { state } from './state.js';

export function refreshScripts() {
  try {
    state.scripts = fs.readdirSync(state.watchDir).filter(f => f[0] !== '.');
    state.scriptsWithoutExtension = state.scripts.map(script => script.split('.').slice(0, -1).join('.'));
  }
  catch (e) {
    console.error('Failed to read scripts directory:', state.watchDir);
    console.error(e);
  }
}
