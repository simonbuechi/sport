import type { TFunction } from 'i18next';

export const getDifficultyColor = (
    diff?: string
): 'success' | 'primary' | 'warning' | 'default' => {
    switch (diff) {
        case 'beginner':
            return 'success';
        case 'intermediate':
            return 'primary';
        case 'advanced':
            return 'warning';
        default:
            return 'default';
    }
};

export const getGoalLabel = (t: TFunction, goal?: string): string | null => {
    if (!goal) return null;
    return t(`programs.goals.${goal}`, {
        defaultValue: goal.charAt(0).toUpperCase() + goal.slice(1),
    });
};

export const getDifficultyLabel = (t: TFunction, diff?: string): string | null => {
    if (!diff) return null;
    return t(`programs.difficulties.${diff}`, {
        defaultValue: diff.charAt(0).toUpperCase() + diff.slice(1),
    });
};
