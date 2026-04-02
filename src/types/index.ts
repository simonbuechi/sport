export type ExerciseType = 'strength' | 'cardio' | 'flexibility' | 'mobility' | 'other';

export interface Exercise {
    id: string;
    name: string;
    description: string;
    type: ExerciseType;
    images: string[];
    videos?: string[];
    resources?: string[];
    connectedExercises: string[]; // IDs of exercises this can lead to or combine with
}

export interface MarkedStatus {
    favorite?: boolean;
    learning?: boolean;
    toLearn?: boolean;
    skillLevel?: number; // 1-5
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
    markedExercises: Record<string, MarkedStatus>; // exerciseId -> status
    weights?: WeightEntry[];
    measurements?: MeasurementEntry[];
}

export type SessionType = 'Gym' | 'Run' | 'Cycle' | 'Swim' | 'Yoga' | 'Other';

export interface ActivityLog {
    id: string;
    userId: string;
    date: string; // ISO string
    time?: string;
    length?: number; // in minutes
    sessionType?: SessionType;
    intensity?: number; // 1-5
    comment: string;
    exerciseIds: string[];
}
