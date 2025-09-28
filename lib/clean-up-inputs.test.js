import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanUpInputs } from './clean-up-inputs.js';
import { state } from './state.js';

const originalLog = console.log;

afterEach(() => {
  console.log = originalLog;
  vi.restoreAllMocks();
  state.watchedInputs = {};
});

describe('cleanUpInputs', () => {
  it('closes all watched inputs and logs a message', () => {
    const closeA = vi.fn();
    const closeB = vi.fn();
    state.watchedInputs = {
      a: { close: closeA },
      b: { close: closeB },
    };
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    cleanUpInputs();

    expect(closeA).toHaveBeenCalledTimes(1);
    expect(closeB).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('[midi-shell-commands] Cleaned up midi input watchers');
  });
});
