import { log } from './log.js';
import { state } from './state.js';

export function cleanUpWatcher() {
  if (state.watcher) {
    log('Stopped watching scripts directory');
    state.watcher.close();
    state.watcher = undefined;
  }
}
