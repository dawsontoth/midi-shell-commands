import easyMIDI from 'easymidi';
import { listenToInput } from './listen-to-input.js';

export function checkInputs() {
  const inputNames = easyMIDI.getInputs();
  for (const inputName of inputNames) {
    listenToInput(inputName);
  }
}
