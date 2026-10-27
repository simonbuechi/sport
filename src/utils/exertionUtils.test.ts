import { describe, it, expect } from 'vitest';
import {
    rpeToRir,
    rirToRpe,
    calculateExertionValues,
    getDisplayedExertion,
    formatExertionLabel
} from './exertionUtils';

describe('exertionUtils', () => {
    describe('rpeToRir and rirToRpe', () => {
        it('converts RPE 10 to 0 RIR', () => {
            expect(rpeToRir(10)).toBe(0);
            expect(rirToRpe(0)).toBe(10);
        });

        it('converts RPE 8 to 2 RIR', () => {
            expect(rpeToRir(8)).toBe(2);
            expect(rirToRpe(2)).toBe(8);
        });

        it('converts fractional RPE 8.5 to 1.5 RIR', () => {
            expect(rpeToRir(8.5)).toBe(1.5);
            expect(rirToRpe(1.5)).toBe(8.5);
        });

        it('clamps negative values to 0', () => {
            expect(rpeToRir(12)).toBe(0);
            expect(rirToRpe(12)).toBe(0);
        });
    });

    describe('calculateExertionValues', () => {
        it('calculates both values when entered in RPE mode', () => {
            const result = calculateExertionValues(7.5, 'rpe');
            expect(result.rpe).toBe(7.5);
            expect(result.rir).toBe(2.5);
        });

        it('calculates both values when entered in RIR mode', () => {
            const result = calculateExertionValues(1, 'rir');
            expect(result.rir).toBe(1);
            expect(result.rpe).toBe(9);
        });

        it('handles undefined input cleanly', () => {
            const result = calculateExertionValues(undefined, 'rpe');
            expect(result.rpe).toBeUndefined();
            expect(result.rir).toBeUndefined();
        });
    });

    describe('getDisplayedExertion', () => {
        it('returns native rpe if present', () => {
            expect(getDisplayedExertion({ rpe: 8 }, 'rpe')).toBe(8);
        });

        it('converts rir to rpe if only rir is stored', () => {
            expect(getDisplayedExertion({ rir: 2 }, 'rpe')).toBe(8);
        });

        it('returns native rir if present', () => {
            expect(getDisplayedExertion({ rir: 3 }, 'rir')).toBe(3);
        });

        it('converts rpe to rir if only rpe is stored', () => {
            expect(getDisplayedExertion({ rpe: 8.5 }, 'rir')).toBe(1.5);
        });

        it('returns undefined if set is empty', () => {
            expect(getDisplayedExertion({}, 'rpe')).toBeUndefined();
        });
    });

    describe('formatExertionLabel', () => {
        it('formats RPE label', () => {
            expect(formatExertionLabel({ rpe: 8 }, 'rpe')).toBe('@ RPE 8');
        });

        it('formats RIR label', () => {
            expect(formatExertionLabel({ rpe: 8 }, 'rir')).toBe('@ 2 RIR');
        });

        it('returns empty string if no exertion recorded', () => {
            expect(formatExertionLabel({}, 'rpe')).toBe('');
        });
    });
});
