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
 * Calculates the volume of a set
 */
export const calculateSetVolume = (weight: number, reps: number): number => {
    return (weight || 0) * (reps || 0);
};
