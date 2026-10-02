import { describe, it, expect } from 'vitest';
import { calculate1RM, calculateSetVolume } from './fitness';

describe('fitness utils', () => {
    describe('calculate1RM', () => {
        it('returns 0 when reps is 0 or negative', () => {
            expect(calculate1RM(100, 0)).toBe(0);
            expect(calculate1RM(100, -5)).toBe(0);
        });

        it('returns exact weight when reps is 1', () => {
            expect(calculate1RM(100, 1)).toBe(100);
            expect(calculate1RM(72.5, 1)).toBe(72.5);
        });

        it('calculates 1RM accurately using Epley formula for > 1 reps', () => {
            // Formula: weight * (1 + reps / 30)
            // 100kg for 10 reps -> 100 * (1 + 10/30) = 133.333...
            expect(calculate1RM(100, 10)).toBeCloseTo(133.333, 2);
            // 80kg for 5 reps -> 80 * (1 + 5/30) = 93.333...
            expect(calculate1RM(80, 5)).toBeCloseTo(93.333, 2);
        });

        it('handles 0 weight correctly', () => {
            expect(calculate1RM(0, 10)).toBe(0);
        });
    });

    describe('calculateSetVolume', () => {
        it('calculates total volume correctly', () => {
            expect(calculateSetVolume(100, 10)).toBe(1000);
            expect(calculateSetVolume(50.5, 8)).toBe(404);
        });

        it('returns 0 if either weight or reps is 0', () => {
            expect(calculateSetVolume(0, 10)).toBe(0);
            expect(calculateSetVolume(100, 0)).toBe(0);
        });
    });
});
