import { afterEach, describe, expect, it, vi } from 'vitest';
import { log } from './log.js';

const originalLog = console.log;

afterEach(() => {
  console.log = originalLog;
  vi.restoreAllMocks();
});

describe('log', () => {
  it('prefixes messages with [midi-shell-commands]', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    log('Hello');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('[midi-shell-commands] Hello');
  });
});
