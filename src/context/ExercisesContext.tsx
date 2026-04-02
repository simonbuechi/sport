import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { getExercises as fetchExercises } from '../services/db';
import type { Exercise } from '../types';

interface ExercisesContextType {
    exercises: Exercise[];
    loading: boolean;
    error: string;
    loadExercises: () => Promise<void>;
    refreshExercises: () => Promise<void>;
}

const ExercisesContext = createContext<ExercisesContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useExercises = () => {
    const context = useContext(ExercisesContext);
    if (context === undefined) {
        throw new Error('useExercises must be used within an ExercisesProvider');
    }
    return context;
};

export const ExercisesProvider = ({ children }: { children: ReactNode }) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const hasFetched = useRef(false);

    const loadExercises = useCallback(async (force = false) => {
        // Return cached data if already fetched and not forced
        if (hasFetched.current && !force) return;

        try {
            setLoading(true);
            setError('');
            let data = await fetchExercises();
            
            // Add some sample gym exercises if the database is empty
            if (data.length === 0) {
                const { createExercise } = await import('../services/db');
                const sampleExercises = [
                    {
                        name: "Barbell Squat",
                        description: "A compound, full-body exercise that trains primarily the muscles of the thighs, hips and buttocks, quadriceps femoris muscle, and hamstrings.",
                        type: "strength" as const,
                        images: [],
                        connectedExercises: [],
                        videos: [],
                        resources: []
                    },
                    {
                        name: "Bench Press",
                        description: "An upper-body weight training exercise in which the trainee presses a weight upwards while lying on a weight training bench.",
                        type: "strength" as const,
                        images: [],
                        connectedExercises: [],
                        videos: [],
                        resources: []
                    },
                    {
                        name: "Treadmill Running",
                        description: "Running on a treadmill at various speeds and inclines for cardiovascular fitness.",
                        type: "cardio" as const,
                        images: [],
                        connectedExercises: [],
                        videos: [],
                        resources: []
                    }
                ];
                
                for (const exercise of sampleExercises) {
                    await createExercise(exercise);
                }
                
                data = await fetchExercises(); // Re-fetch after seeding
            }

            setExercises(data);
            hasFetched.current = true;
        } catch (err) {
            console.error(err);
            setError('Failed to load exercises.');
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshExercises = useCallback(async () => {
        await loadExercises(true);
    }, [loadExercises]);

    return (
        <ExercisesContext.Provider value={{ exercises, loading, error, loadExercises: () => loadExercises(false), refreshExercises }}>
            {children}
        </ExercisesContext.Provider>
    );
};
