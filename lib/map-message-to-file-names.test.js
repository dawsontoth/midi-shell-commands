import { describe, expect, it } from 'vitest';
import { mapMessageToFileNames } from './map-message-to-file-names.js';

describe('mapMessageToFileNames', () => {
  it('returns most specific to least specific filenames', () => {
    const msg = { _type: 'noteon', note: 64, channel: 2, velocity: 127 };
    expect(mapMessageToFileNames(msg)).toEqual([
      'noteon.64.2.127',
      'noteon.64.2',
      'noteon.64',
    ]);
  });

  it('works with different message values', () => {
    const msg = { _type: 'noteoff', note: 21, channel: 0, velocity: 0 };
    expect(mapMessageToFileNames(msg)).toEqual([
      'noteoff.21.0.0',
      'noteoff.21.0',
      'noteoff.21',
    ]);
  });
});
