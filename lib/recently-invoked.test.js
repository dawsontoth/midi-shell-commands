import { describe, it, expect } from 'vitest';
import { recentlyInvoked } from './recently-invoked.js';

let keyCounter = 0;
const key = (name) => `script:${name}:${++keyCounter}`;

describe('recentlyInvoked', () => {
  it('returns false on first-ever invocation and records the time', () => {
    const script = key('first');
    const t0 = 1000;

    const first = recentlyInvoked(script, t0);
    expect(first).toBe(false);
  });

  it('returns true when invoked again within the debounce window (< 1000ms)', () => {
    const script = key('within-window');
    const t0 = 5000;

    expect(recentlyInvoked(script, t0)).toBe(false);
    expect(recentlyInvoked(script, t0 + 999)).toBe(true);
  });

  it('returns false when invoked at exactly the debounce boundary (== 1000ms)', () => {
    const script = key('boundary');
    const t0 = 10000;

    expect(recentlyInvoked(script, t0)).toBe(false);
    expect(recentlyInvoked(script, t0 + 1000)).toBe(false);
  });

  it('returns false after the debounce window and updates last invocation time', () => {
    const script = key('after-window');
    const t0 = 20000;

    expect(recentlyInvoked(script, t0)).toBe(false);
    expect(recentlyInvoked(script, t0 + 1200)).toBe(false);
    expect(recentlyInvoked(script, t0 + 1200)).toBe(true);
    expect(recentlyInvoked(script, t0 + 1200 + 500)).toBe(true);
  });

  it('debounces independently per script key', () => {
    const t0 = 30000;
    const a = key('independent-a');
    expect(recentlyInvoked(a, t0)).toBe(false);
    expect(recentlyInvoked(a, t0 + 100)).toBe(true);
    const b = key('independent-b');
    expect(recentlyInvoked(b, t0 + 100)).toBe(false);
  });
});
