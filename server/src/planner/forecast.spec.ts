import { describe, expect, it } from 'vitest';
import { attendance, DEFAULT_RATES, food, parking, power, seats } from './forecast.js';
describe('forecast', () => {
  it('handles empty demand', () => {
    const result = attendance(0, DEFAULT_RATES.free);
    expect(result).toMatchObject({ booked: 0, low: 0, likely: 0, high: 0 });
    expect(food([], result, DEFAULT_RATES.free).items).toEqual([]);
    expect(power(new Date('2027-01-01T10:00:00Z'), new Date('2027-01-01T11:00:00Z'), [], 0, 50, 10).peakKw).toBe(0);
  });
  it('identifies over-capacity risk', () => {
    expect(seats(110, 100, false).status).toBe('OVER');
    expect(parking([{ id: 'z', name: 'Zone', capacity: 5, booked: 10 }], DEFAULT_RATES.paid)[0].status).toBe('OVER');
  });
  it('scales occupied equipment', () => {
    const start = new Date('2027-01-01T10:00:00Z');
    const end = new Date('2027-01-01T11:00:00Z');
    const result = power(start, end, [{ name: 'AC', watts: 1000, count: 10, startAt: start, endAt: end, occupancyScaled: true }], 50, 100, 8);
    expect(result.peakKw).toBe(5);
    expect(result.points).toHaveLength(2);
  });
});
