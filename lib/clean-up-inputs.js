import { log } from './log.js';
import { state } from './state.js';

export function cleanUpInputs() {
  for (const input of Object.values(state.watchedInputs)) {
    input.close();
  }
  log('Cleaned up midi input watchers');
}
