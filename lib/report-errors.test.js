import { afterEach, describe, expect, it, vi } from 'vitest';
import { reportErrors } from './report-errors.js';

const originalError = console.error;

afterEach(() => {
  console.error = originalError;
  vi.restoreAllMocks();
});

describe('reportErrors', () => {
  it('logs when error is provided', () => {
    const err = new Error('boom');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    reportErrors(err);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe(err);
  });

  it('does nothing when error is falsy', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    reportErrors(null);
    reportErrors(undefined);
    expect(spy).not.toHaveBeenCalled();
  });
});
