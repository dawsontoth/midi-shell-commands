#!/usr/local/bin/node
/**
 * Postinstall script to set up a macOS LaunchAgent which runs midi-shell-commands
 * pointing at ~/Documents/MidiShellCommands.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const childProcess = require('child_process');

function log(msg) {
  try {
    // Best-effort: npm may suppress some outputs; still try.
    console.log(`[midi-shell-commands] ${msg}`);
  }
  catch {}
}

(function main() {
  const platform = process.platform;
  if (platform !== 'darwin') {
    log('Postinstall daemon setup skipped (not macOS).');
    return;
  }

  const home = os.homedir();
  const scriptsDir = path.join(home, 'Documents', 'MidiShellCommands');
  try {
    fs.mkdirSync(scriptsDir, { recursive: true });
    // Add a sample README the first time, without overwriting user files.
    const readmePath = path.join(scriptsDir, 'README.txt');
    if (!fs.existsSync(readmePath)) {
      fs.writeFileSync(readmePath, 'Place executable scripts here. Names should match patterns like:\nnoteon.<note>\nnoteon.<note>.<channel>\nnoteon.<note>.<channel>.<velocity>\nMake files executable (chmod +x).');
    }
  }
  catch (e) {
    log(`Failed to create scripts directory at ${scriptsDir}: ${e.message}`);
    // Continue; LaunchAgent will still start and the app will create it on run.
  }

  // Determine bin path where npm linked the CLI
  const npmPrefix = process.env.npm_config_prefix || '';
  let binPath = '';
  if (npmPrefix) {
    // Typical global install
    binPath = path.join(npmPrefix, 'bin', 'midi-shell-commands');
  }
  if (!binPath || !fs.existsSync(binPath)) {
    // Fallback to local project binary path
    binPath = path.join(process.cwd(), 'midi-shell-commands.js');
  }

  const launchAgentsDir = path.join(home, 'Library', 'LaunchAgents');
  const label = 'com.midi-shell-commands';
  const plistPath = path.join(launchAgentsDir, `${label}.plist`);

  try {
    fs.mkdirSync(launchAgentsDir, { recursive: true });
  }
  catch (e) {
    log(`Failed to ensure LaunchAgents directory: ${e.message}`);
    return;
  }

  const stdoutPath = path.join(home, 'Library', 'Logs', 'midi-shell-commands.stdout.log');
  const stderrPath = path.join(home, 'Library', 'Logs', 'midi-shell-commands.stderr.log');

  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>${label}</string>
    <key>ProgramArguments</key>
    <array>
      <string>${binPath}</string>
      <string>${scriptsDir}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${stdoutPath}</string>
    <key>StandardErrorPath</key>
    <string>${stderrPath}</string>
    <key>EnvironmentVariables</key>
    <dict>
      <key>PATH</key>
      <string>/usr/local/bin:/usr/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
  </dict>
</plist>`;

  try {
    fs.writeFileSync(plistPath, plist, { encoding: 'utf8' });
    log(`Installed LaunchAgent at ${plistPath}`);
  }
  catch (e) {
    log(`Failed to write LaunchAgent plist: ${e.message}`);
    return;
  }

  // Try to (re)load the LaunchAgent so it starts now
  try {
    if (process.env.SUDO_UID) {
      // Avoid trying to load as root for a user agent
      log('Skipping launchctl load because running under sudo. You can load it later with your user session.');
      return;
    }

    // Unload if already loaded to pick up updates
    try {
      childProcess.execSync(`launchctl unload ${escapePath(plistPath)}`, { stdio: 'ignore' });
    }
    catch {}

    // Preferred modern approach: bootstrap into the current user session
    const uid = process.getuid && process.getuid();
    if (uid) {
      try {
        childProcess.execSync(`launchctl bootstrap gui/${uid} ${escapePath(plistPath)}`, { stdio: 'ignore' });
        log('LaunchAgent bootstrapped.');
        return;
      }
      catch {}
    }

    // Fallback to legacy load
    childProcess.execSync(`launchctl load -w ${escapePath(plistPath)}`, { stdio: 'ignore' });
    log('LaunchAgent loaded.');
  }
  catch (e) {
    log(`Could not load LaunchAgent automatically: ${e.message}\nYou can load it manually with:\n  launchctl load -w ${plistPath}`);
  }
})();

function escapePath(p) {
  // Simple shell escaping for spaces
  if (p.includes(' ')) {
    return `'${p.replace(/'/g, '\'\\\'\'')}'`;
  }
  return p;
}
