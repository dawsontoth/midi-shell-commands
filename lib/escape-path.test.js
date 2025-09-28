import { describe, expect, it } from 'vitest';
import { escapePath } from './escape-path.js';

describe('escapePath', () => {
  it('returns the same string when there are no spaces', () => {
    expect(escapePath('plain/path')).toBe('plain/path');
    expect(escapePath('O\'Brien')).toBe('O\'Brien');
  });

  it('wraps the path in single quotes when there are spaces', () => {
    expect(escapePath('with space')).toBe('\'with space\'');
    expect(escapePath('path/with space')).toBe('\'path/with space\'');
  });

  it('escapes single quotes inside when spaces are present', () => {
    // Standard safe shell escaping pattern for single quote inside single-quoted string is: '\''
    const input = 'O\'Brien files/test';
    const expected = '\'O\'\\\'\'Brien files/test\'';
    expect(escapePath(input)).toBe(expected);
  });

  it('handles multiple single quotes with spaces', () => {
    const input = 'a\'b c\'d e';
    const expected = '\'a\'\\\'\'b c\'\\\'\'d e\'';
    expect(escapePath(input)).toBe(expected);
  });
});
