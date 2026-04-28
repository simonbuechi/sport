import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getExercisesCacheFirst } from '../services/db';
import type { Exercise } from '../types';

interface ExercisesContextType {
    exercises: Exercise[];
    loading: boolean;
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        // loading is true by default
        
        getExercisesCacheFirst().then((data) => {
            if (mounted) {
                setExercises(data);
                setLoading(false);
            }
        }).catch((err: unknown) => {
            console.error('Failed to load exercises:', err);
            if (mounted) setLoading(false);
        });

        return () => { mounted = false; };
    }, []);

    return (
        <ExercisesContext.Provider value={{ 
            exercises, 
            loading
        }}>
            {children}
        </ExercisesContext.Provider>
    );
};
