import { describe, it, expect } from 'vitest';
import { encodeFilters, decodeFilters } from './share';
import type { Filters } from './types';

const sample: Filters = { audience: 'teen', time: '1hr', energy: 'medium', mood: 'curious' };

describe('share filter encoding', () => {
  it('round-trips a valid filters object', () => {
    const params = encodeFilters(sample);
    expect(decodeFilters(params)).toEqual(sample);
  });
  it('encodes to short keys', () => {
    const params = encodeFilters(sample);
    expect(params.get('a')).toBe('teen');
    expect(params.get('t')).toBe('1hr');
    expect(params.get('e')).toBe('medium');
    expect(params.get('m')).toBe('curious');
  });
  it('returns null on invalid input', () => {
    const params = new URLSearchParams({ a: 'lizard', t: '1hr', e: 'medium', m: 'curious' });
    expect(decodeFilters(params)).toBeNull();
  });
  it('returns null on missing params', () => {
    expect(decodeFilters(new URLSearchParams({ a: 'teen' }))).toBeNull();
  });
});
