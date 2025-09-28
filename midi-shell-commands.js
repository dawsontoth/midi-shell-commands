#!/usr/bin/env node
const childProcess = require('child_process');
const easyMIDI = require('easymidi');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('Midi Shell Commands starting up!');

// Default to ~/Documents/MidiShellCommands if no directory is provided
let targetDirArg = process.argv[process.argv.length - 1];
if (process.argv.length === 2 || targetDirArg === '--daemon') {
  targetDirArg = path.join(os.homedir(), 'Documents', 'MidiShellCommands');
}
console.log(`Watching ${targetDirArg}`);

const watchDir = path.resolve(targetDirArg);

// Ensure the directory exists
try {
  fs.mkdirSync(watchDir, { recursive: true });
}
catch (e) {
  console.error('Failed to create or access scripts directory:', watchDir);
  console.error(e);
  process.exit(1);
}

let scripts = [];
let scriptsWithoutExtension = [];

process.on('exit', cleanUpInputs);
refreshScripts();
try {
  fs.watch(watchDir, { persistent: true }, refreshScripts);
}
catch (e) {
  // Non-fatal on some platforms
}

const checkDelay = 60 * 1000 + (Math.random() * 3000) | 0;
const watchedInputs = {};
checkInputs();
setInterval(checkInputs, checkDelay);

function refreshScripts() {
  try {
    scripts = fs.readdirSync(watchDir).filter(f => f[0] !== '.');
    scriptsWithoutExtension = scripts.map(script => script.split('.').slice(0, -1).join('.'));
  }
  catch (e) {
    console.error('Failed to read scripts directory:', watchDir);
    console.error(e);
  }
}

function checkInputs() {
  const inputNames = easyMIDI.getInputs();
  for (const inputName of inputNames) {
    listenToInput(inputName);
  }
}

function listenToInput(inputName) {
  if (watchedInputs[inputName]) {
    return;
  }
  const input = watchedInputs[inputName] = new easyMIDI.Input(inputName);
  input.on('noteon', invokeScripts);
  input.on('noteoff', invokeScripts);
}

function invokeScripts(msg) {
  const possibleFileNames = mapMessageToFileNames(msg);
  console.log(possibleFileNames[0]);
  for (const possibleFileName of possibleFileNames) {
    for (let i = 0; i < scriptsWithoutExtension.length; i++) {
      if (scriptsWithoutExtension[i] === possibleFileName) {
        console.log('Executing ' + scripts[i]);
        childProcess.exec(`./${scripts[i]}`, { cwd: watchDir }, reportErrors);
      }
    }
  }
}

function mapMessageToFileNames(msg) {
  return [
    `${msg._type}.${msg.note}.${msg.channel}.${msg.velocity}`,
    `${msg._type}.${msg.note}.${msg.channel}`,
    `${msg._type}.${msg.note}`,
  ];
}

function reportErrors(err) {
  if (err) {
    console.error(err);
  }
}

function cleanUpInputs() {
  for (const input of Object.values(watchedInputs)) {
    input.close();
  }
}
