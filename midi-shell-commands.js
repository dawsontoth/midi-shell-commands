#!/usr/bin/env node
import { initializeMidi } from './lib/initialize-midi.js';
import { initializeScriptsDirectory } from './lib/initialize-scripts-directory.js';
import { log } from './lib/log.js';

log('Starting up!');
initializeScriptsDirectory();
initializeMidi();
