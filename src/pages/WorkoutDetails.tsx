import { useMemo } from 'react';
import PageLoader from '../components/common/PageLoader';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import DescriptionIcon from '@mui/icons-material/Description';

import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { formatWeight, formatCount, formatNumber } from '../utils/format';
import { calculate1RM } from '../utils/fitness';
import { useTranslation } from 'react-i18next';

const WorkoutDetails = () => {
    const { t, i18n } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { exercises, loading: exercisesLoading } = useExercises();
    const { entries, templates, loading: sessionsLoading } = useWorkouts();

    const workout = useMemo(() => entries.find(e => e.id === id) ?? null, [entries, id]);
    const referencedTemplate = useMemo(() => {
        if (!workout?.templateId) return null;
        return templates.find(t => t.id === workout.templateId) ?? null;
    }, [workout, templates]);

    const error = useMemo(() => {
        if (!currentUser || sessionsLoading) return '';
        return !workout ? t('journal.workoutNotFound') : '';
    }, [currentUser, sessionsLoading, workout, t]);
    const loading = sessionsLoading;

    const stats = useMemo(() => {
        if (!workout) return null;
        const workoutExercises = workout.exercises;
        
        const totals = workoutExercises.reduce((acc, we) => {
            const exerciseStats = we.sets.reduce((eAcc, set) => {
                const w = set.weight ?? 0;
                const r = set.reps ?? 0;
                return {
                    volume: eAcc.volume + (w * r),
                    reps: eAcc.reps + r,
                    sets: eAcc.sets + 1
                };
            }, { volume: 0, reps: 0, sets: 0 });
            
            return {
                volume: acc.volume + exerciseStats.volume,
                reps: acc.reps + exerciseStats.reps,
                sets: acc.sets + exerciseStats.sets,
                exercises: acc.exercises + 1
            };
        }, { volume: 0, reps: 0, sets: 0, exercises: 0 });

        // PR detection
        const prs: Record<string, number> = {}; // exerciseId -> max 1RM from other workouts
        workoutExercises.forEach(we => {
            let maxOther = 0;
            entries.forEach(entry => {
                if (entry.id === id) return; // Skip current workout
                entry.exercises.forEach(ewe => {
                    if (ewe.exerciseId === we.exerciseId) {
                        ewe.sets.forEach(s => {
                            const oneRM = calculate1RM(s.weight ?? 0, s.reps ?? 0);
                            if (oneRM > maxOther) maxOther = oneRM;
                        });
                    }
                });
            });
            prs[we.exerciseId] = maxOther;
        });

        return { totals, prs };
    }, [workout, entries, id]);

    if (loading || (exercisesLoading && exercises.length === 0)) {
        return <PageLoader />;
    }

    if (error || !workout || !stats) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ py: 3 }}>
                    <IconButton onClick={() => navigate('/journal')} sx={{ mb: 2 }} aria-label={t('common.back')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Alert severity="error">{error || t('journal.workoutNotFound')}</Alert>
                </Box>
            </Container>
        );
    }

    const workoutExercises = workout.exercises;

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Grid container spacing={1} sx={{ alignItems: 'center', width: 'auto' }}>
                        <Grid>
                            <IconButton onClick={() => navigate('/journal')} aria-label={t('common.back')}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Grid>
                        <Grid>
                            <Typography variant="h4" component="h1">
                                {t('journal.workoutDetails')}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => navigate(`/journal/${id ?? ''}/edit`)}
                    >
                        {t('common.edit')}
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {/* Summary Card */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>{t('journal.summary')}</Typography>
                            <Grid container spacing={2}>
                                <Grid size={12}>
                                    <Typography variant="caption" color="text.secondary">{t('journal.dateTime')}</Typography>
                                    <Typography variant="body1">
                                        {new Date(workout.date).toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        {workout.time && ` at ${workout.time ?? ''}`}
                                    </Typography>
                                </Grid>
                                <Grid size={12}>
                                    <Typography variant="caption" color="text.secondary">{t('journal.workoutType')}</Typography>
                                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                        {workout.sessionType ? t(`exerciseTypes.${workout.sessionType}`, { defaultValue: workout.sessionType }) : '-'}
                                    </Typography>
                                </Grid>
                                {workout.length && (
                                    <Grid size={12}>
                                        <Typography variant="caption" color="text.secondary">{t('journal.duration')}</Typography>
                                        <Typography variant="body1">{workout.length} {t('common.unitMin')}</Typography>
                                    </Grid>
                                )}
                                {workout.maxPulse && (
                                    <Grid size={12}>
                                        <Typography variant="caption" color="text.secondary">{t('journal.maxPulse')}</Typography>
                                        <Typography variant="body1">{workout.maxPulse} {t('journal.bpm')}</Typography>
                                    </Grid>
                                )}
                                {workout.comment && (
                                    <Grid size={12}>
                                        <Typography variant="caption" color="text.secondary">{t('journal.notes')}</Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{workout.comment}</Typography>
                                    </Grid>
                                )}
                                {workout.templateId && (
                                    <Grid size={12}>
                                        <Typography variant="caption" color="text.secondary">{t('journal.selectTemplate')}</Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Chip
                                                icon={<DescriptionIcon fontSize="small" />}
                                                label={referencedTemplate?.name ?? t('journal.referencedTemplate', { name: '' })}
                                                variant="outlined"
                                                color="primary"
                                                clickable
                                                onClick={() => { void navigate('/journal/templates'); }}
                                            />
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Stats Dashboard */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" sx={{ mb: 3 }}>{t('journal.performanceMetrics')}</Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>{formatNumber(stats.totals.volume)}</Typography>
                                        <Typography variant="caption" color="text.secondary">{t('journal.totalVolume')} (kg)</Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>{stats.totals.sets}</Typography>
                                        <Typography variant="caption" color="text.secondary">{t('journal.totalSets')}</Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>{stats.totals.reps}</Typography>
                                        <Typography variant="caption" color="text.secondary">{t('journal.totalReps')}</Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>{stats.totals.exercises}</Typography>
                                        <Typography variant="caption" color="text.secondary">{t('journal.totalExercises')}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Box sx={{ mt: 4, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary">{t('journal.intensityChartsComingSoon')}</Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Exercises List */}
                    <Grid size={12}>
                        <Typography variant="h5" sx={{ mt: 2, mb: 2 }}>{t('nav.exercises')}</Typography>
                        <Grid container spacing={2}>
                            {workoutExercises.map((we) => {
                                const exercise = exercises.find(ex => ex.id === we.exerciseId);
                                const exStats = we.sets.reduce((acc, s) => ({
                                    volume: acc.volume + ((s.weight ?? 0) * (s.reps ?? 0)),
                                    reps: acc.reps + (s.reps ?? 0)
                                }), { volume: 0, reps: 0 });
                                
                                return (
                                    <Grid size={12} key={we.exerciseId}>
                                        <Paper sx={{ p: 0 }}>
                                            <List sx={{ p: 0 }}>
                                                <ListItem 
                                                    component={RouterLink} 
                                                    to={`/exercises/${we.exerciseId}`}
                                                    sx={{ 
                                                        textDecoration: 'none', 
                                                        color: 'inherit',
                                                        '&:hover': { bgcolor: 'action.hover' },
                                                        p: 2
                                                    }}
                                                >
                                                    <ListItemAvatar sx={{ mr: 1 }}>
                                                        <Avatar
                                                            src={exercise?.icon_url ? `${import.meta.env.BASE_URL}exercises/${exercise.icon_url ?? ''}` : undefined}
                                                            sx={{ width: 48, height: 48 }}
                                                        >
                                                            {exercise?.name.charAt(0)}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText 
                                                        primary={<Typography variant="h6">{exercise?.name ?? t('journal.unknownExercise')}</Typography>}
                                                        secondary={`${t('journal.totalVolume')}: ${formatNumber(exStats.volume)} kg • ${t('journal.reps')}: ${String(exStats.reps)}`}
                                                    />
                                                </ListItem>
                                            </List>
                                            
                                            <Box sx={{ p: 2, pt: 0 }}>
                                                {we.note && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, pl: 1, borderLeft: '2px solid', borderColor: 'primary.main' }}>
                                                        {we.note}
                                                    </Typography>
                                                )}

                                                <Box sx={{ pl: { xs: 0, sm: 1 } }}>
                                                    <Grid container spacing={2} sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary', display: { xs: 'none', sm: 'flex' } }}>
                                                        <Grid size={1}>{t('journal.set')}</Grid>
                                                        <Grid size={2.5}>{t('journal.weight')}</Grid>
                                                        <Grid size={2.5}>{t('journal.reps')}</Grid>
                                                        <Grid size={3}>{t('exercises.estimated1RM')}</Grid>
                                                        <Grid size={3}>{t('journal.notes')}</Grid>
                                                    </Grid>
                                                    {we.sets.map((set, idx) => {
                                                        const oneRM = calculate1RM(set.weight ?? 0, set.reps ?? 0);
                                                        const isPR = oneRM > 0 && oneRM > stats.prs[we.exerciseId];
                                                        
                                                        return (
                                                            <Box key={set.id}>
                                                                <Divider sx={{ my: 1, display: { xs: 'block', sm: 'none' } }} />
                                                                <Grid container spacing={2} sx={{ alignItems: 'center', py: 0.5 }}>
                                                                    <Grid size={{ xs: 12, sm: 1 }}>
                                                                        <Typography variant="body2" sx={{ fontWeight: { xs: 'bold', sm: 'normal' } }}>
                                                                            {idx + 1}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid size={{ xs: 6, sm: 2.5 }}>
                                                                        <Typography variant="body1">
                                                                            <Box component="span" sx={{ display: { sm: 'none' }, color: 'text.secondary', mr: 1 }}>{t('journal.weight')}:</Box>
                                                                            {formatWeight(set.weight ?? 0)}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid size={{ xs: 6, sm: 2.5 }}>
                                                                        <Typography variant="body1">
                                                                            <Box component="span" sx={{ display: { sm: 'none' }, color: 'text.secondary', mr: 1 }}>{t('journal.reps')}:</Box>
                                                                            {formatCount(set.reps ?? 0)}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid size={{ xs: 12, sm: 3 }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                            <Typography variant="body1" sx={{ fontWeight: isPR ? 'bold' : 'normal', color: isPR ? 'primary.main' : 'inherit' }}>
                                                                                <Box component="span" sx={{ display: { sm: 'none' }, color: 'text.secondary', mr: 1 }}>{t('exercises.estimated1RM')}:</Box>
                                                                                {oneRM > 0 ? `${formatNumber(oneRM, 1)} kg` : '-'}
                                                                            </Typography>
                                                                            {isPR && (
                                                                                <Tooltip title={t('journal.newPersonalRecord')}>
                                                                                    <Chip 
                                                                                        label={t('journal.personalRecordBadge')} 
                                                                                        size="small" 
                                                                                        color="primary" 
                                                                                        icon={<TrendingUpIcon />} 
                                                                                        sx={{ height: 20, '& .MuiChip-label': { px: 1, fontSize: '0.65rem' } }} 
                                                                                    />
                                                                                </Tooltip>
                                                                            )}
                                                                        </Box>
                                                                    </Grid>
                                                                    <Grid size={{ xs: 12, sm: 3 }}>
                                                                        {set.notes && (
                                                                            <Typography variant="body2" color="text.secondary">
                                                                                <Box component="span" sx={{ display: { sm: 'none' }, fontWeight: 'bold', mr: 1 }}>{t('journal.notes')}:</Box>
                                                                                {set.notes}
                                                                            </Typography>
                                                                        )}
                                                                    </Grid>
                                                                </Grid>
                                                            </Box>
                                                        );
                                                    })}
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default WorkoutDetails;
