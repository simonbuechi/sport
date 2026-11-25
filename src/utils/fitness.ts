import type { ExerciseSet } from '../types';

/**
 * Calculates the estimated 1-Rep Max (1RM) using the Epley formula:
 * 1RM = weight * (1 + (reps / 30))
 *
 * @param weight The weight lifted
 * @param reps The number of repetitions performed
 * @returns The calculated 1RM
 */
export const calculate1RM = (weight: number, reps: number): number => {
    if (reps <= 0) return 0;
    if (reps === 1) return weight;
    return weight * (1 + (reps / 30));
};

/**
 * Calculates the volume of a set.
 */
export const calculateSetVolume = (weight?: number, reps?: number): number => {
    return (weight ?? 0) * (reps ?? 0);
};

/**
 * Summarizes total reps, total volume, and max estimated 1RM across a list of sets.
 */
export const summarizeExerciseSets = (sets: ExerciseSet[]): {
    totalReps: number;
    totalVolume: number;
    max1RM: number;
} => {
    let totalReps = 0;
    let totalVolume = 0;
    let max1RM = 0;

    for (const set of sets) {
        const reps = set.reps ?? 0;
        const weight = set.weight ?? 0;
        totalReps += reps;
        totalVolume += calculateSetVolume(weight, reps);
        const current1RM = calculate1RM(weight, reps);
        if (current1RM > max1RM) {
            max1RM = current1RM;
        }
    }

    return { totalReps, totalVolume, max1RM };
};
