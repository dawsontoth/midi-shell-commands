import childProcess from 'node:child_process';
import { recentlyInvoked } from './recently-invoked.js';
import { log } from './log.js';
import { mapMessageToFileNames } from './map-message-to-file-names.js';
import { reportErrors } from './report-errors.js';
import { state } from './state.js';

export function invokeScripts(msg) {
  const possibleFileNames = mapMessageToFileNames(msg);
  log(possibleFileNames[0]);
  for (const possibleFileName of possibleFileNames) {
    for (let i = 0; i < state.scriptsWithoutExtension.length; i++) {
      if (state.scriptsWithoutExtension[i] === possibleFileName) {
        if (recentlyInvoked(state.scripts[i])) {
          log('Skipping ' + state.scripts[i] + ' because it was invoked recently');
        } else {
          log('Executing ' + state.scripts[i]);
          childProcess.exec(`./${state.scripts[i]}`, { cwd: state.watchDir }, reportErrors);
        }
      }
    }
  }
}
