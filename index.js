#!/usr/bin/env node
const childProcess = require('child_process');
const easyMIDI = require('easymidi');
const fs = require('fs');
const path = require('path');

if (process.argv.length === 2) {
  console.error('Please pass the path to the directory containing your scripts.');
  process.exit(1);
}

const watchDir = path.resolve(process.argv[process.argv.length - 1]);
const scripts = fs.readdirSync(watchDir).filter(f => f[0] !== '.');
const scriptsWithoutExtension = scripts.map(script => script.split('.').slice(0, -1).join('.'));
const checkDelay = 60 * 1000 + (Math.random() * 3000) | 0;

const watchedInputs = {};
checkInputs();
setInterval(checkInputs, checkDelay);

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

process.on('exit', () => {
  for (const input of Object.values(watchedInputs)) {
    input.close();
  }
});
