import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { subscribeToWorkouts, subscribeToTemplates } from '../services/db';
import { useAuth } from './AuthContext';
import type { Workout, TrainingTemplate } from '../types';

interface WorkoutsContextType {
    entries: Workout[];
    templates: TrainingTemplate[];
    loading: boolean;
    error: string;
}

const WorkoutsContext = createContext<WorkoutsContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useWorkouts = () => {
    const context = useContext(WorkoutsContext);
    if (context === undefined) {
        throw new Error('useWorkouts must be used within a WorkoutsProvider');
    }
    return context;
};

export const WorkoutsProvider = ({ children }: { children: ReactNode }) => {
    const { currentUser } = useAuth();
    const [entries, setEntries] = useState<Workout[]>([]);
    const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!currentUser) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setEntries(prev => prev.length > 0 ? [] : prev);
            setTemplates(prev => prev.length > 0 ? [] : prev);
            setLoading(prev => prev ? false : prev);
            return;
        }

        setLoading(true);
        setError('');

        // Subscribe to workouts (limit to 1000 for global state, pages can fetch more if needed)
        const unsubscribeEntries = subscribeToWorkouts(
            currentUser.uid, 
            (data) => {
                setEntries(data);
                setLoading(false);
            }, 
            1000
        );

        // Subscribe to templates
        const unsubscribeTemplates = subscribeToTemplates(
            currentUser.uid,
            (data) => {
                setTemplates(data);
            }
        );

        return () => {
            unsubscribeEntries();
            unsubscribeTemplates();
        };
    }, [currentUser]);

    const value = useMemo(() => ({ entries, templates, loading, error }), [entries, templates, loading, error]);

    return (
        <WorkoutsContext.Provider value={value}>
            {children}
        </WorkoutsContext.Provider>
    );
};
