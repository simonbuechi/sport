import { describe, it, expect } from 'vitest';
import { updateExerciseStatus } from './exerciseUtils';
import type { UserProfile } from '../types';

describe('exerciseUtils', () => {
    const baseProfile: UserProfile = {
        uid: 'user-123',
        name: 'Athlete',
        birthYear: 1995,
        height: 180,
        notes: '',
    };

    it('adds marked status to a profile without existing markedExercises', () => {
        const result = updateExerciseStatus(baseProfile, 'bench_press', { favorite: true });
        expect(result).toEqual({
            bench_press: { favorite: true }
        });
    });

    it('updates status while preserving other exercises', () => {
        const profile: UserProfile = {
            ...baseProfile,
            markedExercises: {
                squat: { favorite: true }
            }
        };

        const result = updateExerciseStatus(profile, 'bench_press', { notes: 'Keep elbows tucked' });
        expect(result).toEqual({
            squat: { favorite: true },
            bench_press: { notes: 'Keep elbows tucked' }
        });
    });

    it('removes the exercise entry completely when favorite is false and notes is empty or undefined', () => {
        const profile: UserProfile = {
            ...baseProfile,
            markedExercises: {
                squat: { favorite: true },
                bench_press: { favorite: true }
            }
        };

        const result = updateExerciseStatus(profile, 'bench_press', { favorite: false });
        expect(result).toEqual({
            squat: { favorite: true }
        });
        expect(result.bench_press).toBeUndefined();
    });

    it('retains entry when un-favoriting if notes still exist', () => {
        const profile: UserProfile = {
            ...baseProfile,
            markedExercises: {
                bench_press: { favorite: true, notes: 'Focal cue' }
            }
        };

        const result = updateExerciseStatus(profile, 'bench_press', { favorite: false });
        expect(result.bench_press).toEqual({
            favorite: false,
            notes: 'Focal cue'
        });
    });
});
