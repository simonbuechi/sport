import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getJournalEntries, getExercises } from '../services/db';

const UserJournalAPI = () => {
    const { userId } = useParams<{ userId: string }>();
    const [data, setData] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setError('User ID is required');
            return;
        }
        
        Promise.all([
            getJournalEntries(userId),
            getExercises()
        ])
            .then(([entries, exercises]) => {
                const exercisesMap = new Map(exercises.map((e: any) => [e.id, e.name]));
                
                const enrichedEntries = entries.map((entry: any) => {
                    const { exerciseIds, ...rest } = entry;
                    return {
                        ...rest,
                        exercises: exerciseIds ? exerciseIds.map((id: string) => exercisesMap.get(id) || id) : []
                    };
                });
                
                setData(enrichedEntries);
            })
            .catch(err => {
                setError(err.message || 'Failed to fetch journal entries');
            });
    }, [userId]);

    if (error) {
        return <pre style={{ margin: 0, padding: 16 }}>{JSON.stringify({ error }, null, 2)}</pre>;
    }

    if (!data) {
        return <pre style={{ margin: 0, padding: 16 }}>{JSON.stringify({ loading: true }, null, 2)}</pre>;
    }

    return <pre style={{ margin: 0, padding: 16 }}>{JSON.stringify(data, null, 2)}</pre>;
};

export default UserJournalAPI;
