import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import OpenInNew from '@mui/icons-material/OpenInNew';
import LinkIcon from '@mui/icons-material/Link';
import EditNote from '@mui/icons-material/EditNote';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { getWorkouts, deleteExercise } from '../services/db';
import type { UserProfile, MarkedStatus, Workout } from '../types';
import { useAuth } from '../context/AuthContext';
import { useExercises } from '../context/ExercisesContext';
import { useUserProfile } from '../hooks/useUserProfile';
import ExerciseHeader from '../components/exercises/ExerciseHeader';
import ExerciseHistoryCard from '../components/exercises/ExerciseHistoryCard';
import ExerciseProgressChart from '../components/exercises/ExerciseProgressChart';
import { sanitizeUrl } from '../utils/security';

const updateExerciseStatus = (
    profile: UserProfile,
    exerciseId: string,
    statusUpdate: Partial<MarkedStatus>
): Record<string, MarkedStatus> => {
    const markedExercises = profile.markedExercises ?? {};
    const currentStatus = markedExercises[exerciseId] ?? {};
    const updatedStatus = { ...currentStatus, ...statusUpdate };

    const isEmpty = !updatedStatus.favorite && !updatedStatus.notes;

    const updatedMarked = { ...markedExercises };
    if (isEmpty) {
        const { [exerciseId]: _, ...rest } = updatedMarked;
        return rest;
    } else {
        updatedMarked[exerciseId] = updatedStatus;
    }
    return updatedMarked;
};

const ExerciseDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const { exercises, loading: exercisesLoading } = useExercises();
    const { profile, updateProfile, loading: profileLoading } = useUserProfile();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [notes, setNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [error, setError] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const exercise = useMemo(() => {
        if (!id || exercisesLoading) return null;
        return exercises.find(e => e.id === id) ?? null;
    }, [id, exercises, exercisesLoading]);

    const loading = exercisesLoading || profileLoading;

    useEffect(() => {
        const fetchWorkoutData = async () => {
            if (!currentUser || !id) return;
            try {
                const allEntries = await getWorkouts(currentUser.uid);
                const exerciseWorkouts = allEntries.filter((entry: Workout) =>
                    entry.exerciseIds.includes(id)
                );
                setWorkouts(exerciseWorkouts);
            } catch (err) {
                console.error(err);
                setError('Failed to load user progress data');
            }
        };

        void fetchWorkoutData();
    }, [id, currentUser]);

    useEffect(() => {
        if (profile && id) {
            setNotes(profile.markedExercises?.[id]?.notes ?? '');
        }
    }, [id, profile]);

    const handleFavoriteToggle = async () => {
        if (!currentUser || !id || !profile) return;

        try {
            const currentValue = profile.markedExercises?.[id]?.favorite ?? false;
            const updatedMarked = updateExerciseStatus(profile, id, { favorite: !currentValue });

            await updateProfile({ markedExercises: updatedMarked });
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };


    const handleSaveNotes = async () => {
        if (!currentUser || !id || !profile) return;
        const currentNotes = profile.markedExercises?.[id]?.notes ?? '';
        if (notes === currentNotes) return;

        try {
            setIsSavingNotes(true);
            const updatedMarked = updateExerciseStatus(profile, id, { notes });
            await updateProfile({ markedExercises: updatedMarked });
        } catch (err) {
            console.error("Failed to save notes", err);
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleDelete = () => {
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!id) return;

        try {
            await deleteExercise(id);
            void navigate('/exercises');
        } catch (err) {
            console.error("Failed to delete exercise", err);
            setError('Failed to delete exercise');
        } finally {
            setDeleteDialogOpen(false);
        }
    };


    if (loading) return <Stack sx={{ mt: 8 }}><CircularProgress /></Stack>;
    if (error || !exercise) return (
        <Container><Typography color="error" sx={{
            mt: 4
        }}>{error || 'Not found'}</Typography></Container>
    );

    const currentStatus = profile?.markedExercises?.[exercise.id] ?? {};

    return (
        <Container maxWidth="lg">
            <Paper elevation={0} sx={{ p: { xs: 1.5, md: 3 }, bgcolor: 'background.paper', }}>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <ExerciseHeader 
                            exercise={exercise} 
                            onDelete={handleDelete}
                            isFavorite={currentStatus.favorite ?? false}
                            onToggleFavorite={handleFavoriteToggle}
                        />

                        <Typography variant="h5" gutterBottom sx={{ mt: { xs: 2, md: 3 } }}>Description</Typography>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                            {exercise.description ?? 'No description available.'}
                        </Typography>

                        <Box sx={{ mt: { xs: 3, md: 4 } }}>
                            <ExerciseProgressChart workouts={workouts} exerciseId={exercise.id} />
                        </Box>

                        {exercise.links && exercise.links.length > 0 && (
                            <Box sx={{ mt: { xs: 2, md: 3 } }}>
                                <Typography variant="h5" gutterBottom>Links & Resources</Typography>
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
                                                    primary={link.label ?? 'Web Link'} 
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
                        <Stack direction="column" spacing={3} sx={{ position: "sticky", top: 24 }}>

                                <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 3 } }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mb: 1
                                        }}>
                                        <Stack spacing={1}>
                                            <EditNote color="primary" />
                                            <Typography variant="h6">My Notes</Typography>
                                        </Stack>
                                        {isSavingNotes && <CircularProgress size={16} />}
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <TextField
                                        multiline
                                        rows={6}
                                        fullWidth
                                        placeholder="Add your personal notes and details about this exercise..."
                                        value={notes}
                                        onChange={(e) => { setNotes(e.target.value); }}
                                        onBlur={handleSaveNotes}
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'background.default',
                                            }
                                        }}
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "text.secondary",
                                            mt: 1,
                                            display: 'block'
                                        }}>
                                        Notes are private to you and save automatically.
                                    </Typography>
                                </Paper>

                            <ExerciseHistoryCard workouts={workouts} exerciseId={exercise.id} />
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); }}>
                <DialogTitle>Delete Exercise</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete <strong>{exercise.name}</strong>? This action cannot be undone and will remove it from all templates and workouts.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setDeleteDialogOpen(false); }}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    );
};

export default ExerciseDetails;
