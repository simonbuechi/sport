import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { subscribeToWorkouts, subscribeToTemplates } from '../services/db';
import { useAuth } from './AuthContext';
import type { Workout, TrainingTemplate } from '../types';

interface WorkoutsContextType {
    entries: Workout[];
    templates: TrainingTemplate[];
    loading: boolean;
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

    // Reset state during render if user logs out (React recommended pattern)
    const [prevUserUid, setPrevUserUid] = useState<string | null>(currentUser?.uid ?? null);
    if (currentUser?.uid !== prevUserUid) {
        if (!currentUser) {
            setEntries([]);
            setTemplates([]);
            setLoading(false);
        } else {
            setLoading(true);
        }
        setPrevUserUid(currentUser?.uid ?? null);
    }

    useEffect(() => {
        if (!currentUser) return;

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

    const value = useMemo(() => ({ entries, templates, loading }), [entries, templates, loading]);

    return (
        <WorkoutsContext.Provider value={value}>
            {children}
        </WorkoutsContext.Provider>
    );
};
