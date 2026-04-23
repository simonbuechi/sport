import type { UserProfile, MarkedStatus } from '../types';

/**
 * Updates an exercise's status in the user profile, handling the case where 
 * an exercise entry should be removed if it becomes empty.
 */
export const updateExerciseStatus = (
    profile: UserProfile,
    exerciseId: string,
    statusUpdate: Partial<MarkedStatus>
): Record<string, MarkedStatus> => {
    const markedExercises = profile.markedExercises ?? {};
    const currentStatus = markedExercises[exerciseId] ?? {};
    const updatedStatus = { ...currentStatus, ...statusUpdate };

    const isEmpty = !updatedStatus.favorite && !updatedStatus.notes;

    const updatedMarked = { ...markedExercises };
    if (isEmpty) {
        const { [exerciseId]: _, ...rest } = updatedMarked;
        return rest;
    } else {
        updatedMarked[exerciseId] = updatedStatus;
    }
    return updatedMarked;
};
