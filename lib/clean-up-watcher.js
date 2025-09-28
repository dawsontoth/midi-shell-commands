import { log } from './log.js';
import { state } from './state.js';

export function cleanUpWatcher() {
  state.watcher.close();
  if (state.watcher) {
    log('Stopped watching scripts directory');
    state.watcher = undefined;
  }
}
