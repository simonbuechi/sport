import type { ExerciseType, BodyPart, ExerciseCategory } from '../types';

export const EXERCISE_TYPES: ExerciseType[] = ['strength', 'cardio', 'flexibility', 'other'];

export const BODY_PARTS: BodyPart[] = [
    'Whole Body',
    'Legs',
    'Back',
    'Shoulders',
    'Chest',
    'Biceps',
    'Triceps',
    'Core',
    'Forearms'
];

export const CATEGORIES: ExerciseCategory[] = [
    'Bodyweight',
    'Barbell',
    'Dumbbell',
    'Machine',
    'Cable',
    'Kettlebell'
];
