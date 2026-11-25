import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import PageLoader from '../components/common/PageLoader';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import OpenInNew from '@mui/icons-material/OpenInNew';
import LinkIcon from '@mui/icons-material/Link';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useWorkouts } from '../context/WorkoutsContext';
import { useUserProfile } from '../context/UserProfileContext';
import ExerciseHeader from '../components/exercises/ExerciseHeader';
import ExerciseHistoryCard from '../components/exercises/ExerciseHistoryCard';
import ExerciseProgressChart from '../components/exercises/ExerciseProgressChart';
import { sanitizeUrl } from '../utils/security';
import ExerciseNotes from '../components/exercises/ExerciseNotes';
import { useTranslation } from 'react-i18next';

const ExerciseDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();

    const { exercises, loading: exercisesLoading } = useExercises();
    const { profile, updateExerciseStatus, loading: profileLoading } = useUserProfile();
    const { entries: allEntries, loading: workoutsLoading } = useWorkouts();
    const [actionError, setActionError] = useState<string | null>(null);

    const exercise = useMemo(() => {
        if (!id || exercisesLoading) return null;
        return exercises.find(e => e.id === id) ?? null;
    }, [id, exercises, exercisesLoading]);

    const workouts = useMemo(() => {
        if (!id || workoutsLoading) return [];
        return allEntries.filter(entry => entry.exerciseIds.includes(id));
    }, [id, allEntries, workoutsLoading]);

    const loading = exercisesLoading || profileLoading || workoutsLoading;

    const handleFavoriteToggle = async () => {
        if (!currentUser || !id || !profile) return;

        try {
            setActionError(null);
            const currentValue = profile.markedExercises?.[id]?.favorite ?? false;
            await updateExerciseStatus(id, { favorite: !currentValue });
        } catch {
            setActionError(t('common.error', { defaultValue: 'Failed to update favorite status' }));
        }
    };

    if (loading) return <PageLoader />;
    if (!exercise) return (
        <Container>
            <Alert severity="error">
                {t('exercises.notFound', { defaultValue: 'Not found' })}
            </Alert>
        </Container>
    );

    const currentStatus = profile?.markedExercises?.[exercise.id] ?? {};

    return (
        <Container maxWidth="lg">
            <Paper elevation={0} sx={{ p: { xs: 1.5, md: 3 }, bgcolor: 'background.paper' }}>
                {actionError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => { setActionError(null); }}>
                        {actionError}
                    </Alert>
                )}
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <ExerciseHeader
                            exercise={exercise}
                            isFavorite={currentStatus.favorite ?? false}
                            onToggleFavorite={() => { void handleFavoriteToggle(); }}
                        />

                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                            {exercise.description ?? t('exercises.noDescription')}
                        </Typography>
                        {exercise.aliases.length > 0 && (
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8, mt: 1 }}>
                                {t('exercises.alsoKnownAs')}: {exercise.aliases.join(', ')}
                            </Typography>
                        )}

                        <Box sx={{ mt: { xs: 3, md: 4 } }}>
                            <ExerciseProgressChart workouts={workouts} exerciseId={exercise.id} />
                        </Box>

                        {exercise.links && exercise.links.length > 0 && (
                            <Box sx={{ mt: { xs: 2, md: 3 } }}>
                                <Typography variant="h5" gutterBottom>{t('exercises.links')}</Typography>
                                <List sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                    {exercise.links.map((link, index) => (
                                        <Box key={index}>
                                            <ListItem
                                                component="a"
                                                href={sanitizeUrl(link.url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{
                                                    textDecoration: 'none',
                                                    color: 'inherit',
                                                    '&:hover': { bgcolor: 'action.hover' }
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <LinkIcon color="primary" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={link.label ?? t('exercises.linkLabel')}
                                                    secondary={link.url}
                                                    slotProps={{ secondary: { noWrap: true, sx: { maxWidth: '100%' } } }}
                                                />
                                                <OpenInNew fontSize="small" color="action" />
                                            </ListItem>
                                            {index < (exercise.links?.length ?? 0) - 1 && <Divider component="li" />}
                                        </Box>
                                    ))}
                                </List>
                            </Box>
                        )}
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack direction="column" spacing={3} sx={{ position: 'sticky', top: 24 }}>
                            <ExerciseNotes exerciseId={exercise.id} />
                            <ExerciseHistoryCard workouts={workouts} exerciseId={exercise.id} />
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default ExerciseDetails;
