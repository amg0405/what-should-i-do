import { describe, it, expect } from 'vitest';
import { getTimeOfDay } from './timeOfDay';

describe('getTimeOfDay', () => {
  it('returns morning at 7am', () => {
    const d = new Date();
    d.setHours(7, 0, 0, 0);
    expect(getTimeOfDay(d)).toBe('morning');
  });
  it('returns afternoon at 2pm', () => {
    const d = new Date();
    d.setHours(14, 0, 0, 0);
    expect(getTimeOfDay(d)).toBe('afternoon');
  });
  it('returns evening at 7pm', () => {
    const d = new Date();
    d.setHours(19, 0, 0, 0);
    expect(getTimeOfDay(d)).toBe('evening');
  });
  it('returns late_night at 1am', () => {
    const d = new Date();
    d.setHours(1, 0, 0, 0);
    expect(getTimeOfDay(d)).toBe('late_night');
  });
  it('boundary: 11:59am is morning', () => {
    const d = new Date();
    d.setHours(11, 59, 0, 0);
    expect(getTimeOfDay(d)).toBe('morning');
  });
  it('boundary: 12:00pm is afternoon', () => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    expect(getTimeOfDay(d)).toBe('afternoon');
  });
});
