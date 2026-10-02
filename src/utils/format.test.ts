import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatNumber, formatWeight, formatCount, getDefaultDateTime } from './format';

describe('format utils', () => {
    describe('formatNumber', () => {
        it('formats numbers correctly', () => {
            const formatted = formatNumber(1250.55, 1);
            // Matches locale representation for 1250.5 or 1,250.5 or 1.250,5 etc.
            expect(formatted).toMatch(/1.*250[.,]6/);
        });

        it('handles string input correctly', () => {
            const formatted = formatNumber('100.5', 1);
            expect(formatted).toMatch(/100[.,]5/);
        });

        it('returns "0" for invalid or NaN inputs', () => {
            expect(formatNumber('abc')).toBe('0');
            expect(formatNumber(NaN)).toBe('0');
        });
    });

    describe('formatWeight', () => {
        it('formats weight with up to 1 fraction digit', () => {
            const formatted = formatWeight(75.25);
            expect(formatted).toMatch(/75[.,]3/);
        });
    });

    describe('formatCount', () => {
        it('formats count without fraction digits', () => {
            const formatted = formatCount(12.8);
            expect(formatted).toBe('13');
        });
    });

    describe('getDefaultDateTime', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('returns date and hour formatted using local time rather than UTC', () => {
            // Set system time to 2026-05-15 01:30:00 local time
            const localDate = new Date(2026, 4, 15, 1, 30, 0);
            vi.setSystemTime(localDate);

            const result = getDefaultDateTime();
            expect(result.date).toBe('2026-05-15');
            expect(result.time).toBe('01:00');
        });

        it('properly zero-pads single digit months, days, and hours', () => {
            const localDate = new Date(2026, 0, 5, 8, 45, 0);
            vi.setSystemTime(localDate);

            const result = getDefaultDateTime();
            expect(result.date).toBe('2026-01-05');
            expect(result.time).toBe('08:00');
        });
    });
});
