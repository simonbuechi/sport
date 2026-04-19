import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getWorkouts } from '../services/db';
import type { Workout } from '../types';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';

const ExerciseHistory = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { exercises, loading: exercisesLoading } = useExercises();

    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const exercise = useMemo(() => {
        if (!id || exercisesLoading) return null;
        return exercises.find(e => e.id === id) ?? null;
    }, [id, exercises, exercisesLoading]);

    useEffect(() => {
        const fetchWorkouts = async () => {
            if (!currentUser || !id) return;
            try {
                setLoading(true);
                const allEntries = await getWorkouts(currentUser.uid);
                // Filter and sort by date descending
                const exerciseWorkouts = allEntries
                    .filter((entry: Workout) => entry.exerciseIds.includes(id))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setWorkouts(exerciseWorkouts);
            } catch (err) {
                console.error(err);
                setError('Failed to load history');
            } finally {
                setLoading(false);
            }
        };

        void fetchWorkouts();
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
                    Total workouts: {workouts.length}
                </Typography>
            </Box>

            {workouts.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ width: '100%', overflowX: 'auto' }}>
                    <Table size="small" aria-label="exercise history table" sx={{ minWidth: 300 }}>

                        <TableBody>
                            {workouts.map(workout => {
                                const exerciseData = workout.exercises?.find(ex => ex.exerciseId === id);
                                if (!exerciseData) return null;

                                return (
                                    <TableRow
                                        key={workout.id}
                                        hover
                                        sx={{
                                            cursor: 'pointer',
                                            '&:last-child td, &:last-child th': { border: 0 }
                                        }}
                                        onClick={() => navigate(`/journal/${workout.id}`)}
                                    >
                                        <TableCell component="th" scope="row" sx={{ verticalAlign: 'top', pt: 1.5 }}>
                                            <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                                                {new Date(workout.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize', display: 'block' }}>
                                                {workout.sessionType ?? 'Workout'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ verticalAlign: 'top', pt: 1.5 }}>
                                            <Stack spacing={0.5}>
                                                {exerciseData.sets.map((set, idx) => (
                                                    <Box key={set.id} sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <Typography variant="body2">
                                                            <Box component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
                                                                {idx + 1}.
                                                            </Box>
                                                            {set.weight}kg × {set.reps}
                                                        </Typography>
                                                        {set.notes && (
                                                            <Tooltip title={set.notes} arrow placement="top">
                                                                <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', ml: 0.5, cursor: 'help' }} />
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="right" sx={{ verticalAlign: 'middle' }}>
                                            <IconButton size="small" color="primary">
                                                <ChevronRight />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Paper variant="outlined" sx={{ py: 6, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="body1" color="text.secondary">
                        No history found for this exercise.
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default ExerciseHistory;
