import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import ChevronRight from '@mui/icons-material/ChevronRight';
import HistoryIcon from '@mui/icons-material/History';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { summarizeExerciseSets } from '../utils/fitness';
import { formatWeight, formatCount, parseLocalDate } from '../utils/format';
import PageHeader from '../components/common/PageHeader';
import PageLoader from '../components/common/PageLoader';
import EmptyState from '../components/common/EmptyState';
import { useTranslation } from 'react-i18next';

const ExerciseHistory = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { exercises, loading: exercisesLoading } = useExercises();
    const { entries: allEntries, loading: workoutsLoading } = useWorkouts();

    const exercise = useMemo(() => {
        if (!id || exercisesLoading) return null;
        return exercises.find(e => e.id === id) ?? null;
    }, [id, exercises, exercisesLoading]);

    const workouts = useMemo(() => {
        if (!id || workoutsLoading) return [];
        return allEntries
            .filter(entry => entry.exerciseIds.includes(id))
            .sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime());
    }, [id, allEntries, workoutsLoading]);

    const loading = exercisesLoading || workoutsLoading;

    if (loading) return <PageLoader />;
    if (!exercise) return (
        <Container maxWidth="md">
            <Alert severity="error">{t('exercises.notFound', { defaultValue: 'Exercise not found' })}</Alert>
        </Container>
    );

    return (
        <Container maxWidth="md">
            <PageHeader
                title={t('exercises.fullHistoryTitle', { name: exercise.name })}
                subtitle={t('exercises.totalWorkouts', { count: workouts.length })}
                backTo={`/exercises/${id ?? ''}`}
                backLabel={t('exercises.backToDetails')}
            />

            {workouts.length > 0 ? (
                <TableContainer component={Paper} variant="outlined" sx={{ width: '100%', overflowX: 'auto' }}>
                    <Table size="small" aria-label="exercise history table" sx={{ minWidth: 300 }}>
                        <TableBody>
                            {workouts.map(workout => {
                                const exerciseData = workout.exercises.find(ex => ex.exerciseId === id);
                                if (!exerciseData) return null;
                                const { totalReps, totalVolume, max1RM } = summarizeExerciseSets(exerciseData.sets);

                                return (
                                    <TableRow
                                        key={workout.id}
                                        hover
                                        sx={{
                                            cursor: 'pointer',
                                            '&:last-child td, &:last-child th': { border: 0 }
                                        }}
                                        onClick={() => { void navigate(`/journal/${workout.id}`); }}
                                    >
                                        <TableCell component="th" scope="row" sx={{ verticalAlign: 'top', py: 1.5 }}>
                                            <Typography variant="body2" sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                {parseLocalDate(workout.date).toLocaleDateString(i18n.language, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize', display: 'block' }}>
                                                {workout.sessionType ? t(`exerciseTypes.${workout.sessionType}`, { defaultValue: workout.sessionType }) : t('journal.workout')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell sx={{ verticalAlign: 'middle', py: 1.5 }}>
                                            <Typography variant="body2">
                                                1RM: {formatWeight(Math.round(max1RM))}kg, {t('journal.reps')}: {formatCount(totalReps)}, {t('journal.volume')}: {formatWeight(totalVolume)}kg
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ verticalAlign: 'middle' }}>
                                            <IconButton size="small" color="primary" aria-label={t('journal.workoutDetails')}>
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
                <EmptyState
                    icon={<HistoryIcon />}
                    title={t('exercises.noHistory', { defaultValue: 'No history found for this exercise.' })}
                />
            )}
        </Container>
    );
};

export default ExerciseHistory;
