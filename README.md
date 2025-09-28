# MIDI Shell Commands

Execute shell scripts when MIDI events occur.

This tool listens to all available MIDI inputs on your system and, when a MIDI note event is received, it looks for an executable file in
your scripts directory whose name matches the event. If a match is found, it runs that script.

## How it works

- On startup, the app scans the directory you provide for scripts (non-hidden files) and remembers the names without their extensions.
- It listens to MIDI inputs using the `easymidi` library.
- For each incoming note event (`noteon` or `noteoff`), it tries these filename patterns, from most specific to least specific:
  - `{_type}.{note}.{channel}.{velocity}`
  - `{_type}.{note}.{channel}`
  - `{_type}.{note}`

Where:

- `_type` is `noteon` or `noteoff`.
- `note` is a MIDI note number (0–127).
- `channel` is the MIDI channel (0–15).
- `velocity` is the event velocity (0–127).

If the base name of a script (filename without its extension) exactly matches one of those patterns, that script will be executed.

Examples based on the included sample scripts:

- `noteon.72.sh` will execute on any Note On for note 72, any channel, any velocity.
- `noteon.72.0.127.sh` will execute only for Note On of note 72 on channel 0 with velocity 127.

The application periodically checks for new MIDI input devices and will start listening to them automatically.

## Requirements

- Node.js 14+ (any modern LTS should work)
- A system with MIDI inputs accessible to Node (virtual or physical)

## Installation

1. Clone this repository.
2. Install dependencies:

   npm install

3. Ensure your scripts are executable (Unix/macOS):

   chmod +x ./scripts/*.sh

On macOS, a LaunchAgent will be installed on npm install that automatically runs this tool in the background watching
`~/Documents/MidiShellCommands` at login. See Daemon mode below.

## Usage

You can run the tool in a few ways:

- After a global install (recommended):

  midi-shell-commands ./scripts

- Using npx without installing globally:

  npx midi-shell-commands ./scripts

- Using the provided npm script (watches the `./scripts` directory):

  npm start

- Or directly with Node, specifying the path to your scripts directory:

  node midi-shell-commands.js ./scripts

Replace `./scripts` with the path to your own directory containing executable scripts.

On launch, you should see console output when a matching script is executed, for example:

Executing noteon.72.sh

## Writing scripts

- Place your executable files in the directory you pass to the app.
- Name your scripts according to one of the supported patterns. The extension can be anything; the match is done on the filename without the
  extension.
- Scripts are executed with the working directory set to the scripts directory, so relative paths within your script are relative to that
  directory.
- You can write scripts in any language available on your system (sh, bash, Python, etc.). Ensure the shebang is present and the file is
  executable.

Example Bash script (saved as `scripts/noteon.60.sh`):

```
#!/usr/bin/env bash
echo "Middle C was pressed!" >> ./midi-log.txt
```

Make it executable:

```
chmod +x scripts/noteon.60.sh
```

## Daemon mode (macOS)

- On macOS, when you run `npm install` for this package, it will:
  - Create the directory `~/Documents/MidiShellCommands` if it does not exist.
  - Install a LaunchAgent at `~/Library/LaunchAgents/com.midi-shell-commands.plist` that starts `midi-shell-commands` at login, watching
    that directory.
  - Attempt to load the LaunchAgent immediately so it begins running right away.
- Logs can be found at `~/Library/Logs/midi-shell-commands.stdout.log` and `~/Library/Logs/midi-shell-commands.stderr.log`.
- To manage the LaunchAgent manually:
  - Reload:
    `launchctl unload ~/Library/LaunchAgents/com.midi-shell-commands.plist && launchctl load -w ~/Library/LaunchAgents/com.midi-shell-commands.plist`
  - Disable autostart: `launchctl unload -w ~/Library/LaunchAgents/com.midi-shell-commands.plist`
  - Remove: delete the plist file and unload it.
- If you run `midi-shell-commands` with no arguments, it will also default to watching `~/Documents/MidiShellCommands`.

## Notes and behavior

- Only non-hidden files in the scripts directory are considered (files not starting with a dot).
- Matching is exact and case-sensitive on the base filename.
- Multiple scripts can exist; if multiple basenames match different events, each will run when its event occurs.
- If multiple files share the same basename with different extensions (e.g., `.sh`, `.py`), each event will run the one that matches by
  basename encountered in the initial directory scan order. Multiple scripts can get invoked by a single note.
- The app listens for `noteon` and `noteoff`. Other MIDI events are currently ignored.
- The process will close all MIDI inputs on exit.

## Troubleshooting

- "Please pass the path to the directory containing your scripts." — You must supply the scripts directory path as the last CLI argument (or
  use `npm start`).
- No scripts are executing:
  - Verify your file is executable (`chmod +x your-script`).
  - Double-check the filename exactly matches one of the patterns for the event you expect.
  - Confirm your MIDI device is connected and appears in your system. The app uses `easymidi.getInputs()` to enumerate inputs.
  - Add simple logging (e.g., `echo`) inside your script to verify execution.
- Permission denied when executing scripts: ensure the script has the executable bit set and that your user has permission to run it.

## Development

- Main entry: `midi-shell-commands.js`
- Dependencies: `easymidi`
- Helpful npm scripts:
  - `npm start` — starts the watcher using `./scripts` as the scripts directory.

## License

ISC