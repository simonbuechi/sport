import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { subscribeToExercises } from '../services/db';
import type { Exercise } from '../types';

interface ExercisesContextType {
    exercises: Exercise[];
    loading: boolean;
    error: string;
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
    const [error] = useState('');

    useEffect(() => {
        setLoading(true);
        const unsubscribe = subscribeToExercises((data) => {
            setExercises(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <ExercisesContext.Provider value={{ 
            exercises, 
            loading, 
            error
        }}>
            {children}
        </ExercisesContext.Provider>
    );
};
