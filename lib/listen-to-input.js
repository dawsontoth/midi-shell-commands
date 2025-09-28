import easyMIDI from 'easymidi';
import { invokeScripts } from './invoke-scripts.js';
import { state } from './state.js';

export function listenToInput(inputName) {
  if (state.watchedInputs[inputName]) {
    return;
  }
  const input = state.watchedInputs[inputName] = new easyMIDI.Input(inputName);
  input.on('noteon', invokeScripts);
  input.on('noteoff', invokeScripts);
}
