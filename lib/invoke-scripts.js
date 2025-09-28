import childProcess from 'node:child_process';
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
        log('Executing ' + state.scripts[i]);
        childProcess.exec(`./${state.scripts[i]}`, { cwd: state.watchDir }, reportErrors);
      }
    }
  }
}
