export type ExerciseType = 'strength' | 'cardio' | 'flexibility' | 'other';

export type BodyPart = 'Whole Body' | 'Legs' | 'Back' | 'Shoulders' | 'Chest' | 'Biceps' | 'Triceps' | 'Core' | 'Forearms';

export type ExerciseCategory = 'Bodyweight' | 'Barbell' | 'Dumbbell' | 'Machine' | 'Cable' | 'Kettlebell';

export interface ExerciseLink {
    url: string;
    label?: string;
}

export interface Exercise {
    id: string;
    show?: boolean;
    name: string;
    name_url?: string;
    description?: string;
    type: ExerciseType;
    bodypart: BodyPart;
    category: ExerciseCategory;
    icon_url?: string;
    aliases: string[];
    links?: ExerciseLink[];
    popular?: boolean;
}

export interface MarkedStatus {
    favorite?: boolean;
    notes?: string;
}

export interface WeightEntry {
    id: string; // usually UUID or timestamp string
    date: string; // ISO string 2026-04-02
    weightKg: number;
    bodyFatPercent?: number;
}

export interface MeasurementEntry {
    id: string;
    date: string;
    waist?: number;
    hips?: number;
    neck?: number;
    chest?: number;
    shoulders?: number;
    rightBicep?: number;
    leftBicep?: number;
    rightForearm?: number;
    leftForearm?: number;
    rightThigh?: number;
    leftThigh?: number;
    rightCalf?: number;
    leftCalf?: number;
}

export interface UserProfile {
    uid: string;
    name: string;
    birthYear?: number;
    height?: number; // body height in cm
    notes: string;
    markedExercises?: Record<string, MarkedStatus>; // exerciseId -> status
    weights?: WeightEntry[];
    measurements?: MeasurementEntry[];
    dashboardWidgets?: string[];
    dashboardOrder?: string[];
    settings?: {
        theme?: 'light' | 'dark' | 'system';
        autoFillSets?: boolean;
        showTimer?: boolean;
        language?: string;
    };
    deleted?: boolean;
    deletedAt?: string;
}

export interface ExerciseSet {
    id: string; // Internal management ID
    weight?: number;
    reps?: number;
    notes?: string;
}

export interface WorkoutExercise {
    exerciseId: string;
    sets: ExerciseSet[];
    note?: string;
}

export interface TemplateExercise {
    exerciseId: string;
    note?: string;
    sets?: ExerciseSet[];
}

export interface TrainingTemplate {
    id: string;
    userId: string;
    name: string;
    notes?: string;
    isFavorite?: boolean;
    isArchived?: boolean;
    exercises: TemplateExercise[];
}

export type SessionType = ExerciseType;

export type ProgramType = 'one-time' | 'repetitive';

export interface ProgramDay {
    id: string;
    dayNumber: number; // 1-based index (Day 1, Day 2, etc.)
    date?: string; // Optional fixed calendar date (YYYY-MM-DD) for one-time programs
    templateId?: string | null; // null or undefined indicates a Rest Day
    note?: string; // Optional day note/guidance
}

export interface Program {
    id: string;
    userId: string;
    name: string;
    description?: string;
    type: ProgramType;
    days: ProgramDay[];
    isActive?: boolean;
    startDate?: string; // "YYYY-MM-DD" when program was activated
    currentDayIndex?: number; // 0-based index pointing to current day in days array
    createdAt?: string;
    updatedAt?: string;
}

export interface Workout {
    id: string;
    userId: string;
    date: string; // ISO string
    time?: string;
    length?: number; // in minutes
    sessionType?: SessionType;
    intensity?: number; // 1-5
    maxPulse?: number; // Optional max pulse
    comment: string;
    exerciseIds: string[];
    exercises: WorkoutExercise[];
    templateId?: string; // Reference to /users/{userId}/templates/{templateId}
}
