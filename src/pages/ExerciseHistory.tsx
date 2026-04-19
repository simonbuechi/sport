import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBack from '@mui/icons-material/ArrowBack';
import EventNote from '@mui/icons-material/EventNote';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { getJournalEntries } from '../services/db';
import type { ActivityLog as JournalEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';

const ExerciseHistory = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { exercises, loading: exercisesLoading } = useExercises();
    
    const [sessions, setSessions] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const exercise = useMemo(() => {
        if (!id || exercisesLoading) return null;
        return exercises.find(e => e.id === id) ?? null;
    }, [id, exercises, exercisesLoading]);

    useEffect(() => {
        const fetchSessions = async () => {
            if (!currentUser || !id) return;
            try {
                setLoading(true);
                const allEntries = await getJournalEntries(currentUser.uid);
                const exerciseSessions = allEntries.filter((entry: JournalEntry) =>
                    entry.exerciseIds.includes(id)
                );
                setSessions(exerciseSessions);
            } catch (err) {
                console.error(err);
                setError('Failed to load history');
            } finally {
                setLoading(false);
            }
        };

        void fetchSessions();
    }, [id, currentUser]);

    if (loading || exercisesLoading) return <Container sx={{ mt: 8, textAlign: 'center' }}><CircularProgress /></Container>;
    if (error || !exercise) return <Container sx={{ mt: 4 }}><Typography color="error">{error || 'Exercise not found'}</Typography></Container>;

    return (
        <Container maxWidth="md">
            <Box sx={{ mb: 4 }}>
                <Button
                    component={RouterLink}
                    to={`/exercises/${id ?? ''}`}
                    startIcon={<ArrowBack />}
                    sx={{ mb: 2 }}
                >
                    Back to Details
                </Button>
                <Typography variant="h4" component="h1" gutterBottom>
                    {exercise.name} - Full History
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Total sessions: {sessions.length}
                </Typography>
            </Box>

            <Stack spacing={2}>
                {sessions.length > 0 ? (
                    sessions.map(session => {
                        const exerciseData = session.exercises?.find(ex => ex.exerciseId === id);
                        
                        return (
                            <Paper 
                                key={session.id} 
                                variant="outlined" 
                                sx={{ 
                                    p: 2, 
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' }
                                }}
                                onClick={() => navigate(`/journal/${session.id}`)}
                            >
                                <Stack direction="row" sx={{ mb: 1.5, justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                        <EventNote color="primary" />
                                        <Box>
                                            <Typography variant="h6">
                                                {new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                                {session.sessionType ?? 'Training Session'}
                                                {session.length ? ` • ${String(session.length)} min` : ''}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <IconButton size="small">
                                        <ChevronRight />
                                    </IconButton>
                                </Stack>
                                
                                <Divider sx={{ mb: 1.5 }} />
                                
                                {exerciseData && (
                                    <Stack spacing={1}>
                                        {exerciseData.sets.map((set, idx) => (
                                            <Box key={set.id} sx={{ display: 'flex', alignItems: 'baseline' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: 60 }}>
                                                    Set {idx + 1}:
                                                </Typography>
                                                <Typography variant="body2">
                                                    {set.weight}kg x {set.reps}
                                                    {set.notes && (
                                                        <Typography component="span" variant="body2" sx={{ fontStyle: 'italic', ml: 1, color: 'text.secondary' }}>
                                                            - {set.notes}
                                                        </Typography>
                                                    )}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>
                        );
                    })
                ) : (
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                        No history found for this exercise.
                    </Typography>
                )}
            </Stack>
        </Container>
    );
};

export default ExerciseHistory;
