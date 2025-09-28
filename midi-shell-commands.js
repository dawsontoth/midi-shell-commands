#!/usr/bin/env node
import { initializeMidi } from './lib/initialize-midi.js';
import { initializeScriptsDirectory } from './lib/initialize-scripts-directory.js';

console.log('Midi Shell Commands starting up!');
initializeScriptsDirectory();
initializeMidi();
