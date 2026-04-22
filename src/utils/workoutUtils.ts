import type { TrainingTemplate } from '../types';

/**
 * Sorts templates by favorite status (favorites first) and then by name.
 */
export const sortTemplates = (templates: TrainingTemplate[]) => {
    return [...templates].sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.name.localeCompare(b.name);
    });
};
