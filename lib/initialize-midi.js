import { checkInputs } from './check-inputs.js';
import { cleanUpInputs } from './clean-up-inputs.js';

export function initializeMidi() {
  const checkDelay = 60 * 1000 + (Math.random() * 3000) | 0;
  checkInputs();
  setInterval(checkInputs, checkDelay);
  process.on('exit', cleanUpInputs);
}
